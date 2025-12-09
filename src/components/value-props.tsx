"use client";

import { Unlock, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ValueProps() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16">
          <div
            className={`bg-secondary/50 hover:bg-secondary/70 relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
              isVisible ? "animate-slide-in-left" : "opacity-0"
            }`}
          >
            <div className="bg-foreground mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <Unlock className="text-background h-5 w-5" />
            </div>
            <h3 className="text-foreground mb-3 text-xl font-semibold">
              Zero vendor lock-in
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Built on open-source IPX and sharp. Self-host anywhere, migrate
              anytime. Your images, your infrastructure, your rules.
            </p>
          </div>

          <div
            className={`bg-secondary/50 hover:bg-secondary/70 relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
              isVisible ? "animate-slide-in-right" : "opacity-0"
            }`}
            style={{ animationDelay: "150ms" }}
          >
            <div className="bg-accent animate-pulse-soft mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <Zap className="text-accent-foreground h-5 w-5" />
            </div>
            <h3 className="text-foreground mb-3 text-xl font-semibold">
              Go live in minutes
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {`Drop in a single middleware, point your images to our endpoint, and you're done. No build steps, no config
              files required.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
