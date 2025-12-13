"use client";

import { cn } from "@/lib/utils";
import {
  Zap,
  Shield,
  Globe,
  Code,
  Layers,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Feature = {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly animation?: string;
};

const features: readonly Feature[] = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built on sharp and libvips for sub-millisecond image processing.",
    animation: "icon-zap",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "Domain whitelisting and signed URLs prevent unauthorized access.",
    animation: "icon-shield",
  },
  {
    icon: Globe,
    title: "Edge Optimized",
    description: "Deploy globally with automatic caching at the edge.",
    animation: "icon-globe",
  },
  {
    icon: Code,
    title: "Simple API",
    description: "URL-based modifiers for resize, crop, format, and more.",
    animation: "icon-code",
  },
  {
    icon: Layers,
    title: "Format Support",
    description: "WebP, AVIF, JPEG, PNG, GIF, and SVG optimization.",
    animation: "icon-layers",
  },
  {
    icon: ImageIcon,
    title: "Auto Optimization",
    description: "Intelligent format selection based on browser support.",
    animation: "icon-image",
  },
];

export function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [animatedCards, setAnimatedCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleAnimationEnd = (index: number): void => {
    setAnimatedCards((prev) => [...new Set([...prev, index])]);
  };

  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        },
        { threshold: 0.2 },
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section id="features" className="bg-background py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <p className="text-accent animate-fade-in mb-3 font-medium">
            Features
          </p>
          <h2 className="animate-fade-in-up animation-delay-100 mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need
          </h2>
          <p className="text-muted-foreground animate-fade-in-up animation-delay-200 mx-auto max-w-lg">
            Powerful features for developers who care about performance.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={cn(
                "group rounded-2xl border border-transparent p-6",
                "hover:border-border hover:bg-muted/30",
                animatedCards.includes(index)
                  ? "feature-card-hover opacity-100"
                  : visibleCards.includes(index)
                    ? "animate-feature-card-enter"
                    : "opacity-0",
              )}
              onAnimationEnd={() => handleAnimationEnd(index)}
              style={{
                animationDelay: visibleCards.includes(index)
                  ? `${index * 100}ms`
                  : undefined,
              }}
            >
              <div
                className={cn(
                  "bg-muted group-hover:bg-accent/10 mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500",
                  `icon-container-${feature.animation}`,
                )}
              >
                <feature.icon
                  className={cn(
                    "text-muted-foreground group-hover:text-accent h-5 w-5 transition-colors duration-300",
                    feature.animation,
                  )}
                />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
