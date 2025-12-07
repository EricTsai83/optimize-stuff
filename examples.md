# Realtime Image Optimizer - 使用範例

本文檔包含所有主要使用情境和範例。

## 目錄

1. [基本圖像優化](#基本圖像優化)
2. [模糊占位符](#模糊占位符)
3. [前端整合範例](#前端整合範例)
4. [錯誤處理](#錯誤處理)

---

## 基本圖像優化

### 1. 無操作（直接返回原圖）

```bash
curl http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4
```

### 2. 調整寬度

```bash
# 寬度 800px，保持寬高比
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
```

### 3. 調整高度

```bash
# 高度 600px，保持寬高比
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?h=600"
```

### 4. 同時調整寬高 + fit 模式

當同時設置 `w` 和 `h` 時，默認使用 `fit=inside`（保持寬高比）。

```bash
# 默認行為：保持寬高比，適合 800x600 內
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600"

# cover：裁剪以填充整個區域（常用於頭像、縮略圖）
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=cover"

# fill：拉伸到精確尺寸（可能變形）
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=fill"
```

**fit 參數說明：**

| fit 值 | 行為 | 保持寬高比 | 精確尺寸 |
|--------|------|:----------:|:--------:|
| `inside` (默認) | 縮放到適合內部 | ✅ | ❌ |
| `cover` | 裁剪以填充區域 | ✅ | ✅ |
| `contain` | 完全包含，可能有空白 | ✅ | ❌ |
| `fill` | 拉伸到精確尺寸 | ❌ | ✅ |
| `outside` | 至少滿足一個維度 | ✅ | ❌ |

### 5. 格式轉換

```bash
# 轉換為 WebP（推薦，壓縮比最佳）
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?format=webp"

# 轉換為 JPEG
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?format=jpeg"

# 轉換為 PNG（支持透明度）
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?format=png"
```

### 6. 調整品質

```bash
# 品質 85（1-100，僅適用於有損格式）
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=85"
```

### 7. 組合操作

```bash
# 寬度 800px，WebP 格式，品質 85
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&format=webp&q=85"
```

---

## 模糊占位符

### 1. 基本模糊占位符（返回圖像）

```bash
# 使用默認參數（寬度 24px，品質 35，模糊強度 35）
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?placeholder=blur"
```

**HTML 直接使用：**

```html
<img src="http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?placeholder=blur" />
```

### 2. 自定義模糊占位符參數

```bash
# 自定義：寬度 32px，品質 40，模糊強度 30
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?placeholder=blur&pw=32&pq=40&pb=30"
```

**參數說明：**

| 參數 | 說明 | 默認值 |
|------|------|--------|
| `pw` | 占位符寬度（像素） | 24 |
| `pq` | 占位符品質（1-100） | 35 |
| `pb` | 模糊強度（sigma） | 35 |

### 3. 獲取 JSON 格式響應

```bash
# 返回 JSON，包含占位符 data URL 和優化圖像 URL
curl "http://localhost:3000/api/optimize/https://images.unsplash.com/photo-1506905925346-21bda4d32df4?placeholder=blur&format=json&w=800"
```

**響應格式：**

```json
{
  "type": "blur",
  "placeholderDataUrl": "data:image/webp;base64,UklGRiQAAABXRUJQ...",
  "optimizedImageUrl": "http://localhost:3000/api/optimize/https://...?w=800",
  "placeholderWidth": 24,
  "placeholderQuality": 35,
  "blurSigma": 35
}
```

---

## 前端整合範例

### Vanilla JavaScript

```javascript
// 構建優化圖像 URL
function buildOptimizedUrl(imageSrc, options = {}) {
  const { width, height, format = 'webp', quality = 85 } = options;
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (format) params.set('format', format);
  if (quality) params.set('q', quality.toString());
  
  return `http://localhost:3000/api/optimize/${imageSrc}?${params.toString()}`;
}

// 使用模糊占位符漸進式加載
async function loadWithPlaceholder(imageSrc, options = {}) {
  const { width = 800, format = 'webp' } = options;
  const baseUrl = `http://localhost:3000/api/optimize/${imageSrc}`;
  
  // 獲取占位符 JSON
  const response = await fetch(`${baseUrl}?placeholder=blur&format=json&w=${width}&format=${format}`);
  const { placeholderDataUrl, optimizedImageUrl } = await response.json();
  
  // 先顯示模糊占位符
  const img = document.createElement('img');
  img.src = placeholderDataUrl;
  img.style.filter = 'blur(20px)';
  img.style.transition = 'filter 0.3s';
  
  // 加載完整圖像後移除模糊
  const fullImage = new Image();
  fullImage.onload = () => {
    img.src = optimizedImageUrl;
    img.style.filter = 'blur(0)';
  };
  fullImage.src = optimizedImageUrl;
  
  return img;
}
```

### React

```tsx
import { useState, useEffect } from 'react';

type BlurImageProps = {
  readonly src: string;
  readonly width?: number;
  readonly format?: 'webp' | 'jpeg' | 'png';
  readonly alt?: string;
  readonly className?: string;
};

function BlurImage({ src, width = 800, format = 'webp', alt = '', className }: BlurImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [placeholder, setPlaceholder] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadImage = async () => {
      const baseUrl = `http://localhost:3000/api/optimize/${src}`;
      const params = new URLSearchParams({
        placeholder: 'blur',
        format: 'json',
        w: width.toString(),
      });

      const response = await fetch(`${baseUrl}?${params.toString()}`);
      const data = await response.json();
      
      setPlaceholder(data.placeholderDataUrl);

      // 預載完整圖像
      const fullImage = new Image();
      fullImage.onload = () => setImageSrc(data.optimizedImageUrl);
      fullImage.src = data.optimizedImageUrl;
    };

    loadImage();
  }, [src, width, format]);

  if (!placeholder) return <div>Loading...</div>;

  return (
    <img
      src={imageSrc ?? placeholder}
      alt={alt}
      className={className}
      style={{
        filter: imageSrc ? 'blur(0)' : 'blur(20px)',
        transition: 'filter 0.3s ease-in-out',
      }}
    />
  );
}
```

---

## 錯誤處理

### 常見錯誤

| 錯誤情況 | HTTP 狀態碼 | 響應 |
|---------|------------|------|
| 缺少圖像路徑 | 400 | `{ "error": "Missing image path" }` |
| 圖像處理失敗 | 500 | `{ "error": "Image processing failed", "details": "..." }` |

### 前端錯誤處理範例

```typescript
type ImageResult = 
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly error: string };

async function optimizeImage(imageSrc: string, options = {}): Promise<ImageResult> {
  try {
    const url = buildOptimizedUrl(imageSrc, options);
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      return { ok: false, error: errorData.error ?? 'Unknown error' };
    }

    return { ok: true, url };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

---

## 常用場景

### 響應式圖像

```typescript
const responsiveImages = {
  mobile: 'http://localhost:3000/api/optimize/https://example.com/image.jpg?w=400&format=webp',
  tablet: 'http://localhost:3000/api/optimize/https://example.com/image.jpg?w=800&format=webp',
  desktop: 'http://localhost:3000/api/optimize/https://example.com/image.jpg?w=1200&format=webp',
};
```

### 圖像畫廊

```typescript
const galleryImage = {
  thumbnail: 'http://localhost:3000/api/optimize/https://example.com/image.jpg?w=200&h=200&fit=cover&format=webp',
  full: 'http://localhost:3000/api/optimize/https://example.com/image.jpg?w=1920&format=webp&q=90',
};
```

---

## 注意事項

1. **緩存**：所有響應包含 `Cache-Control: public, max-age=60`
2. **格式選擇**：WebP 壓縮比最佳，JPEG 兼容性最好，PNG 支持透明度
3. **URL 編碼**：遠程 URL 會自動處理，無需手動編碼
4. **域名限制**：當前配置允許所有域名，生產環境建議限制
