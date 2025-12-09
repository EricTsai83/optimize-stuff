"use client"

import { useState, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizeDemo } from "@/components/demos/resize-demo"
import { FormatDemo } from "@/components/demos/format-demo"
import { QualityDemo } from "@/components/demos/quality-demo"
import { EffectsDemo } from "@/components/demos/effects-demo"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const demos = {
  resize: ResizeDemo,
  format: FormatDemo,
  quality: QualityDemo,
  effects: EffectsDemo,
}

type DemoKey = keyof typeof demos

export function HeroDemo() {
  const [activeTab, setActiveTab] = useState<DemoKey>("resize")
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedTab, setDisplayedTab] = useState<DemoKey>("resize")
  const contentRef = useRef<HTMLDivElement>(null)

  const handleTabChange = (value: string) => {
    if (value === activeTab || isAnimating) return

    setIsAnimating(true)

    // Start exit animation
    if (contentRef.current) {
      contentRef.current.classList.remove("animate-tab-content-in")
      contentRef.current.classList.add("animate-tab-content-out")
    }

    // After exit animation, switch content and start enter animation
    setTimeout(() => {
      setDisplayedTab(value as DemoKey)
      setActiveTab(value as DemoKey)

      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.classList.remove("animate-tab-content-out")
          contentRef.current.classList.add("animate-tab-content-in")
        }

        setTimeout(() => {
          setIsAnimating(false)
        }, 350)
      })
    }, 200)
  }

  const ActiveDemo = demos[displayedTab]

  return (
    <section id="demo" className="pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Powered by sharp & libvips
          </div>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6 leading-[1.1] animate-fade-in-up animation-delay-100 animate-on-scroll"
            style={{ animationFillMode: "forwards" }}
          >
            Image optimization
            <br />
            <span className="text-muted-foreground">that just works</span>
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-pretty leading-relaxed animate-fade-in-up animation-delay-200 animate-on-scroll"
            style={{ animationFillMode: "forwards" }}
          >
            Transform, resize, and optimize images on-the-fly. One API for all your image processing needs.
          </p>
          <div
            className="flex items-center justify-center gap-3 mt-10 animate-fade-in-up animation-delay-300 animate-on-scroll"
            style={{ animationFillMode: "forwards" }}
          >
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 h-12 text-base group transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Start for free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-6 h-12 text-base border-border hover:bg-secondary bg-transparent transition-all duration-300 hover:scale-105"
            >
              Documentation
            </Button>
          </div>
        </div>

        <div
          className="max-w-5xl mx-auto animate-scale-in animation-delay-400 animate-on-scroll"
          style={{ animationFillMode: "forwards" }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="inline-flex h-11 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground">
                {(Object.keys(demos) as DemoKey[]).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    disabled={isAnimating}
                    className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-foreground disabled:pointer-events-none capitalize"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm transition-shadow duration-500 hover:shadow-lg overflow-hidden">
            <div ref={contentRef} className="animate-tab-content-in">
              <ActiveDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
