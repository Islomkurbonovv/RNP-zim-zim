"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonthSelectorProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

const MONTHS_UZ = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
]

export function MonthSelector({ currentDate, onDateChange }: MonthSelectorProps) {
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onDateChange(newDate)
  }
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToPreviousMonth}
        className="h-9 w-9 border-border"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[140px] text-center">
        <span className="font-semibold text-foreground">
          {MONTHS_UZ[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToNextMonth}
        className="h-9 w-9 border-border"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
