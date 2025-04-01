"use client"

// Simplified version of the toast hook
import { useState, useCallback } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).substring(2, 9)

    // In a real implementation, this would show a toast UI component
    // For simplicity, we're just using console.log
    console.log(`Toast (${variant}): ${title} - ${description}`)

    // In a browser environment, we could use the browser's notification API
    if (typeof window !== "undefined" && variant !== "destructive") {
      alert(`${title}\n${description}`)
    }

    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant }])

    // Remove the toast after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 5000)

    return id
  }, [])

  return { toast, toasts }
}

