"use client"

import { useState, useEffect } from "react"

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide loading screen after 1.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col items-center justify-center">
      <div className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-white">יגאל & טלי</div>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-300">טוען...</p>
    </div>
  )
}

