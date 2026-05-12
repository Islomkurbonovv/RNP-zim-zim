"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyEntry } from "@/lib/rnp-types"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts"

interface DashboardChartsProps {
  entries: DailyEntry[]
}

export function DashboardCharts({ entries }: DashboardChartsProps) {
  // Filter entries with actual data
  const dataWithValues = entries.filter(e => e.byudjet > 0 || e.jamiLead > 0 || e.sotuv > 0)
  
  const chartData = dataWithValues.map(entry => ({
    name: `${entry.day}`,
    byudjet: entry.byudjet,
    sifatli: entry.sifatliLead,
    jamiLead: entry.jamiLead,
    sotuv: entry.sotuv,
    sifatPercent: entry.sifatPercent,
    konversiyaPercent: entry.konversiyaPercent,
    rejaPercent: entry.rejaPercent
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lead Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-lg">Leadlar va Sotuvlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Bar 
                  dataKey="sifatli" 
                  name="Sifatli Lead"
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="jamiLead" 
                  name="Jami Lead"
                  fill="hsl(var(--chart-1))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="sotuv" 
                  name="Sotuv"
                  fill="hsl(var(--chart-3))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Budget Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-lg">Byudjet Dinamikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorByudjet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [value.toLocaleString() + " so'm", "Byudjet"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="byudjet" 
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorByudjet)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Percentages Chart */}
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-lg">Sifat, Konversiya va Reja Foizlari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSifat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorKonversiya" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReja" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sifatPercent" 
                  name="Sifat %"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSifat)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="konversiyaPercent" 
                  name="Konversiya %"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorKonversiya)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="rejaPercent" 
                  name="Reja %"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReja)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
