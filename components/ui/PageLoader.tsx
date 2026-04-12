'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }} // Only show if takes > 200ms
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-black/60"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm"></div>
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          Loading your experience...
        </p>
      </div>
    </motion.div>
  )
}
