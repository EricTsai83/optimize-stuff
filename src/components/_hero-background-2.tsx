"use client"

import { useEffect, useRef } from "react"

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = Math.min(window.innerHeight * 1.2, 1200)
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    const imageCards = [
      { x: 0.15, y: 0.25, width: 200, height: 140, scanProgress: 0, optimized: false, format: "JPEG" },
      { x: 0.42, y: 0.2, width: 180, height: 130, scanProgress: 0, optimized: false, format: "PNG" },
      { x: 0.7, y: 0.28, width: 190, height: 135, scanProgress: 0, optimized: false, format: "WebP" },
      { x: 0.25, y: 0.58, width: 185, height: 125, scanProgress: 0, optimized: false, format: "AVIF" },
      { x: 0.58, y: 0.62, width: 195, height: 140, scanProgress: 0, optimized: false, format: "GIF" },
    ]

    let currentScanIndex = 0
    let frame = 0
    let animationFrameId: number

    const animate = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Subtle radial gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.3,
        0,
        canvas.width * 0.5,
        canvas.height * 0.3,
        canvas.width * 0.7,
      )
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.04)")
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw subtle grid pattern
      ctx.strokeStyle = "rgba(16, 185, 129, 0.02)"
      ctx.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        const y = (canvas.height / 8) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      for (let i = 0; i < 12; i++) {
        const x = (canvas.width / 12) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Animate each image card
      imageCards.forEach((card, index) => {
        const cardX = canvas.width * card.x
        const cardY = canvas.height * card.y

        // Image card container
        const isScanning = index === currentScanIndex
        const opacity = card.optimized ? 0.8 : isScanning ? 0.6 : 0.3

        // Card background with glass effect
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.03})`
        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.4})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(cardX, cardY, card.width, card.height, 8)
        ctx.fill()
        ctx.stroke()

        // Image placeholder representation (simulated photo)
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity * 0.08})`
        ctx.beginPath()
        ctx.roundRect(cardX + 8, cardY + 8, card.width - 16, card.height - 40, 4)
        ctx.fill()

        // Format label
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity * 0.8})`
        ctx.font = "10px JetBrains Mono"
        ctx.textAlign = "left"
        ctx.fillText(card.format, cardX + 12, cardY + card.height - 20)

        // File size indicator
        const originalSize = 850 + index * 150
        const currentSize = card.optimized
          ? Math.round(originalSize * 0.35)
          : Math.round(originalSize * (1 - card.scanProgress * 0.0065))

        ctx.font = "9px JetBrains Mono"
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity * 0.6})`
        ctx.textAlign = "right"
        ctx.fillText(`${currentSize}KB`, cardX + card.width - 12, cardY + card.height - 20)

        // Scanning beam effect
        if (isScanning && card.scanProgress < 100) {
          card.scanProgress += 1.2

          // Vertical scanning beam
          const beamY = cardY + 8 + ((card.height - 48) * card.scanProgress) / 100
          const beamGradient = ctx.createLinearGradient(cardX, beamY - 20, cardX, beamY + 20)
          beamGradient.addColorStop(0, "rgba(16, 185, 129, 0)")
          beamGradient.addColorStop(0.5, "rgba(16, 185, 129, 0.3)")
          beamGradient.addColorStop(1, "rgba(16, 185, 129, 0)")

          ctx.fillStyle = beamGradient
          ctx.fillRect(cardX + 8, beamY - 20, card.width - 16, 40)

          // Beam line
          ctx.strokeStyle = "rgba(16, 185, 129, 0.6)"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(cardX + 8, beamY)
          ctx.lineTo(cardX + card.width - 8, beamY)
          ctx.stroke()

          // Glow effect on beam
          ctx.shadowColor = "rgba(16, 185, 129, 0.8)"
          ctx.shadowBlur = 15
          ctx.stroke()
          ctx.shadowBlur = 0

          // Progress indicator
          ctx.fillStyle = "rgba(16, 185, 129, 0.7)"
          ctx.font = "11px JetBrains Mono"
          ctx.textAlign = "center"
          ctx.fillText(`${Math.round(card.scanProgress)}%`, cardX + card.width / 2, cardY + card.height - 8)
        } else if (card.scanProgress >= 100 && !card.optimized) {
          card.optimized = true
          currentScanIndex = (currentScanIndex + 1) % imageCards.length
        }

        // Optimized checkmark
        if (card.optimized) {
          ctx.strokeStyle = "rgba(16, 185, 129, 0.8)"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(cardX + card.width / 2 - 8, cardY + card.height - 12)
          ctx.lineTo(cardX + card.width / 2 - 3, cardY + card.height - 7)
          ctx.lineTo(cardX + card.width / 2 + 8, cardY + card.height - 16)
          ctx.stroke()

          // Savings badge
          const savings = 65
          ctx.fillStyle = "rgba(16, 185, 129, 0.15)"
          ctx.beginPath()
          ctx.roundRect(cardX + card.width - 50, cardY + 12, 38, 16, 8)
          ctx.fill()

          ctx.fillStyle = "rgba(16, 185, 129, 0.9)"
          ctx.font = "9px JetBrains Mono"
          ctx.textAlign = "center"
          ctx.fillText(`-${savings}%`, cardX + card.width - 31, cardY + 22)
        }
      })

      // Data flow particles (subtle)
      if (frame % 5 === 0) {
        for (let i = 0; i < 2; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          const size = 1 + Math.random()

          ctx.fillStyle = `rgba(16, 185, 129, ${0.15 + Math.random() * 0.15})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" style={{ mixBlendMode: "normal" }} />
  )
}
