"use client"

import { Card, CardContent } from "@/components/ui/card"
import { KPIData, formatNumber, formatPercent, formatCurrency } from "@/lib/rnp-types"
import { 
  DollarSign, 
  Users, 
  UserCheck, 
  ShoppingCart,
  TrendingUp,
  Target,
  BarChart3,
  Activity
} from "lucide-react"

interface KPICardsProps {
  data: KPIData
}

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: "Jami Byudjet",
      value: formatCurrency(data.jamiByudjet),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Sifatli Lead",
      value: formatNumber(data.sifatliLead),
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Jami Lead",
      value: formatNumber(data.jamiLead),
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      title: "Jami Sotuv",
      value: formatNumber(data.jamiSotuv),
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "O'rtacha Lead Narxi",
      value: formatCurrency(Math.round(data.ortachaLeadNarxi)),
      icon: TrendingUp,
      color: "text-sky-600",
      bgColor: "bg-sky-50"
    },
    {
      title: "O'rtacha Sotuv Narxi",
      value: formatCurrency(Math.round(data.ortachaSotuvNarxi)),
      icon: Activity,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
    {
      title: "Reja Bajarilishi",
      value: formatPercent(data.rejaBarjarilishi),
      icon: Target,
      color: data.rejaBarjarilishi >= 80 ? "text-emerald-600" : data.rejaBarjarilishi >= 50 ? "text-amber-600" : "text-red-600",
      bgColor: data.rejaBarjarilishi >= 80 ? "bg-emerald-50" : data.rejaBarjarilishi >= 50 ? "bg-amber-50" : "bg-red-50"
    },
    {
      title: "Reja Lid",
      value: formatNumber(data.jamiRejaLid),
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
