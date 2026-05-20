"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/rnp/login-screen"
import { Dashboard } from "@/components/rnp/dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  useEffect(() => {
    const auth = localStorage.getItem("rnp-auth")
    setIsAuthenticated(auth === "true")
  }, [])
  
  const handleLogin = () => {
    setIsAuthenticated(true)
  }
  
  const handleLogout = () => {
    localStorage.removeItem("rnp-auth")
    setIsAuthenticated(false)
  }
  
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }
  
  return <Dashboard onLogout={handleLogout} />
}
