"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/rnp/login-screen"
import { Dashboard } from "@/components/rnp/dashboard"

export default function Home() {
  // Har safar sayt ochilganda parol so'ralsin
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  
  const handleLogin = () => {
    setIsAuthenticated(true)
  }
  
  const handleLogout = () => {
    setIsAuthenticated(false)
  }
  
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }
  
  return <Dashboard onLogout={handleLogout} />
}
