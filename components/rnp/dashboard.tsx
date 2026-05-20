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
    const
