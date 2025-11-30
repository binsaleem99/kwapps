// src/components/background/floating-shapes.tsx
// Floating Shapes Background Component
// Part of Master UI Bold Redesign - Week 1 Day 3-5
//
// Fighting AI slop: ANIMATED geometric shapes with purposeful choreography
// NOT static backgrounds, NOT random particle effects
//
// Usage: <FloatingShapes count={5} /> in Hero section
//        Creates depth and movement in atmospheric backgrounds

'use client'

import React from 'react'

export interface FloatingShapesProps {
  count?: 3 | 5 | 7
  variant?: 'subtle' | 'bold' | 'electric'
  className?: string
}

export const FloatingShapes: React.FC<FloatingShapesProps> = ({
  count = 5,
  variant = 'bold',
  className = '',
}) => {
  const shapes = React.useMemo(() => {
    const shapeTypes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon']
    const result = []

    for (let i = 0; i < count; i++) {
      const shape = shapeTypes[i % shapeTypes.length]

      // Deterministic but varied positioning
      const x = (i * 23 + 17) % 100
      const y = (i * 37 + 29) % 100
      const size = 100 + (i * 50) % 200 // 100-300px
      const rotation = (i * 47) % 360
      const duration = 15 + (i * 5) % 20 // 15-35s
      const delay = (i * 3) % 10 // 0-9s

      result.push({
        id: i,
        type: shape,
        x,
        y,
        size,
        rotation,
        duration,
        delay,
      })
    }

    return result
  }, [count])

  const variantStyles = {
    subtle: {
      opacity: 0.05,
      blur: 40,
      colors: ['rgb(59 130 246)', 'rgb(6 182 212)', 'rgb(15 23 42)'],
    },
    bold: {
      opacity: 0.1,
      blur: 60,
      colors: ['rgb(0 112 243)', 'rgb(59 130 246)', 'rgb(6 182 212)'],
    },
    electric: {
      opacity: 0.15,
      blur: 80,
      colors: ['rgb(0 112 243)', 'rgb(34 211 238)', 'rgb(59 130 246)'],
    },
  }

  const style = variantStyles[variant]

  return (
    <div
      className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {shapes.map((shape) => {
        const color = style.colors[shape.id % style.colors.length]

        return (
          <div
            key={shape.id}
            className="absolute"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              opacity: style.opacity,
              filter: `blur(${style.blur}px)`,
              animation: `float-${shape.id} ${shape.duration}s ease-in-out infinite`,
              animationDelay: `${shape.delay}s`,
            }}
          >
            {shape.type === 'circle' && (
              <div
                className="w-full h-full rounded-full"
                style={{ background: color }}
              />
            )}
            {shape.type === 'square' && (
              <div
                className="w-full h-full"
                style={{
                  background: color,
                  transform: `rotate(${shape.rotation}deg)`,
                }}
              />
            )}
            {shape.type === 'triangle' && (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${color} 50%, transparent 50%)`,
                  transform: `rotate(${shape.rotation}deg)`,
                }}
              />
            )}
            {shape.type === 'pentagon' && (
              <div
                className="w-full h-full rounded-lg"
                style={{
                  background: color,
                  transform: `rotate(${shape.rotation}deg)`,
                }}
              />
            )}
            {shape.type === 'hexagon' && (
              <div
                className="w-full h-full rounded-2xl"
                style={{
                  background: color,
                  transform: `rotate(${shape.rotation}deg)`,
                }}
              />
            )}
          </div>
        )
      })}

      {/* Animation keyframes for each shape */}
      <style jsx>{`
        ${shapes
          .map(
            (shape) => `
          @keyframes float-${shape.id} {
            0%, 100% {
              transform: translate(0, 0) rotate(${shape.rotation}deg) scale(1);
            }
            25% {
              transform: translate(${(shape.id % 2 === 0 ? 20 : -20)}px, ${(shape.id % 3 === 0 ? -30 : 30)}px) rotate(${shape.rotation + 90}deg) scale(1.1);
            }
            50% {
              transform: translate(${(shape.id % 2 === 0 ? -20 : 20)}px, ${(shape.id % 3 === 0 ? 30 : -30)}px) rotate(${shape.rotation + 180}deg) scale(0.9);
            }
            75% {
              transform: translate(${(shape.id % 2 === 0 ? -30 : 30)}px, ${(shape.id % 3 === 0 ? -20 : 20)}px) rotate(${shape.rotation + 270}deg) scale(1.05);
            }
          }
        `
          )
          .join('\n')}
      `}</style>
    </div>
  )
}

export default FloatingShapes
