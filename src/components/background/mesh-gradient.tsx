// src/components/background/mesh-gradient.tsx
// Mesh Gradient Background Component
// Part of Master UI Bold Redesign - Week 1 Day 3-5
//
// Fighting AI slop: LAYERED atmospheric backgrounds with 4-corner radial gradients
// NOT simple linear gradients, NOT purple/pink colors
//
// Usage: <MeshGradient variant="hero" /> in Hero section
//        <MeshGradient variant="dark" /> in dark sections

'use client'

import React from 'react'

export interface MeshGradientProps {
  variant?: 'hero' | 'dark' | 'light' | 'cyan-accent'
  className?: string
  animated?: boolean
}

export const MeshGradient: React.FC<MeshGradientProps> = ({
  variant = 'hero',
  className = '',
  animated = true,
}) => {
  const variants = {
    // Hero variant: Slate-900 base with Blue-500 and Electric-Blue accents
    hero: {
      base: 'bg-slate-50',
      gradients: [
        // Top-left: Slate-900 (dark professional)
        'radial-gradient(at 0% 0%, rgb(15 23 42 / 0.4) 0%, transparent 50%)',
        // Top-right: Electric-Blue (vivid accent)
        'radial-gradient(at 100% 0%, rgb(0 112 243 / 0.3) 0%, transparent 50%)',
        // Bottom-left: Blue-500 (trustworthy)
        'radial-gradient(at 0% 100%, rgb(59 130 246 / 0.35) 0%, transparent 50%)',
        // Bottom-right: Cyan-vivid (secondary accent)
        'radial-gradient(at 100% 100%, rgb(6 182 212 / 0.25) 0%, transparent 50%)',
      ],
    },
    // Dark variant: Deep slate with subtle blue accents
    dark: {
      base: 'bg-slate-950',
      gradients: [
        'radial-gradient(at 0% 0%, rgb(15 23 42 / 0.8) 0%, transparent 50%)',
        'radial-gradient(at 100% 0%, rgb(37 99 235 / 0.4) 0%, transparent 50%)',
        'radial-gradient(at 0% 100%, rgb(59 130 246 / 0.3) 0%, transparent 50%)',
        'radial-gradient(at 100% 100%, rgb(2 6 23 / 0.9) 0%, transparent 50%)',
      ],
    },
    // Light variant: Subtle slate tones
    light: {
      base: 'bg-white',
      gradients: [
        'radial-gradient(at 0% 0%, rgb(241 245 249 / 0.8) 0%, transparent 50%)',
        'radial-gradient(at 100% 0%, rgb(219 234 254 / 0.6) 0%, transparent 50%)',
        'radial-gradient(at 0% 100%, rgb(226 232 240 / 0.7) 0%, transparent 50%)',
        'radial-gradient(at 100% 100%, rgb(239 246 255 / 0.5) 0%, transparent 50%)',
      ],
    },
    // Cyan accent: Vibrant cyan with blue
    'cyan-accent': {
      base: 'bg-slate-900',
      gradients: [
        'radial-gradient(at 0% 0%, rgb(6 182 212 / 0.5) 0%, transparent 50%)',
        'radial-gradient(at 100% 0%, rgb(34 211 238 / 0.4) 0%, transparent 50%)',
        'radial-gradient(at 0% 100%, rgb(59 130 246 / 0.45) 0%, transparent 50%)',
        'radial-gradient(at 100% 100%, rgb(15 23 42 / 0.8) 0%, transparent 50%)',
      ],
    },
  }

  const selected = variants[variant]

  return (
    <div
      className={`absolute inset-0 -z-10 ${selected.base} ${className}`}
      style={{
        backgroundImage: selected.gradients.join(', '),
      }}
      aria-hidden="true"
    >
      {/* Optional animation overlay */}
      {animated && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: selected.gradients.join(', '),
            animation: 'mesh-float 20s ease-in-out infinite',
          }}
        />
      )}

      {/* Global animation styles */}
      <style jsx>{`
        @keyframes mesh-float {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: scale(1.05) rotate(1deg);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.1) rotate(-1deg);
            opacity: 0.35;
          }
          75% {
            transform: scale(1.05) rotate(0.5deg);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  )
}

export default MeshGradient
