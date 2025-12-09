"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const codeExamples = {
  url: `// Simple URL-based API
const imageUrl = "https://optix.io/s_400x300,f_webp,q_80/your-image.jpg"

// With fit mode
const cropped = "https://optix.io/s_400x300,fit_cover,f_webp/image.jpg"

// Apply effects
const blurred = "https://optix.io/blur_5,grayscale/image.jpg"`,

  express: `import { createIPX, createIPXMiddleware } from "ipx";

const ipx = createIPX({
  storage: ipxLocalStorage(),
  httpStorage: ipxHttpStorage({ domains: ["example.com"] }),
});

app.use("/image", createIPXMiddleware(ipx));`,

  next: `// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js',
  },
}

// image-loader.js
export default function optixLoader({ src, width, quality }) {
  return \`https://optix.io/s_\${width},q_\${quality || 80},f_webp/\${src}\`
}`,
}

export function CodeExample() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("url")

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab as keyof typeof codeExamples])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="docs" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-medium mb-3">Integration</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Easy to integrate</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Works with any stack. Choose your preferred method.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="h-10 rounded-full bg-muted p-1">
                <TabsTrigger
                  value="url"
                  className="rounded-full px-4 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  URL API
                </TabsTrigger>
                <TabsTrigger
                  value="express"
                  className="rounded-full px-4 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Express.js
                </TabsTrigger>
                <TabsTrigger
                  value="next"
                  className="rounded-full px-4 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Next.js
                </TabsTrigger>
              </TabsList>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="bg-[#18181b] rounded-2xl overflow-hidden">
              <TabsContent value="url" className="mt-0">
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm font-mono text-[#a1a1aa]">{codeExamples.url}</code>
                </pre>
              </TabsContent>
              <TabsContent value="express" className="mt-0">
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm font-mono text-[#a1a1aa]">{codeExamples.express}</code>
                </pre>
              </TabsContent>
              <TabsContent value="next" className="mt-0">
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm font-mono text-[#a1a1aa]">{codeExamples.next}</code>
                </pre>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
