# 圖片優化 API 使用指南

基於 [IPX](https://github.com/unjs/ipx) 的高效能圖片優化服務。

## URL 格式

```
/api/optimize/{operations}/{image_url}
```

## 快速範例

```bash
# 設定寬度 800px
/api/optimize/w_800/https://example.com/image.jpg

# WebP 格式 + 品質 80
/api/optimize/f_webp,q_80/https://example.com/image.jpg

# 調整尺寸 + 裁剪
/api/optimize/s_400x300,fit_cover/https://example.com/image.jpg

# 無操作（原圖）
/api/optimize/_/https://example.com/image.jpg
```

## 常用操作

| 操作 | 說明 | 範例 |
|------|------|------|
| `w_{n}` | 寬度 | `w_800` |
| `h_{n}` | 高度 | `h_600` |
| `s_{w}x{h}` | 尺寸 | `s_800x600` |
| `q_{n}` | 品質 | `q_80` |
| `f_{format}` | 格式 | `f_webp`, `f_avif` |
| `fit_{mode}` | 適應 | `fit_cover` |
| `_` | 無操作 | `_` |

## 完整文檔

所有支援的操作參數請參考 IPX 官方文檔：

👉 **[https://github.com/unjs/ipx](https://github.com/unjs/ipx)**

## React 使用範例

```tsx
const OptimizedImage = ({ src }: { readonly src: string }) => {
  return (
    <img
      src={`/api/optimize/w_800,f_webp,q_80/${src}`}
      alt="Optimized"
      loading="lazy"
    />
  );
};
```
