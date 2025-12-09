"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ResizeDemo() {
  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(300)
  const [fit, setFit] = useState("cover")

  const originalSize = 2.4
  const newSize = (((width * height) / (800 * 600)) * originalSize).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Resize Images</h3>
          <p className="text-sm text-muted-foreground">Dynamically resize to any dimension</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">File size</p>
          <p className="font-mono text-sm">
            <span className="text-muted-foreground line-through">{originalSize} MB</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="text-accent font-semibold">{newSize} MB</span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Width</Label>
              <span className="text-sm font-mono text-muted-foreground">{width}px</span>
            </div>
            <Slider
              value={[width]}
              onValueChange={(v) => setWidth(v[0])}
              min={100}
              max={800}
              step={10}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Height</Label>
              <span className="text-sm font-mono text-muted-foreground">{height}px</span>
            </div>
            <Slider
              value={[height]}
              onValueChange={(v) => setHeight(v[0])}
              min={100}
              max={600}
              step={10}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm">Fit Mode</Label>
            <Select value={fit} onValueChange={setFit}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
                <SelectItem value="inside">Inside</SelectItem>
                <SelectItem value="outside">Outside</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-[#18181b] rounded-xl">
            <p className="text-xs text-[#71717a] mb-2">API URL</p>
            <code className="text-sm font-mono text-[#a1a1aa] break-all">
              /s_{width}x{height},fit_{fit}/image.jpg
            </code>
          </div>
        </div>

        <div className="flex items-center justify-center bg-muted/50 rounded-xl p-6 min-h-[320px]">
          <div
            className="bg-muted rounded-lg overflow-hidden transition-all duration-300 ring-1 ring-border"
            style={{ width: Math.min(width, 350), height: Math.min(height, 250) }}
          >
            <img
              src={`/generic-placeholder-icon.png?height=${height}&width=${width}&query=mountain landscape photography`}
              alt="Sample resized image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
