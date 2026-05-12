"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MonthlyPlans, getDaysInMonth } from "@/lib/rnp-types"

interface PlanSettingsModalProps {
  open: boolean
  onClose: () => void
  currentDate: Date
  plans: MonthlyPlans
  onSave: (plans: MonthlyPlans) => void
}

export function PlanSettingsModal({ 
  open, 
  onClose, 
  currentDate, 
  plans, 
  onSave 
}: PlanSettingsModalProps) {
  const [mode, setMode] = useState<"uniform" | "individual">("uniform")
  const [uniformValue, setUniformValue] = useState("")
  const [individualPlans, setIndividualPlans] = useState<MonthlyPlans>({})
  
  const daysInMonth = getDaysInMonth(currentDate)
  
  useEffect(() => {
    if (open) {
      setIndividualPlans({ ...plans })
      // Check if all values are the same
      const values = Object.values(plans)
      if (values.length > 0 && values.every(v => v === values[0])) {
        setUniformValue(String(values[0] || ""))
        setMode("uniform")
      } else if (values.length > 0) {
        setMode("individual")
      }
    }
  }, [open, plans])
  
  const handleSave = () => {
    if (mode === "uniform") {
      const value = parseInt(uniformValue) || 0
      const newPlans: MonthlyPlans = {}
      for (let i = 1; i <= daysInMonth; i++) {
        newPlans[i] = value
      }
      onSave(newPlans)
    } else {
      onSave(individualPlans)
    }
    onClose()
  }
  
  const handleIndividualChange = (day: number, value: string) => {
    setIndividualPlans(prev => ({
      ...prev,
      [day]: parseInt(value) || 0
    }))
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Kunlik Reja Sozlamalari</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <RadioGroup 
            value={mode} 
            onValueChange={(v) => setMode(v as "uniform" | "individual")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="uniform" id="uniform" />
              <Label htmlFor="uniform" className="text-foreground cursor-pointer">
                Barcha kunlarga bir xil reja qo&apos;yish
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="text-foreground cursor-pointer">
                Har kunga alohida
              </Label>
            </div>
          </RadioGroup>
          
          {mode === "uniform" ? (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Kunlik reja (barcha kunlar uchun)</Label>
              <Input
                type="number"
                value={uniformValue}
                onChange={(e) => setUniformValue(e.target.value)}
                className="bg-input border-border text-foreground w-40"
                placeholder="Masalan: 10"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-muted-foreground">Har bir kun uchun reja kiriting:</Label>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <div key={day} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{day}-kun</Label>
                    <Input
                      type="number"
                      value={individualPlans[day] || ""}
                      onChange={(e) => handleIndividualChange(day, e.target.value)}
                      className="bg-input border-border text-foreground h-9 text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-border">
            Bekor qilish
          </Button>
          <Button onClick={handleSave}>
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
