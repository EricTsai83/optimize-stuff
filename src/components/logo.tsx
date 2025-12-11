export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <LogoIcon />
      <OptStuff />
    </div>
  );
}

const LogoIcon = () => {
  return (
    <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-lg">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="text-background"
        aria-hidden="true"
      >
        {/* 外框 - 圖片邊框 */}
        <rect
          x="1"
          y="1"
          width="22"
          height="22"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        {/* 左上箭頭 */}
        <path
          d="M6 10 L6 6 L10 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右下箭頭 */}
        <path
          d="M18 14 L18 18 L14 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 中心方塊 - 壓縮後的結果 */}
        <rect x="9" y="9" width="6" height="6" rx="2.5" fill="currentColor" />
      </svg>
    </div>
  );
};

const OptStuff = () => {
  return <span className="text-lg font-semibold tracking-tight">OptStuff</span>;
};
