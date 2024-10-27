"use client"

import { motion } from "framer-motion"
import { LanguageSelect } from "@/components/language-select"

interface SplashScreenProps {
  value: string
  onValueChange: (value: string) => void
  onComplete: () => void
}

export function SplashScreen({
  value,
  onValueChange,
  onComplete,
}: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-background z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: value ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        if (value) onComplete()
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-8 text-center"
      >
        <motion.h1
          className="text-4xl font-bold tracking-tighter"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Welcome to Transcriber
        </motion.h1>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-muted-foreground">Select your language to begin</p>
          <LanguageSelect value={value} onValueChange={onValueChange} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
