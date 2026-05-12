"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PASSWORD } from "@/lib/rnp-types"
import { cn } from "@/lib/utils"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD) {
      localStorage.setItem("rnp-auth", "true")
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card 
        className={cn(
          "w-full max-w-md border-gray-200 bg-white shadow-xl",
          shake && "animate-shake"
        )}
      >
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RNP Dashboard</h1>
            <p className="text-gray-500 mt-2 text-center">
              Davom etish uchun parolni kiriting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Parol"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                className={cn(
                  "pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-12",
                  error && "border-red-500 ring-1 ring-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center">
                Parol noto&apos;g&apos;ri
              </p>
            )}

            <Button type="submit" className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white">
              Kirish
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Maxfiy ma&apos;lumotlar himoyalangan</span>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
