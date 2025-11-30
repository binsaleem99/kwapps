// src/components/background/noise-texture.tsx
// Noise Texture Overlay Component
// Part of Master UI Bold Redesign - Week 1 Day 3-5
//
// Fighting AI slop: TEXTURED atmospheric backgrounds with film grain
// NOT flat gradients, NOT smooth AI-generated backgrounds
//
// Usage: <NoiseTexture opacity={0.4} /> overlaid on mesh gradients
//        Adds organic, non-digital feel to backgrounds

'use client'

import React from 'react'

export interface NoiseTextureProps {
  opacity?: number
  blend?: 'multiply' | 'overlay' | 'soft-light' | 'screen'
  animated?: boolean
  className?: string
}

export const NoiseTexture: React.FC<NoiseTextureProps> = ({
  opacity = 0.15,
  blend = 'multiply',
  animated = false,
  className = '',
}) => {
  // Generate unique ID for this instance (for SVG filter reference)
  const filterId = React.useMemo(
    () => `noise-${Math.random().toString(36).substr(2, 9)}`,
    []
  )

  return (
    <>
      {/* SVG filter definition - hidden */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            {/* Turbulence creates organic noise pattern */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
            {/* Color matrix converts to grayscale */}
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* Noise overlay */}
      <div
        className={`absolute inset-0 -z-10 pointer-events-none ${className}`}
        style={{
          opacity,
          mixBlendMode: blend,
          filter: `url(#${filterId})`,
          animation: animated ? 'noise-drift 8s linear infinite' : 'none',
        }}
        aria-hidden="true"
      />

      {/* Animation styles */}
      {animated && (
        <style jsx>{`
          @keyframes noise-drift {
            0%, 100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(2%, -2%);
            }
            50% {
              transform: translate(-2%, 2%);
            }
            75% {
              transform: translate(2%, 2%);
            }
          }
        `}</style>
      )}
    </>
  )
}

// Alternative: Canvas-based noise (more performant for large areas)
export const CanvasNoiseTexture: React.FC<NoiseTextureProps> = ({
  opacity = 0.15,
  blend = 'multiply',
  className = '',
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to fill container
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Generate noise pattern
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const buffer = imageData.data

    for (let i = 0; i < buffer.length; i += 4) {
      const noise = Math.random() * 255
      buffer[i] = noise     // R
      buffer[i + 1] = noise // G
      buffer[i + 2] = noise // B
      buffer[i + 3] = 255   // A
    }

    ctx.putImageData(imageData, 0, 0)

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 -z-10 w-full h-full pointer-events-none ${className}`}
      style={{
        opacity,
        mixBlendMode: blend,
      }}
      aria-hidden="true"
    />
  )
}

export default NoiseTexture
