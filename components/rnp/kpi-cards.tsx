"use client"

import { Card, CardContent } from "@/components/ui/card"
import { KPIData, formatNumber, formatPercent } from "@/lib/rnp-types"
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
      value: formatNumber(data.jamiByudjet),
      suffix: "so'm",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Sifatli Lead",
      value: formatNumber(data.sifatliLead),
      icon: UserCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Jami Lead",
      value: formatNumber(data.jamiLead),
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Jami Sotuv",
      value: formatNumber(data.jamiSotuv),
      icon: ShoppingCart,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "O'rtacha Lead Narxi",
      value: formatNumber(Math.round(data.ortachaLeadNarxi)),
      suffix: "so'm",
      icon: TrendingUp,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10"
    },
    {
      title: "O'rtacha Sotuv Narxi",
      value: formatNumber(Math.round(data.ortachaSotuvNarxi)),
      suffix: "so'm",
      icon: Activity,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10"
    },
    {
      title: "Reja Bajarilishi",
      value: formatPercent(data.rejaBarjarilishi),
      icon: Target,
      color: data.rejaBarjarilishi >= 80 ? "text-emerald-400" : data.rejaBarjarilishi >= 50 ? "text-amber-400" : "text-red-400",
      bgColor: data.rejaBarjarilishi >= 80 ? "bg-emerald-500/10" : data.rejaBarjarilishi >= 50 ? "bg-amber-500/10" : "bg-red-500/10"
    },
    {
      title: "Reja Lid",
      value: formatNumber(data.jamiRejaLid),
      icon: BarChart3,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border hover:border-primary/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">{card.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{card.value}</span>
                  {card.suffix && <span className="text-muted-foreground text-sm">{card.suffix}</span>}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
