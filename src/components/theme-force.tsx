"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeForce() {
  const { setTheme } = useTheme()

  useEffect(() => {
    // Forçar o tema claro tanto no localStorage quanto via API
    setTheme("light")
    
    // Limpar qualquer configuração anterior no localStorage
    try {
      localStorage.setItem("theme", "light")
    } catch (e) {
      console.error("Falha ao definir tema no localStorage", e)
    }
  }, [setTheme])

  return null
} 