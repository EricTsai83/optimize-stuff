"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EffectsDemo() {
  const [blur, setBlur] = useState(0)
  const [sharpen, setSharpen] = useState(0)
  const [grayscale, setGrayscale] = useState(false)
  const [rotate, setRotate] = useState(0)
  const [flip, setFlip] = useState(false)

  const reset = () => {
    setBlur(0)
    setSharpen(0)
    setGrayscale(false)
    setRotate(0)
    setFlip(false)
  }

  const buildUrl = () => {
    const modifiers = []
    if (blur > 0) modifiers.push(`blur_${blur}`)
    if (sharpen > 0) modifiers.push(`sharpen_${sharpen}`)
    if (grayscale) modifiers.push("grayscale")
    if (rotate > 0) modifiers.push(`rotate_${rotate}`)
    if (flip) modifiers.push("flip")
    return modifiers.length > 0 ? `/${modifiers.join(",")}/image.jpg` : "/image.jpg"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Image Effects</h3>
          <p className="text-sm text-muted-foreground">Apply transformations and filters on-the-fly</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Blur</Label>
              <span className="text-sm font-mono text-muted-foreground">{blur}</span>
            </div>
            <Slider
              value={[blur]}
              onValueChange={(v) => setBlur(v[0])}
              min={0}
              max={20}
              step={1}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Sharpen</Label>
              <span className="text-sm font-mono text-muted-foreground">{sharpen}</span>
            </div>
            <Slider
              value={[sharpen]}
              onValueChange={(v) => setSharpen(v[0])}
              min={0}
              max={10}
              step={1}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Rotate</Label>
              <span className="text-sm font-mono text-muted-foreground">{rotate}°</span>
            </div>
            <Slider
              value={[rotate]}
              onValueChange={(v) => setRotate(v[0])}
              min={0}
              max={360}
              step={90}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 flex-1">
              <Switch id="grayscale" checked={grayscale} onCheckedChange={setGrayscale} />
              <Label htmlFor="grayscale" className="cursor-pointer text-sm">
                Grayscale
              </Label>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 flex-1">
              <Switch id="flip" checked={flip} onCheckedChange={setFlip} />
              <Label htmlFor="flip" className="cursor-pointer text-sm">
                Flip
              </Label>
            </div>
          </div>

          <div className="p-4 bg-[#18181b] rounded-xl">
            <p className="text-xs text-[#71717a] mb-2">API URL</p>
            <code className="text-sm font-mono text-[#a1a1aa] break-all">{buildUrl()}</code>
          </div>
        </div>

        <div className="flex items-center justify-center bg-muted/50 rounded-xl p-6 min-h-[320px]">
          <div
            className="w-56 h-40 bg-muted rounded-lg overflow-hidden ring-1 ring-border transition-all duration-300"
            style={{
              transform: `rotate(${rotate}deg) ${flip ? "scaleX(-1)" : ""}`,
              filter: `blur(${blur}px) ${grayscale ? "grayscale(100%)" : ""} ${sharpen > 0 ? `contrast(${1 + sharpen * 0.1})` : ""}`,
            }}
          >
            <img src="/portrait-photography-person.jpg" alt="Effects demo" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}
