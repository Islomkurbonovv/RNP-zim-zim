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

export interface DateRange {
  from: Date
  to: Date
}

// CHANGE THIS PASSWORD TO YOUR OWN
export const PASSWORD = "RnPmarketing2026"

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
  return new Intl.NumberFormat("en-US").format(num)
}

export const formatCurrency = (num: number) => {
  return "$" + new Intl.NumberFormat("en-US").format(num)
}

export const formatPercent = (num: number) => {
  if (isNaN(num) || !isFinite(num)) return "0%"
  return `${num.toFixed(1)}%`
}

export const getStatusColor = (percent: number, type: "sifat" | "konversiya" | "reja") => {
  const thresholds = {
    sifat: { good: 50, warning: 30 },
    konversiya: { good: 10, warning: 5 },
    reja: { good: 80, warning: 50 }
  }
  
  const t = thresholds[type]
  if (percent >= t.good) return "text-emerald-600"
  if (percent >= t.warning) return "text-amber-600"
  return "text-red-600"
}

export const getStatusBgColor = (percent: number, type: "sifat" | "konversiya" | "reja") => {
  const thresholds = {
    sifat: { good: 50, warning: 30 },
    konversiya: { good: 10, warning: 5 },
    reja: { good: 80, warning: 50 }
  }
  
  const t = thresholds[type]
  if (percent >= t.good) return "bg-emerald-100"
  if (percent >= t.warning) return "bg-amber-100"
  return "bg-red-100"
}

export const MONTHS_UZ = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
]

export const WEEKDAYS_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]
