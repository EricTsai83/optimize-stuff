"use client"

import { useEffect, useRef } from "react"

interface ImageCard {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  format: string
  originalSize: number
  optimizedSize: number
  progress: number
  opacity: number
}

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

    // Image optimization themed elements
    const imageCards: ImageCard[] = []
    const formats = ["WebP", "AVIF", "JPEG", "PNG"]
    const colors = [
      "rgba(16, 185, 129, 0.08)", // emerald
      "rgba(59, 130, 246, 0.08)", // blue
      "rgba(139, 92, 246, 0.08)", // purple
      "rgba(236, 72, 153, 0.08)", // pink
    ]

    // Create floating image cards
    for (let i = 0; i < 8; i++) {
      imageCards.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 60 + Math.random() * 40,
        height: 45 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        format: formats[Math.floor(Math.random() * formats.length)],
        originalSize: 500 + Math.random() * 1500,
        optimizedSize: 0,
        progress: 0,
        opacity: 0.4 + Math.random() * 0.3,
      })
    }

    // Optimization particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
    }> = []

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.3,
        0,
        canvas.width * 0.5,
        canvas.height * 0.3,
        canvas.width * 0.6,
      )
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.04)")
      gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.02)")
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw optimization particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
      })

      // Draw floating image cards
      imageCards.forEach((card) => {
        ctx.save()
        ctx.translate(card.x + card.width / 2, card.y + card.height / 2)
        ctx.rotate((card.rotation * Math.PI) / 180)

        // Animate progress
        if (card.progress < 100) {
          card.progress += 0.5
          card.optimizedSize = (card.originalSize * (100 - card.progress * 0.7)) / 100
        } else {
          card.progress = 0
        }

        // Card background with subtle border
        ctx.fillStyle = `rgba(255, 255, 255, ${card.opacity * 0.05})`
        ctx.strokeStyle = `rgba(16, 185, 129, ${card.opacity * 0.3})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(-card.width / 2, -card.height / 2, card.width, card.height, 6)
        ctx.fill()
        ctx.stroke()

        // Format badge
        ctx.fillStyle = `rgba(16, 185, 129, ${card.opacity})`
        ctx.font = "bold 9px Inter"
        ctx.textAlign = "center"
        ctx.fillText(card.format, 0, -card.height / 2 + 14)

        // Progress bar
        const barWidth = card.width * 0.7
        const barHeight = 3
        const barY = card.height / 2 - 12

        ctx.fillStyle = `rgba(16, 185, 129, ${card.opacity * 0.2})`
        ctx.beginPath()
        ctx.roundRect(-barWidth / 2, barY, barWidth, barHeight, 2)
        ctx.fill()

        ctx.fillStyle = `rgba(16, 185, 129, ${card.opacity})`
        ctx.beginPath()
        ctx.roundRect(-barWidth / 2, barY, (barWidth * card.progress) / 100, barHeight, 2)
        ctx.fill()

        // File size text
        ctx.fillStyle = `rgba(16, 185, 129, ${card.opacity * 0.8})`
        ctx.font = "7px JetBrains Mono"
        ctx.fillText(`${Math.round(card.optimizedSize)}KB`, 0, card.height / 2 - 3)

        ctx.restore()

        // Update position
        card.x += card.vx
        card.y += card.vy
        card.rotation += card.rotationSpeed

        if (card.x < -50) card.x = canvas.width + 50
        if (card.x > canvas.width + 50) card.x = -50
        if (card.y < -50) card.y = canvas.height + 50
        if (card.y > canvas.height + 50) card.y = -50
      })

      // Draw connecting lines between nearby cards
      imageCards.forEach((card1, i) => {
        imageCards.slice(i + 1).forEach((card2) => {
          const dx = card1.x - card2.x
          const dy = card1.y - card2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            ctx.beginPath()
            ctx.moveTo(card1.x, card1.y)
            ctx.lineTo(card2.x, card2.y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 * (1 - distance / 200)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

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
