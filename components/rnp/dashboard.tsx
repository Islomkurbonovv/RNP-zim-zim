"use client"

import { useState, useEffect, useCallback } from "react"
import * as XLSX from "xlsx"
import { DashboardHeader } from "./dashboard-header"
import { KPICards } from "./kpi-cards"
import { DataTable } from "./data-table"
import { DashboardCharts } from "./dashboard-charts"
import { PlanSettingsModal } from "./plan-settings-modal"
import { 
  DailyEntry, 
  MonthlyPlans, 
  KPIData, 
  getStorageKey, 
  getDaysInMonth 
} from "@/lib/rnp-types"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [plans, setPlans] = useState<MonthlyPlans>({})
  const [planModalOpen, setPlanModalOpen] = useState(false)
  
  // Initialize entries for the month
  const initializeEntries = useCallback((date: Date, loadedData: Record<number, Partial<DailyEntry>> = {}, loadedPlans: MonthlyPlans = {}) => {
    const daysInMonth = getDaysInMonth(date)
    const newEntries: DailyEntry[] = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const savedData = loadedData[day] || {}
      const rejaLid = loadedPlans[day] || 0
      
      const byudjet = savedData.byudjet || 0
      const sifatliLead = savedData.sifatliLead || 0
      const jamiLead = savedData.jamiLead || 0
      const sotuv = savedData.sotuv || 0
      const sifatsiz = jamiLead - sifatliLead
      
      const sifatPercent = jamiLead > 0 ? (sifatliLead / jamiLead) * 100 : 0
      const konversiyaPercent = sifatliLead > 0 ? (sotuv / sifatliLead) * 100 : 0
      const rejaPercent = rejaLid > 0 ? (sifatliLead / rejaLid) * 100 : 0
      
      newEntries.push({
        day,
        byudjet,
        sifatliLead,
        jamiLead,
        sotuv,
        sifatsiz,
        rejaLid,
        sifatPercent,
        konversiyaPercent,
        rejaPercent
      })
    }
    
    return newEntries
  }, [])
  
  // Load data from localStorage
  useEffect(() => {
    const dataKey = getStorageKey("data", currentDate)
    const plansKey = getStorageKey("plans", currentDate)
    
    const savedData = localStorage.getItem(dataKey)
    const savedPlans = localStorage.getItem(plansKey)
    
    const loadedData = savedData ? JSON.parse(savedData) : {}
    const loadedPlans = savedPlans ? JSON.parse(savedPlans) : {}
    
    setPlans(loadedPlans)
    setEntries(initializeEntries(currentDate, loadedData, loadedPlans))
  }, [currentDate, initializeEntries])
  
  // Save data to localStorage
  const saveData = useCallback((newEntries: DailyEntry[]) => {
    const dataKey = getStorageKey("data", currentDate)
    const dataToSave: Record<number, Partial<DailyEntry>> = {}
    
    newEntries.forEach(entry => {
      if (entry.byudjet || entry.sifatliLead || entry.jamiLead || entry.sotuv) {
        dataToSave[entry.day] = {
          byudjet: entry.byudjet,
          sifatliLead: entry.sifatliLead,
          jamiLead: entry.jamiLead,
          sotuv: entry.sotuv
        }
      }
    })
    
    localStorage.setItem(dataKey, JSON.stringify(dataToSave))
  }, [currentDate])
  
  // Handle entry update
  const handleUpdateEntry = useCallback((day: number, field: keyof DailyEntry, value: number) => {
    setEntries(prev => {
      const newEntries = prev.map(entry => {
        if (entry.day !== day) return entry
        
        const updated = { ...entry, [field]: value }
        
        // Recalculate computed values
        updated.sifatsiz = updated.jamiLead - updated.sifatliLead
        updated.sifatPercent = updated.jamiLead > 0 ? (updated.sifatliLead / updated.jamiLead) * 100 : 0
        updated.konversiyaPercent = updated.sifatliLead > 0 ? (updated.sotuv / updated.sifatliLead) * 100 : 0
        updated.rejaPercent = updated.rejaLid > 0 ? (updated.sifatliLead / updated.rejaLid) * 100 : 0
        
        return updated
      })
      
      saveData(newEntries)
      return newEntries
    })
  }, [saveData])
  
  // Handle plan save
  const handleSavePlans = useCallback((newPlans: MonthlyPlans) => {
    const plansKey = getStorageKey("plans", currentDate)
    localStorage.setItem(plansKey, JSON.stringify(newPlans))
    setPlans(newPlans)
    
    // Update entries with new plans
    setEntries(prev => {
      const dataToReload: Record<number, Partial<DailyEntry>> = {}
      prev.forEach(e => {
        dataToReload[e.day] = {
          byudjet: e.byudjet,
          sifatliLead: e.sifatliLead,
          jamiLead: e.jamiLead,
          sotuv: e.sotuv
        }
      })
      return initializeEntries(currentDate, dataToReload, newPlans)
    })
  }, [currentDate, initializeEntries])
  
  // Calculate KPI data
  const kpiData: KPIData = {
    jamiByudjet: entries.reduce((sum, e) => sum + e.byudjet, 0),
    sifatliLead: entries.reduce((sum, e) => sum + e.sifatliLead, 0),
    jamiLead: entries.reduce((sum, e) => sum + e.jamiLead, 0),
    jamiSotuv: entries.reduce((sum, e) => sum + e.sotuv, 0),
    ortachaLeadNarxi: 0,
    ortachaSotuvNarxi: 0,
    rejaBarjarilishi: 0,
    jamiRejaLid: entries.reduce((sum, e) => sum + e.rejaLid, 0)
  }
  
  kpiData.ortachaLeadNarxi = kpiData.jamiLead > 0 ? kpiData.jamiByudjet / kpiData.jamiLead : 0
  kpiData.ortachaSotuvNarxi = kpiData.jamiSotuv > 0 ? kpiData.jamiByudjet / kpiData.jamiSotuv : 0
  kpiData.rejaBarjarilishi = kpiData.jamiRejaLid > 0 ? (kpiData.sifatliLead / kpiData.jamiRejaLid) * 100 : 0
  
  // Export to Excel
  const handleExport = useCallback(() => {
    const MONTHS_UZ = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
      "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ]
    
    const exportData = entries.map(e => ({
      "Kun": e.day,
      "Byudjet": e.byudjet,
      "Sifatli Lead": e.sifatliLead,
      "Jami Lead": e.jamiLead,
      "Sotuv": e.sotuv,
      "Sifatsiz": e.sifatsiz,
      "Reja Lid": e.rejaLid,
      "Sifat %": `${e.sifatPercent.toFixed(1)}%`,
      "Konversiya %": `${e.konversiyaPercent.toFixed(1)}%`,
      "Reja %": `${e.rejaPercent.toFixed(1)}%`
    }))
    
    // Add totals row
    const totals = {
      "Kun": "JAMI",
      "Byudjet": kpiData.jamiByudjet,
      "Sifatli Lead": kpiData.sifatliLead,
      "Jami Lead": kpiData.jamiLead,
      "Sotuv": kpiData.jamiSotuv,
      "Sifatsiz": kpiData.jamiLead - kpiData.sifatliLead,
      "Reja Lid": kpiData.jamiRejaLid,
      "Sifat %": kpiData.jamiLead > 0 ? `${((kpiData.sifatliLead / kpiData.jamiLead) * 100).toFixed(1)}%` : "0%",
      "Konversiya %": kpiData.sifatliLead > 0 ? `${((kpiData.jamiSotuv / kpiData.sifatliLead) * 100).toFixed(1)}%` : "0%",
      "Reja %": `${kpiData.rejaBarjarilishi.toFixed(1)}%`
    }
    
    exportData.push(totals)
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "RNP Data")
    
    const fileName = `RNP_${MONTHS_UZ[currentDate.getMonth()]}_${currentDate.getFullYear()}.xlsx`
    XLSX.writeFile(wb, fileName)
  }, [entries, kpiData, currentDate])
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onLogout={onLogout}
        onExport={handleExport}
        onOpenPlanSettings={() => setPlanModalOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <KPICards data={kpiData} />
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Kunlik Ma&apos;lumotlar</h2>
          <DataTable entries={entries} onUpdateEntry={handleUpdateEntry} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Grafiklar</h2>
          <DashboardCharts entries={entries} />
        </div>
      </main>
      
      <PlanSettingsModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        currentDate={currentDate}
        plans={plans}
        onSave={handleSavePlans}
      />
    </div>
  )
}
