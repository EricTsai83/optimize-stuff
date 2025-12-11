"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResizeDemo } from "@/components/demos/resize-demo";
import { FormatDemo } from "@/components/demos/format-demo";
import { QualityDemo } from "@/components/demos/quality-demo";
import { EffectsDemo } from "@/components/demos/effects-demo";

// ============================================================================
// Constants & Types
// ============================================================================

const DEMOS = {
  resize: ResizeDemo,
  format: FormatDemo,
  quality: QualityDemo,
  effects: EffectsDemo,
} as const;

type DemoKey = keyof typeof DEMOS;

const DEMO_KEYS = Object.keys(DEMOS) as DemoKey[];
const DEFAULT_TAB: DemoKey = "resize";

const ANIMATION_DURATION = { exit: 150, enter: 250 } as const;

type AnimationPhase = "idle" | "exiting" | "entering";
type SlideDirection = "left" | "right";

type AnimationState = {
  readonly displayedTab: DemoKey;
  readonly phase: AnimationPhase;
  readonly direction: SlideDirection;
};

// ============================================================================
// Utilities
// ============================================================================

function getAnimationClass({ phase, direction }: AnimationState): string {
  if (phase === "idle") return "";
  if (phase === "exiting") {
    return direction === "left"
      ? "animate-tab-slide-out-to-left"
      : "animate-tab-slide-out-to-right";
  }
  return direction === "left"
    ? "animate-tab-slide-in-from-right"
    : "animate-tab-slide-in-from-left";
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Manages the tab indicator position based on active tab
 */
function useIndicatorPosition(
  tabsListRef: React.RefObject<HTMLDivElement | null>,
  activeTab: DemoKey,
): { left: number; width: number } {
  const [style, setStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const updateIndicator = (): void => {
      const list = tabsListRef.current;
      const tab = list?.querySelector<HTMLButtonElement>(
        `[data-state="active"]`,
      );
      if (!list || !tab) return;

      const listRect = list.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      setStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [tabsListRef, activeTab]);

  return style;
}

/**
 * Manages tab switching animation state with directional slide transitions
 */
function useTabAnimation(initialTab: DemoKey): {
  activeTab: DemoKey;
  animation: AnimationState;
  handleTabChange: (value: string) => void;
} {
  const [activeTab, setActiveTab] = useState<DemoKey>(initialTab);
  const [animation, setAnimation] = useState<AnimationState>({
    displayedTab: initialTab,
    phase: "idle",
    direction: "left",
  });

  const handleTabChange = useCallback(
    (value: string): void => {
      if (value === activeTab) return;

      const newTab = value as DemoKey;
      const direction: SlideDirection =
        DEMO_KEYS.indexOf(newTab) > DEMO_KEYS.indexOf(activeTab)
          ? "left"
          : "right";

      setActiveTab(newTab);
      setAnimation({ displayedTab: activeTab, phase: "exiting", direction });

      setTimeout(() => {
        setAnimation({ displayedTab: newTab, phase: "entering", direction });
        setTimeout(() => {
          setAnimation((prev) => ({ ...prev, phase: "idle" }));
        }, ANIMATION_DURATION.enter);
      }, ANIMATION_DURATION.exit);
    },
    [activeTab],
  );

  return { activeTab, animation, handleTabChange };
}

// ============================================================================
// Main Component
// ============================================================================

export function ImageOptimizationDemo() {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const { activeTab, animation, handleTabChange } =
    useTabAnimation(DEFAULT_TAB);
  const indicatorStyle = useIndicatorPosition(tabsListRef, activeTab);

  const ActiveDemo = DEMOS[animation.displayedTab];

  return (
    <div
      className="animate-scale-in animation-delay-400 animate-on-scroll mx-auto max-w-5xl"
      style={{ animationFillMode: "forwards" }}
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="mb-8 flex justify-center">
          <TabsList
            ref={tabsListRef}
            className="bg-muted text-muted-foreground relative h-11 rounded-full p-1"
          >
            {/* Sliding indicator */}
            <div
              className="bg-background absolute top-1 h-9 rounded-full shadow-sm transition-all duration-300 ease-out"
              style={indicatorStyle}
              aria-hidden="true"
            />
            {DEMO_KEYS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative z-10 cursor-pointer rounded-full bg-transparent px-5 py-2 text-sm font-medium capitalize shadow-none transition-colors duration-300 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="bg-card border-border overflow-hidden rounded-2xl border p-6 shadow-sm transition-shadow duration-500 hover:shadow-lg md:p-8">
          {/* Hidden TabsContent to maintain Radix accessibility */}
          {DEMO_KEYS.map((tab) => (
            <TabsContent key={tab} value={tab} className="hidden" />
          ))}
          <div className={getAnimationClass(animation)}>
            <ActiveDemo />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
