import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ipx } from "@/lib/ipx-client";
import {
  buildBlurPlaceholderOperations,
  buildOperations,
  encodeDataUrl,
  ensureUint8Array,
  hasOperationParams,
  PLACEHOLDER_ONLY_PARAMS,
  PLACEHOLDER_PARAM,
  PLACEHOLDER_TYPE_BLUR,
} from "@/lib/image-operations";

/**
 * 恢復 URL 中被折疊的協議雙斜線
 * (例如: "https:/example.com" -> "https://example.com")
 */
function restoreProtocolSlashes(path: string): string {
  return path.replace(/^(https?:\/)([^/])/, "$1/$2");
}

/**
 * 從路徑參數中解析圖片路徑
 */
function parseImagePath(pathSegments: string[]): string {
  if (pathSegments.length === 0) {
    return "";
  }

  let imagePath = pathSegments.join("/");

  // 移除開頭的 "_/"（IPX URL 格式中表示無操作）
  if (imagePath.startsWith("_/")) {
    imagePath = imagePath.slice(2);
  }

  // 解碼 URL 編碼字符
  imagePath = decodeURIComponent(imagePath);

  // 恢復協議中的雙斜線
  imagePath = restoreProtocolSlashes(imagePath);

  return imagePath;
}

/**
 * 根據圖片格式解析 Content-Type
 */
function resolveContentType(format: string): string {
  return format === "jpeg" ? "image/jpeg" : `image/${format}`;
}

/**
 * 從 URL 中移除 placeholder 專用參數
 */
function removePlaceholderParamsFromUrl(url: URL): string {
  const normalizedUrl = new URL(url.href);
  for (const param of PLACEHOLDER_ONLY_PARAMS) {
    normalizedUrl.searchParams.delete(param);
  }
  return normalizedUrl.href;
}

/**
 * 圖片優化 API Route Handler
 *
 * 支援的功能：
 * - 圖片格式轉換 (webp, avif, jpeg, png 等)
 * - 尺寸調整 (寬度、高度、resize)
 * - 品質控制
 * - 模糊預覽圖生成 (placeholder=blur)
 * - 各種圖片效果 (模糊、銳化、旋轉等)
 *
 * @example
 * // 基本使用
 * /api/optimize/https://example.com/image.jpg?w=800&q=80
 *
 * // 生成模糊預覽圖
 * /api/optimize/https://example.com/image.jpg?placeholder=blur
 *
 * // 取得 JSON 格式的預覽圖資料
 * /api/optimize/https://example.com/image.jpg?placeholder=blur&format=json
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const resolvedParams = await params;
  const requestUrl = new URL(request.url);
  let imagePath: string | undefined;

  try {
    imagePath = parseImagePath(resolvedParams.path);

    if (!imagePath) {
      return NextResponse.json(
        { error: "Missing image path" },
        { status: 400 },
      );
    }

    const placeholderType = requestUrl.searchParams.get(PLACEHOLDER_PARAM);

    // 處理模糊預覽圖請求
    if (placeholderType === PLACEHOLDER_TYPE_BLUR) {
      const placeholderOperations = buildBlurPlaceholderOperations(
        requestUrl.searchParams,
      );

      const placeholderResult = await ipx(
        imagePath,
        placeholderOperations,
      ).process();

      const placeholderData = ensureUint8Array(placeholderResult.data);
      const placeholderMimeType = resolveContentType(
        placeholderResult.format ?? placeholderOperations.format,
      );

      // 檢查是否需要 JSON 格式的回應
      const wantJson = requestUrl.searchParams.get("format") === "json";

      if (wantJson) {
        const placeholderDataUrl = encodeDataUrl(
          placeholderData,
          placeholderMimeType,
        );
        const optimizedImageUrl = removePlaceholderParamsFromUrl(requestUrl);

        return NextResponse.json(
          {
            type: PLACEHOLDER_TYPE_BLUR,
            placeholderDataUrl,
            optimizedImageUrl,
            placeholderWidth: Number.parseInt(placeholderOperations.width, 10),
            placeholderQuality: Number.parseInt(
              placeholderOperations.quality,
              10,
            ),
            blurSigma: Number.parseInt(placeholderOperations.blur, 10),
          },
          { status: 200 },
        );
      }

      // 預設直接返回模糊圖片
      return new Response(placeholderData as Uint8Array<ArrayBuffer>, {
        status: 200,
        headers: {
          "Content-Type": placeholderMimeType,
          "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
        },
      });
    }

    // 處理無操作參數的情況
    if (!hasOperationParams(requestUrl.searchParams)) {
      const processedImage = await ipx(imagePath, {}).process();
      const imageData = ensureUint8Array(processedImage.data);
      const contentType = resolveContentType(processedImage.format ?? "webp");

      return new Response(imageData as Uint8Array<ArrayBuffer>, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
        },
      });
    }

    // 處理有操作參數的圖片優化
    const operations = buildOperations(requestUrl.searchParams);
    const processedImage = await ipx(imagePath, operations).process();
    const imageData = ensureUint8Array(processedImage.data);
    const contentType = resolveContentType(
      processedImage.format ?? operations.format ?? "webp",
    );

    return new Response(imageData as Uint8Array<ArrayBuffer>, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      imagePath,
      placeholderType: requestUrl.searchParams.get(PLACEHOLDER_PARAM),
    });

    return NextResponse.json(
      {
        error: "Image processing failed",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
