"use client"

import { Lock, Download, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "./date-range-picker"
import { DateRange } from "@/lib/rnp-types"

interface DashboardHeaderProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onLogout: () => void
  onExport: () => void
  onOpenPlanSettings: () => void
}

export function DashboardHeader({ 
  dateRange,
  onDateRangeChange,
  onLogout, 
  onExport,
  onOpenPlanSettings
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">RNP Dashboard</h1>
            <DateRangePicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenPlanSettings}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Reja sozlamalari
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Eksport
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600"
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
