"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

const formats = [
  { value: "webp", label: "WebP", size: "142 KB", savings: "72%", supported: true },
  { value: "avif", label: "AVIF", size: "98 KB", savings: "81%", supported: true },
  { value: "jpeg", label: "JPEG", size: "320 KB", savings: "37%", supported: true },
  { value: "png", label: "PNG", size: "512 KB", savings: "0%", supported: true },
]

export function FormatDemo() {
  const [format, setFormat] = useState("webp")
  const selectedFormat = formats.find((f) => f.value === format)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Format Conversion</h3>
          <p className="text-sm text-muted-foreground">Convert to modern formats like WebP and AVIF</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Original: 512 KB</p>
          <p className="font-mono text-sm text-accent font-semibold">{selectedFormat?.savings} smaller</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label className="text-sm">Output Format</Label>
          <RadioGroup value={format} onValueChange={setFormat} className="space-y-2">
            {formats.map((f) => (
              <div
                key={f.value}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  format === f.value ? "border-accent bg-accent/5" : "border-transparent bg-muted/50 hover:bg-muted"
                }`}
                onClick={() => setFormat(f.value)}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={f.value} id={f.value} className="border-muted-foreground" />
                  <Label htmlFor={f.value} className="cursor-pointer font-medium">
                    {f.label}
                  </Label>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{f.size}</p>
                  <p className="text-xs text-muted-foreground">{f.savings} savings</p>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="p-4 bg-[#18181b] rounded-xl">
            <p className="text-xs text-[#71717a] mb-2">API URL</p>
            <code className="text-sm font-mono text-[#a1a1aa] break-all">/f_{format}/image.png</code>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-muted/50 rounded-xl p-6 min-h-[320px]">
          <div className="w-64 h-48 bg-muted rounded-lg overflow-hidden ring-1 ring-border mb-4">
            <img src="/colorful-abstract-art.png" alt="Format conversion demo" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
              <Check className="h-3 w-3 text-accent-foreground" />
            </div>
            <span>
              Output: <span className="font-mono font-medium">{selectedFormat?.label}</span>
            </span>
            <span className="text-muted-foreground">({selectedFormat?.size})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
