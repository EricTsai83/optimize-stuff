/** Placeholder 類型常量 */
export const PLACEHOLDER_PARAM = "placeholder" as const;
export const PLACEHOLDER_TYPE_BLUR = "blur" as const;
export const PLACEHOLDER_WIDTH_PARAM = "placeholderWidth" as const;
export const PLACEHOLDER_QUALITY_PARAM = "placeholderQuality" as const;
export const PLACEHOLDER_BLUR_PARAM = "placeholderBlur" as const;

/** 預設值 */
const DEFAULT_PLACEHOLDER_WIDTH = "32";
const DEFAULT_PLACEHOLDER_QUALITY = "50";
const DEFAULT_PLACEHOLDER_BLUR = "3";
const DEFAULT_FORMAT = "webp";

/** Placeholder 專用的參數列表 */
export const PLACEHOLDER_ONLY_PARAMS: readonly string[] = [
  PLACEHOLDER_PARAM,
  PLACEHOLDER_WIDTH_PARAM,
  PLACEHOLDER_QUALITY_PARAM,
  PLACEHOLDER_BLUR_PARAM,
];

/** 支援的圖片操作參數 */
const OPERATION_PARAMS = [
  "w",
  "width",
  "h",
  "height",
  "s",
  "resize",
  "q",
  "quality",
  "f",
  "format",
  "fit",
  "pos",
  "position",
  "blur",
  "sharpen",
  "rotate",
  "flip",
  "flop",
  "grayscale",
  "trim",
  "extend",
  "extract",
  "background",
  "b",
  "kernel",
  "enlarge",
  "median",
  "gamma",
  "negate",
  "normalize",
  "threshold",
  "tint",
  "animated",
] as const;

type ImageOperations = Record<string, string | undefined>;

/**
 * 檢查是否有任何操作參數
 */
export function hasOperationParams(searchParams: URLSearchParams): boolean {
  for (const param of OPERATION_PARAMS) {
    if (searchParams.has(param)) {
      return true;
    }
  }
  return false;
}

/**
 * 從 URL 參數建構 IPX 操作物件
 */
export function buildOperations(
  searchParams: URLSearchParams,
): ImageOperations {
  const operations: ImageOperations = {};

  // 寬度
  const width = searchParams.get("w") ?? searchParams.get("width");
  if (width) {
    operations.width = width;
  }

  // 高度
  const height = searchParams.get("h") ?? searchParams.get("height");
  if (height) {
    operations.height = height;
  }

  // 調整大小 (寬x高)
  const resize = searchParams.get("s") ?? searchParams.get("resize");
  if (resize) {
    operations.resize = resize;
  }

  // 品質
  const quality = searchParams.get("q") ?? searchParams.get("quality");
  if (quality) {
    operations.quality = quality;
  }

  // 格式
  const format = searchParams.get("f") ?? searchParams.get("format");
  if (format) {
    operations.format = format;
  } else {
    // 預設使用 webp 格式
    operations.format = DEFAULT_FORMAT;
  }

  // 適應方式
  const fit = searchParams.get("fit");
  if (fit) {
    operations.fit = fit;
  }

  // 位置
  const position = searchParams.get("pos") ?? searchParams.get("position");
  if (position) {
    operations.position = position;
  }

  // 模糊
  const blur = searchParams.get("blur");
  if (blur) {
    operations.blur = blur;
  }

  // 銳化
  const sharpen = searchParams.get("sharpen");
  if (sharpen) {
    operations.sharpen = sharpen;
  }

  // 旋轉
  const rotate = searchParams.get("rotate");
  if (rotate) {
    operations.rotate = rotate;
  }

  // 垂直翻轉
  if (searchParams.has("flip")) {
    operations.flip = "true";
  }

  // 水平翻轉
  if (searchParams.has("flop")) {
    operations.flop = "true";
  }

  // 灰階
  if (searchParams.has("grayscale")) {
    operations.grayscale = "true";
  }

  // 裁剪邊緣
  const trim = searchParams.get("trim");
  if (trim) {
    operations.trim = trim;
  }

  // 擴展
  const extend = searchParams.get("extend");
  if (extend) {
    operations.extend = extend;
  }

  // 擷取區域
  const extract = searchParams.get("extract");
  if (extract) {
    operations.extract = extract;
  }

  // 背景顏色
  const background = searchParams.get("b") ?? searchParams.get("background");
  if (background) {
    operations.background = background;
  }

  // 縮放演算法
  const kernel = searchParams.get("kernel");
  if (kernel) {
    operations.kernel = kernel;
  }

  // 允許放大
  if (searchParams.has("enlarge")) {
    operations.enlarge = "true";
  }

  // 中值濾波
  const median = searchParams.get("median");
  if (median) {
    operations.median = median;
  }

  // Gamma 校正
  const gamma = searchParams.get("gamma");
  if (gamma) {
    operations.gamma = gamma;
  }

  // 負片效果
  if (searchParams.has("negate")) {
    operations.negate = "true";
  }

  // 正規化
  if (searchParams.has("normalize")) {
    operations.normalize = "true";
  }

  // 閾值
  const threshold = searchParams.get("threshold");
  if (threshold) {
    operations.threshold = threshold;
  }

  // 染色
  const tint = searchParams.get("tint");
  if (tint) {
    operations.tint = tint;
  }

  // 動畫圖片
  if (searchParams.has("animated")) {
    operations.animated = "true";
  }

  return operations;
}

type BlurPlaceholderOperations = {
  readonly width: string;
  readonly quality: string;
  readonly blur: string;
  readonly format: string;
};

/**
 * 建構模糊預覽圖的操作參數
 */
export function buildBlurPlaceholderOperations(
  searchParams: URLSearchParams,
): BlurPlaceholderOperations {
  const width =
    searchParams.get(PLACEHOLDER_WIDTH_PARAM) ?? DEFAULT_PLACEHOLDER_WIDTH;
  const quality =
    searchParams.get(PLACEHOLDER_QUALITY_PARAM) ?? DEFAULT_PLACEHOLDER_QUALITY;
  const blur =
    searchParams.get(PLACEHOLDER_BLUR_PARAM) ?? DEFAULT_PLACEHOLDER_BLUR;

  return {
    width,
    quality,
    blur,
    format: DEFAULT_FORMAT,
  };
}

/**
 * 確保資料為 Uint8Array 格式
 */
export function ensureUint8Array(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  if (Buffer.isBuffer(data)) {
    return new Uint8Array(data);
  }
  throw new Error("Unsupported data type for image processing");
}

/**
 * 將圖片資料編碼為 Data URL
 */
export function encodeDataUrl(data: Uint8Array, mimeType: string): string {
  const base64 = Buffer.from(data).toString("base64");
  return `data:${mimeType};base64,${base64}`;
}
