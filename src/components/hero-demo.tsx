"use client";

import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizeDemo } from "@/components/demos/resize-demo";
import { FormatDemo } from "@/components/demos/format-demo";
import { QualityDemo } from "@/components/demos/quality-demo";
import { EffectsDemo } from "@/components/demos/effects-demo";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const demos = {
  resize: ResizeDemo,
  format: FormatDemo,
  quality: QualityDemo,
  effects: EffectsDemo,
};

type DemoKey = keyof typeof demos;

export function HeroDemo() {
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
    <section id="demo" className="pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center md:mb-16">
          <div className="bg-accent/10 text-accent animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-accent relative inline-flex h-2 w-2 rounded-full"></span>
            </span>
            Powered by
            <Link
              href="https://github.com/unjs/ipx"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link relative inline-flex items-center gap-1 font-semibold"
            >
              <span className="relative">
                🖼️ IPX
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-current transition-all duration-300 ease-out group-hover/link:w-full" />
              </span>
              <svg
                className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
          <h1
            className="animate-fade-in-up animation-delay-100 animate-on-scroll mb-6 text-4xl leading-[1.1] font-bold tracking-tight text-balance md:text-6xl lg:text-7xl"
            style={{ animationFillMode: "forwards" }}
          >
            Image optimization
            <br />
            <span className="text-muted-foreground">that just works</span>
          </h1>
          <p
            className="text-muted-foreground animate-fade-in-up animation-delay-200 animate-on-scroll mx-auto max-w-xl text-lg leading-relaxed text-pretty md:text-xl"
            style={{ animationFillMode: "forwards" }}
          >
            Transform, resize, and optimize images on-the-fly. One API for all
            your image processing needs.
          </p>
          <div
            className="animate-fade-in-up animation-delay-300 animate-on-scroll mt-10 flex items-center justify-center gap-3"
            style={{ animationFillMode: "forwards" }}
          >
            <Button
              size="lg"
              className="group h-12 rounded-full px-6 hover:shadow-xl"
            >
              Start for free
              <ArrowRight className="ml-0.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-6 hover:shadow-xl"
            >
              Documentation
            </Button>
          </div>
        </div>

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
      </div>
    </section>
  );
}
