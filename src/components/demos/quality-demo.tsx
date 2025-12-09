"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function QualityDemo() {
  const [quality, setQuality] = useState(80)
  const [progressive, setProgressive] = useState(true)

  const baseSize = 512
  const estimatedSize = Math.round((quality / 100) * baseSize * 0.8)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Quality Optimization</h3>
          <p className="text-sm text-muted-foreground">Fine-tune compression for the perfect balance</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated</p>
          <p className="font-mono text-sm text-accent font-semibold">{estimatedSize} KB</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Quality</Label>
              <span className="text-sm font-mono text-muted-foreground">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={(v) => setQuality(v[0])}
              min={10}
              max={100}
              step={5}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <Label htmlFor="progressive" className="font-medium text-sm">
                Progressive Loading
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Better perceived performance</p>
            </div>
            <Switch id="progressive" checked={progressive} onCheckedChange={setProgressive} />
          </div>

          <div className="p-4 bg-[#18181b] rounded-xl">
            <p className="text-xs text-[#71717a] mb-2">API URL</p>
            <code className="text-sm font-mono text-[#a1a1aa] break-all">
              /q_{quality}
              {progressive ? ",progressive" : ""}/image.jpg
            </code>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-muted/50 rounded-xl p-6 min-h-[320px]">
          <div className="relative w-64 h-48 bg-muted rounded-lg overflow-hidden ring-1 ring-border mb-4">
            <img
              src="/city-skyline-photography.jpg"
              alt="Quality demo"
              className="w-full h-full object-cover"
              style={{ filter: quality < 50 ? `blur(${(50 - quality) / 25}px)` : "none" }}
            />
            <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-mono">
              {quality}%
            </div>
          </div>
          <div className="flex gap-6 text-center text-xs">
            <div>
              <p className="font-mono font-medium text-foreground">{estimatedSize} KB</p>
              <p className="text-muted-foreground">Size</p>
            </div>
            <div>
              <p className="font-mono font-medium text-foreground">{quality}%</p>
              <p className="text-muted-foreground">Quality</p>
            </div>
            <div>
              <p className="font-mono font-medium text-accent">{Math.round((1 - estimatedSize / baseSize) * 100)}%</p>
              <p className="text-muted-foreground">Saved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
