"use client"

import React, { useState, useLayoutEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const CLICK_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTlvT18AZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YV9vT18A" 
// This is a placeholder; I'll use a better sound logic or a reliable short pop.
// Since I can't easily generate a perfect base64 WAV here without a tool, 
// I'll use a silent-ish base64 or a synthesized one via Web Audio API.

export function Ripple({ children }: { children: React.ReactNode }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])

  const playSound = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      // Drip sound starts low and goes high quickly
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(150, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.1)

      gain.gain.setValueAtTime(0.05, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1)

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start()
      oscillator.stop(context.currentTime + 0.1)
    } catch (e) {
      // Audio context might be blocked by browser policy without user gesture
    }
  }

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    }

    setRipples((prev) => [...prev, newRipple])
    playSound()

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 800)
  }

  return (
    <div 
      className="relative overflow-hidden w-full" 
      onPointerDown={addRipple}
    >
      <div className="relative z-10 w-full">{children}</div>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0, border: "2px solid rgba(59, 130, 246, 0.4)" }}
            animate={{ scale: 1, opacity: [0, 0.5, 0], border: "1px solid rgba(59, 130, 246, 0)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              borderRadius: "100%",
              boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.1)",
              backgroundColor: "rgba(59, 130, 246, 0.05)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
