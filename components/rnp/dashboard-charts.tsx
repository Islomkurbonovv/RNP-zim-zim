"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyEntry } from "@/lib/rnp-types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
  Cell,
  ReferenceLine
} from "recharts"

interface DashboardChartsProps {
  entries: DailyEntry[]
}

// Custom tooltip for Plan vs Actual chart
const PlanVsActualTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const actual = payload.find(p => p.name === "Sifatli Lead")?.value || 0
    const plan = payload.find(p => p.name === "Reja Lid")?.value || 0
    const diff = actual - plan
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">Kun {label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-500">Reja: <span className="font-medium text-gray-700">{plan}</span></p>
          <p className="text-emerald-600">Fakt: <span className="font-medium">{actual}</span></p>
          <p className={diff >= 0 ? "text-emerald-600" : "text-red-600"}>
            Farq: <span className="font-medium">{diff >= 0 ? "+" : ""}{diff}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

// Custom tooltip for conversion chart
const ConversionTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { sifatli: number; sotuv: number; konversiyaPercent: number } }>; label?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">Kun {label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">Sifatli Lead: <span className="font-medium">{data.sifatli}</span></p>
          <p className="text-gray-600">Sotuv: <span className="font-medium">{data.sotuv}</span></p>
          <p className="text-blue-600">Konversiya: <span className="font-medium">{data.konversiyaPercent.toFixed(1)}%</span></p>
        </div>
      </div>
    )
  }
  return null
}

// Get bar color based on conversion percentage
const getConversionColor = (percent: number) => {
  if (percent >= 10) return "#10B981" // Green
  if (percent >= 5) return "#F59E0B" // Amber
  return "#EF4444" // Red
}

export function DashboardCharts({ entries }: DashboardChartsProps) {
  // Filter entries with actual data
  const dataWithValues = entries.filter(e => e.byudjet > 0 || e.jamiLead > 0 || e.sotuv > 0 || e.rejaLid > 0)
  
  const chartData = dataWithValues.map(entry => ({
    name: `${entry.day}`,
    day: entry.day,
    byudjet: entry.byudjet,
    sifatli: entry.sifatliLead,
    jamiLead: entry.jamiLead,
    sotuv: entry.sotuv,
    rejaLid: entry.rejaLid,
    sifatPercent: entry.sifatPercent,
    konversiyaPercent: entry.konversiyaPercent,
    rejaPercent: entry.rejaPercent
  }))

  // For the Plan vs Actual chart, we need all days even if no data
  const allDaysData = entries.map(entry => ({
    name: `${entry.day}`,
    day: entry.day,
    sifatli: entry.sifatliLead,
    rejaLid: entry.rejaLid,
    sotuv: entry.sotuv,
    byudjet: entry.byudjet,
    sifatPercent: entry.sifatPercent,
    konversiyaPercent: entry.konversiyaPercent,
    rejaPercent: entry.rejaPercent
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Plan vs Actual - Line Chart */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-lg font-semibold">Reja vs Fakt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={allDaysData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<PlanVsActualTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="rejaLid" 
                  name="Reja Lid"
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="sifatli" 
                  name="Sifatli Lead"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  dot={{ fill: "#10B981", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#10B981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Daily Conversion % - Bar Chart */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-lg font-semibold">Kunlik Konversiya %</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<ConversionTooltip />} />
                <ReferenceLine y={10} stroke="#10B981" strokeDasharray="3 3" label={{ value: "10%", position: "right", fill: "#10B981", fontSize: 10 }} />
                <ReferenceLine y={5} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: "5%", position: "right", fill: "#F59E0B", fontSize: 10 }} />
                <Bar 
                  dataKey="konversiyaPercent" 
                  name="Konversiya %"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getConversionColor(entry.konversiyaPercent)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Budget vs Sales - Dual Axis Line Chart */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-lg font-semibold">Byudjet va Sotuv Dinamikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#3B82F6"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#8B5CF6"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "Byudjet") return [`$${value.toLocaleString()}`, name]
                    return [value, name]
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="line"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="byudjet" 
                  name="Byudjet"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ fill: "#3B82F6", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#3B82F6" }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="sotuv" 
                  name="Sotuv"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ fill: "#8B5CF6", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#8B5CF6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 4: Quality and Conversion Trends - Multi-Line Chart */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-lg font-semibold">Sifat va Konversiya Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="sifatPercent" 
                  name="Sifat %"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10B981", strokeWidth: 0, r: 2 }}
                  activeDot={{ r: 4, fill: "#10B981" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="konversiyaPercent" 
                  name="Konversiya %"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ fill: "#3B82F6", strokeWidth: 0, r: 2 }}
                  activeDot={{ r: 4, fill: "#3B82F6" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rejaPercent" 
                  name="Reja %"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ fill: "#F59E0B", strokeWidth: 0, r: 2 }}
                  activeDot={{ r: 4, fill: "#F59E0B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
