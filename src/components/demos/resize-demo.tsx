"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ResizeDemo() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [fit, setFit] = useState("cover");

  const originalSize = 2.4;
  const newSize = (((width * height) / (800 * 600)) * originalSize).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resize Images</h3>
          <p className="text-muted-foreground text-sm">
            Dynamically resize to any dimension
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
            File size
          </p>
          <p className="font-mono text-sm">
            <span className="text-muted-foreground line-through">
              {originalSize} MB
            </span>
            <span className="text-muted-foreground mx-2">→</span>
            <span className="text-accent font-semibold">{newSize} MB</span>
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Width</Label>
              <span className="text-muted-foreground font-mono text-sm">
                {width}px
              </span>
            </div>
            <Slider
              value={[width]}
              onValueChange={(v) => setWidth(v[0] ?? 400)}
              min={100}
              max={800}
              step={10}
              className="**:[[role=slider]]:h-4 **:[[role=slider]]:w-4"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Height</Label>
              <span className="text-muted-foreground font-mono text-sm">
                {height}px
              </span>
            </div>
            <Slider
              value={[height]}
              onValueChange={(v) => setHeight(v[0] ?? 300)}
              min={100}
              max={600}
              step={10}
              className="**:[[role=slider]]:h-4 **:[[role=slider]]:w-4"
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

          <div className="rounded-xl bg-[#18181b] p-4">
            <p className="mb-2 text-xs text-[#71717a]">API URL</p>
            <code className="font-mono text-sm break-all text-[#a1a1aa]">
              /s_{width}x{height},fit_{fit}/image.jpg
            </code>
          </div>
        </div>

        <div className="bg-muted/50 flex min-h-[320px] items-center justify-center rounded-xl p-6">
          <div
            className="bg-muted ring-border overflow-hidden rounded-lg ring-1 transition-all duration-300"
            style={{
              width: Math.min(width, 350),
              height: Math.min(height, 250),
            }}
          >
            <img
              src={`/generic-placeholder-icon.png?height=${height}&width=${width}&query=mountain landscape photography`}
              alt="Sample resized image"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
