"use client"

import { Lock, Download, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonthSelector } from "./month-selector"

interface DashboardHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  onLogout: () => void
  onExport: () => void
  onOpenPlanSettings: () => void
}

export function DashboardHeader({ 
  currentDate, 
  onDateChange, 
  onLogout, 
  onExport,
  onOpenPlanSettings
}: DashboardHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">RNP Dashboard</h1>
            <MonthSelector currentDate={currentDate} onDateChange={onDateChange} />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenPlanSettings}
              className="border-border"
            >
              <Settings className="h-4 w-4 mr-2" />
              Reja sozlamalari
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="border-border"
            >
              <Download className="h-4 w-4 mr-2" />
              Eksport
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive"
              title="Chiqish"
            >
              <Lock className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
