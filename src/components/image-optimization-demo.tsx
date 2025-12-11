"use client";

import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizeDemo } from "@/components/demos/resize-demo";
import { FormatDemo } from "@/components/demos/format-demo";
import { QualityDemo } from "@/components/demos/quality-demo";
import { EffectsDemo } from "@/components/demos/effects-demo";

const demos = {
  resize: ResizeDemo,
  format: FormatDemo,
  quality: QualityDemo,
  effects: EffectsDemo,
};

type DemoKey = keyof typeof demos;

export function ImageOptimizationDemo() {
  const [activeTab, setActiveTab] = useState<DemoKey>("resize");
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedTab, setDisplayedTab] = useState<DemoKey>("resize");
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (value: string) => {
    if (value === activeTab || isAnimating) return;

    setIsAnimating(true);

    // Start exit animation
    if (contentRef.current) {
      contentRef.current.classList.remove("animate-tab-content-in");
      contentRef.current.classList.add("animate-tab-content-out");
    }

    // After exit animation, switch content and start enter animation
    setTimeout(() => {
      setDisplayedTab(value as DemoKey);
      setActiveTab(value as DemoKey);

      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.classList.remove("animate-tab-content-out");
          contentRef.current.classList.add("animate-tab-content-in");
        }

        setTimeout(() => {
          setIsAnimating(false);
        }, 350);
      });
    }, 200);
  };

  const ActiveDemo = demos[displayedTab];

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
          <TabsList className="bg-muted text-muted-foreground inline-flex h-11 items-center justify-center rounded-full p-1">
            {(Object.keys(demos) as DemoKey[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                disabled={isAnimating}
                className="data-[state=active]:bg-background data-[state=active]:text-foreground hover:text-foreground rounded-full px-5 py-2 text-sm font-medium capitalize transition-all duration-300 disabled:pointer-events-none data-[state=active]:shadow-sm"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <div className="bg-card border-border overflow-hidden rounded-2xl border p-6 shadow-sm transition-shadow duration-500 hover:shadow-lg md:p-8">
        <div ref={contentRef} className="animate-tab-content-in">
          <ActiveDemo />
        </div>
      </div>
    </div>
  );
}
