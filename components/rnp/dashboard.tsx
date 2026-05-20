"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  DateRange,
  getStorageKey, 
  MONTHS_UZ,
  formatCurrency
} from "@/lib/rnp-types"
import {
  setDataToSupabase,
  subscribeToChanges,
  getAllByPrefix,
} from "@/lib/supabase-storage"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const getInitialDateRange = (): DateRange => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from, to }
  }

  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange)
  const [allMonthsData, setAllMonthsData] = useState<Map<string, Record<number, Partial<DailyEntry>>>>(new Map())
  const [allMonthsPlans, setAllMonthsPlans] = useState<Map<string, MonthlyPlans>>(new Map())
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const monthsInRange = useMemo(() => {
    const months: Date[] = []
    const current = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 1)
    const endMonth = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), 1)
    
    while (current <= endMonth) {
      months.push(new Date(current))
      current.setMonth(current.getMonth() + 1)
    }
    
    return months
  }, [dateRange])

  useEffect(() => {
    let mounted = true
    
    const loadAllData = async () => {
      setIsLoading(true)
      
      const [dataResults, plansResults] = await Promise.all([
        getAllByPrefix("rnp-data-"),
        getAllByPrefix("rnp-plans-"),
      ])
      
      if (!mounted) return
      
      setAllMonthsData(dataResults)
      setAllMonthsPlans(plansResults)
      setIsLoading(false)
    }
    
    loadAllData()
    
    const unsubscribe = subscribeToChanges((key, value) => {
      if (key.startsWith("rnp-data-")) {
        setAllMonthsData(prev => {
          const newMap = new Map(prev)
          newMap.set(key, value || {})
          return newMap
        })
      } else if (key.startsWith("rnp-plans-")) {
        setAllMonthsPlans(prev => {
          const newMap = new Map(prev)
          newMap.set(key, value || {})
          return newMap
        })
      }
    })
    
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const entries = useMemo(() => {
    const result: DailyEntry[] = []
    
    const currentDate = new Date(dateRange.from)
    currentDate.setHours(0, 0, 0, 0)
    const endDate = new Date(dateRange.to)
    endDate.setHours(23, 59, 59, 999)
    
    while (currentDate <= endDate) {
      const day = currentDate.getDate()
      const month = currentDate.getMonth()
      const year = currentDate.getFullYear()
      
      const dataKey = getStorageKey("data", currentDate)
      const plansKey = getStorageKey("plans", currentDate)
      const monthData = allMonthsData.get(dataKey) || {}
      const monthPlans = allMonthsPlans.get(plansKey) || {}
      
      const savedData = monthData[day] || {}
      const rejaLid = monthPlans[day] || 0
      
      const byudjet = savedData.byudjet || 0
      const sifatliLead = savedData.sifatliLead || 0
      const jamiLead = savedData.jamiLead || 0
      const sotuv = savedData.sotuv || 0
      const sifatsiz = jamiLead - sifatliLead
      
      const sifatPercent = jamiLead > 0 ? (sifatliLead / jamiLead) * 100 : 0
      const konversiyaPercent = sifatliLead > 0 ? (sotuv / sifatliLead) * 100 : 0
      const rejaPercent = rejaLid > 0 ? (sifatliLead / rejaLid) * 100 : 0
      
      result.push({
        date: new Date(currentDate),
        day,
        month,
        year,
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
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return result
  }, [dateRange, allMonthsData, allMonthsPlans])

  const currentEditMonth = dateRange.from
  const currentPlans = allMonthsPlans.get(getStorageKey("plans", currentEditMonth)) || {}
  
  const saveData = useCallback(async (day: number, field: keyof DailyEntry, value: number, entryDate?: Date) => {
    const targetDate = entryDate || currentEditMonth
    const dataKey = getStorageKey("data", targetDate)
    const existingData = { ...(allMonthsData.get(dataKey) || {}) }
    
    const dayData = { ...(existingData[day] || {}) }
    dayData[field as keyof typeof dayData] = value as never
    existingData[day] = dayData
    
    setAllMonthsData(prev => {
      const newMap = new Map(prev)
      newMap.set(dataKey, existingData)
      return newMap
    })
    
    await setDataToSupabase(dataKey, existingData)
  }, [currentEditMonth, allMonthsData])
  
  const handleUpdateEntry = useCallback((day: number, field: keyof DailyEntry, value: number) => {
    const entry = entries.find(e => e.day === day)
    saveData(day, field, value, entry?.date)
  }, [saveData, entries])
  
  const handleSavePlans = useCallback(async (newPlans: MonthlyPlans) => {
    const plansKey = getStorageKey("plans", currentEditMonth)
    
    setAllMonthsPlans(prev => {
      const newMap = new Map(prev)
      newMap.set(plansKey, newPlans)
      return newMap
    })
    
    await setDataToSupabase(plansKey, newPlans)
  }, [currentEditMonth])
  
  const kpiData: KPIData = useMemo(() => {
    const data: KPIData = {
      jamiByudjet: entries.reduce((sum, e) => sum + e.byudjet, 0),
      sifatliLead: entries.reduce((sum, e) => sum + e.sifatliLead, 0),
      jamiLead: entries.reduce((sum, e) => sum + e.jamiLead, 0),
      jamiSotuv: entries.reduce((sum, e) => sum + e.sotuv, 0),
      ortachaLeadNarxi: 0,
      ortachaSotuvNarxi: 0,
      rejaBarjarilishi: 0,
      jamiRejaLid: entries.reduce((sum, e) => sum + e.rejaLid, 0)
    }
    
    data.ortachaLeadNarxi = data.jamiLead > 0 ? data.jamiByudjet / data.jamiLead : 0
    data.ortachaSotuvNarxi = data.jamiSotuv > 0 ? data.jamiByudjet / data.jamiSotuv : 0
    data.rejaBarjarilishi = data.jamiRejaLid > 0 ? (data.sifatliLead / data.jamiRejaLid) * 100 : 0
    
    return data
  }, [entries])
  
  const handleExport = useCallback(() => {
    const exportData = entries.map(e => ({
      "Kun": e.day,
      "Byudjet ($)": e.byudjet,
      "Sifatli Lead": e.sifatliLead,
      "Jami Lead": e.jamiLead,
      "Sotuv": e.sotuv,
      "Sifatsiz": e.sifatsiz,
      "Reja Lid": e.rejaLid,
      "Lead Narxi ($)": e.jamiLead > 0 ? Math.round(e.byudjet / e.jamiLead) : 0,
      "Sotuv Narxi ($)": e.sotuv > 0 ? Math.round(e.byudjet / e.sotuv) : 0,
      "Sifat %": `${e.sifatPercent.toFixed(1)}%`,
      "Konversiya %": `${e.konversiyaPercent.toFixed(1)}%`,
      "Reja %": `${e.rejaPercent.toFixed(1)}%`
    }))
    
    const totals = {
      "Kun": "JAMI",
      "Byudjet ($)": kpiData.jamiByudjet,
      "Sifatli Lead": kpiData.sifatliLead,
      "Jami Lead": kpiData.jamiLead,
      "Sotuv": kpiData.jamiSotuv,
      "Sifatsiz": kpiData.jamiLead - kpiData.sifatliLead,
      "Reja Lid": kpiData.jamiRejaLid,
      "Lead Narxi ($)": kpiData.jamiLead > 0 ? Math.round(kpiData.jamiByudjet / kpiData.jamiLead) : 0,
      "Sotuv Narxi ($)": kpiData.jamiSotuv > 0 ? Math.round(kpiData.jamiByudjet / kpiData.jamiSotuv) : 0,
      "Sifat %": kpiData.jamiLead > 0 ? `${((kpiData.sifatliLead / kpiData.jamiLead) * 100).toFixed(1)}%` : "0%",
      "Konversiya %": kpiData.sifatliLead > 0 ? `${((kpiData.jamiSotuv / kpiData.sifatliLead) * 100).toFixed(1)}%` : "0%",
      "Reja %": `${kpiData.rejaBarjarilishi.toFixed(1)}%`
    }
    
    exportData.push(totals)
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "RNP Data")
    
    const fromStr = `${dateRange.from.getDate()}-${MONTHS_UZ[dateRange.from.getMonth()]}`
    const toStr = `${dateRange.to.getDate()}-${MONTHS_UZ[dateRange.to.getMonth()]}-${dateRange.to.getFullYear()}`
    const fileName = `RNP_${fromStr}_to_${toStr}.xlsx`
    XLSX.writeFile(wb, fileName)
  }, [entries, kpiData, dateRange])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-pulse text-gray-600 text-lg">Ma&apos;lumotlar yuklanmoqda...</div>
          <div className="text-gray-400 text-sm">Iltimos kuting</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onLogout={onLogout}
        onExport={handleExport}
        onOpenPlanSettings={() => setPlanModalOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <KPICards data={kpiData} />
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Kunlik Ma&apos;lumotlar</h2>
          <DataTable entries={entries} onUpdateEntry={handleUpdateEntry} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Grafiklar</h2>
          <DashboardCharts entries={entries} />
        </div>
      </main>
      
      <PlanSettingsModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        currentDate={currentEditMonth}
        plans={currentPlans}
        onSave={handleSavePlans}
      />
    </div>
  )
}
