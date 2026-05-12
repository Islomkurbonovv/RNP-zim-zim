export interface DailyEntry {
  day: number
  byudjet: number
  sifatliLead: number
  jamiLead: number
  sotuv: number
  sifatsiz: number
  rejaLid: number
  sifatPercent: number
  konversiyaPercent: number
  rejaPercent: number
}

export interface MonthlyPlans {
  [day: number]: number
}

export interface KPIData {
  jamiByudjet: number
  sifatliLead: number
  jamiLead: number
  jamiSotuv: number
  ortachaLeadNarxi: number
  ortachaSotuvNarxi: number
  rejaBarjarilishi: number
  jamiRejaLid: number
}

export const PASSWORD = "zimzim2026"

export const getStorageKey = (type: "data" | "plans" | "auth", date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  if (type === "auth") return "rnp-auth"
  return `rnp-${type}-${year}-${month}`
}

export const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("uz-UZ").format(num)
}

export const formatPercent = (num: number) => {
  if (isNaN(num) || !isFinite(num)) return "0%"
  return `${num.toFixed(1)}%`
}

export const getStatusColor = (percent: number, type: "sifat" | "konversiya" | "reja") => {
  const thresholds = {
    sifat: { good: 50, warning: 30 },
    konversiya: { good: 20, warning: 10 },
    reja: { good: 80, warning: 50 }
  }
  
  const t = thresholds[type]
  if (percent >= t.good) return "text-emerald-400"
  if (percent >= t.warning) return "text-amber-400"
  return "text-red-400"
}

export const getStatusBgColor = (percent: number, type: "sifat" | "konversiya" | "reja") => {
  const thresholds = {
    sifat: { good: 50, warning: 30 },
    konversiya: { good: 20, warning: 10 },
    reja: { good: 80, warning: 50 }
  }
  
  const t = thresholds[type]
  if (percent >= t.good) return "bg-emerald-500/20"
  if (percent >= t.warning) return "bg-amber-500/20"
  return "bg-red-500/20"
}
