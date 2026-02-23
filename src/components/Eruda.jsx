'use client'
import { useEffect } from 'react'

export default function Eruda() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/eruda'
      script.onload = () => {
        window.eruda.init()
      }
      document.body.appendChild(script)
    }
  }, [])

  return null
}