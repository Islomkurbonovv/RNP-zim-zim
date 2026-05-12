"use client"

import { useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DailyEntry, formatNumber, formatPercent, formatCurrency, getStatusColor, getStatusBgColor } from "@/lib/rnp-types"
import { cn } from "@/lib/utils"

interface DataTableProps {
  entries: DailyEntry[]
  onUpdateEntry: (day: number, field: keyof DailyEntry, value: number) => void
}

export function DataTable({ entries, onUpdateEntry }: DataTableProps) {
  const handleChange = useCallback((day: number, field: keyof DailyEntry, value: string) => {
    const numValue = parseFloat(value) || 0
    onUpdateEntry(day, field, numValue)
  }, [onUpdateEntry])

  // Calculate totals
  const totals = entries.reduce((acc, entry) => ({
    byudjet: acc.byudjet + entry.byudjet,
    sifatliLead: acc.sifatliLead + entry.sifatliLead,
    jamiLead: acc.jamiLead + entry.jamiLead,
    sotuv: acc.sotuv + entry.sotuv,
    sifatsiz: acc.sifatsiz + entry.sifatsiz,
    rejaLid: acc.rejaLid + entry.rejaLid
  }), { byudjet: 0, sifatliLead: 0, jamiLead: 0, sotuv: 0, sifatsiz: 0, rejaLid: 0 })

  const totalSifatPercent = totals.jamiLead > 0 ? (totals.sifatliLead / totals.jamiLead) * 100 : 0
  const totalKonversiyaPercent = totals.sifatliLead > 0 ? (totals.sotuv / totals.sifatliLead) * 100 : 0
  const totalRejaPercent = totals.rejaLid > 0 ? (totals.sifatliLead / totals.rejaLid) * 100 : 0

  // Calculate lead and sale prices
  const getLeadNarxi = (entry: DailyEntry) => {
    return entry.jamiLead > 0 ? entry.byudjet / entry.jamiLead : 0
  }
  
  const getSotuvNarxi = (entry: DailyEntry) => {
    return entry.sotuv > 0 ? entry.byudjet / entry.sotuv : 0
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-gray-600 font-semibold w-14">Kun</TableHead>
              <TableHead className="text-gray-600 font-semibold">Byudjet ($)</TableHead>
              <TableHead className="text-gray-600 font-semibold">Sifatli</TableHead>
              <TableHead className="text-gray-600 font-semibold">Jami Lead</TableHead>
              <TableHead className="text-gray-600 font-semibold">Sotuv</TableHead>
              <TableHead className="text-gray-600 font-semibold">Sifatsiz</TableHead>
              <TableHead className="text-gray-600 font-semibold text-center">Reja Lid</TableHead>
              <TableHead className="text-gray-600 font-semibold text-center">Lead Narxi</TableHead>
              <TableHead className="text-gray-600 font-semibold text-center">Sotuv Narxi</TableHead>
              <TableHead className="text-gray-600 font-semibold text-center">Sifat %</TableHead>
              <TableHead className="text-gray-600 font-semibold text-center">Konversiya %</TableHead>
              <TableHead className="text-gray-600 font-semibold text-center">Reja %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.day} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-900">{entry.day}</TableCell>
                <TableCell>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <Input
                      type="number"
                      value={entry.byudjet || ""}
                      onChange={(e) => handleChange(entry.day, "byudjet", e.target.value)}
                      className="w-28 h-8 pl-6 bg-white border-gray-200 text-gray-900 text-sm"
                      placeholder="0"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={entry.sifatliLead || ""}
                    onChange={(e) => handleChange(entry.day, "sifatliLead", e.target.value)}
                    className="w-20 h-8 bg-white border-gray-200 text-gray-900 text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={entry.jamiLead || ""}
                    onChange={(e) => handleChange(entry.day, "jamiLead", e.target.value)}
                    className="w-20 h-8 bg-white border-gray-200 text-gray-900 text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={entry.sotuv || ""}
                    onChange={(e) => handleChange(entry.day, "sotuv", e.target.value)}
                    className="w-20 h-8 bg-white border-gray-200 text-gray-900 text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <div className="w-16 h-8 flex items-center text-gray-500 text-sm">
                    {entry.sifatsiz}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-gray-500 text-sm">{entry.rejaLid || "-"}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-gray-700 text-sm font-medium">
                    {entry.jamiLead > 0 ? formatCurrency(Math.round(getLeadNarxi(entry))) : "-"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-gray-700 text-sm font-medium">
                    {entry.sotuv > 0 ? formatCurrency(Math.round(getSotuvNarxi(entry))) : "-"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "inline-flex px-2 py-1 rounded text-sm font-medium",
                    getStatusBgColor(entry.sifatPercent, "sifat"),
                    getStatusColor(entry.sifatPercent, "sifat")
                  )}>
                    {formatPercent(entry.sifatPercent)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "inline-flex px-2 py-1 rounded text-sm font-medium",
                    getStatusBgColor(entry.konversiyaPercent, "konversiya"),
                    getStatusColor(entry.konversiyaPercent, "konversiya")
                  )}>
                    {formatPercent(entry.konversiyaPercent)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "inline-flex px-2 py-1 rounded text-sm font-medium",
                    getStatusBgColor(entry.rejaPercent, "reja"),
                    getStatusColor(entry.rejaPercent, "reja")
                  )}>
                    {formatPercent(entry.rejaPercent)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {/* Totals Row */}
            <TableRow className="bg-gray-100 hover:bg-gray-100 font-bold border-t-2 border-gray-300">
              <TableCell className="text-gray-900">JAMI</TableCell>
              <TableCell className="text-gray-900">{formatCurrency(totals.byudjet)}</TableCell>
              <TableCell className="text-gray-900">{formatNumber(totals.sifatliLead)}</TableCell>
              <TableCell className="text-gray-900">{formatNumber(totals.jamiLead)}</TableCell>
              <TableCell className="text-gray-900">{formatNumber(totals.sotuv)}</TableCell>
              <TableCell className="text-gray-900">{formatNumber(totals.sifatsiz)}</TableCell>
              <TableCell className="text-gray-900 text-center">{formatNumber(totals.rejaLid)}</TableCell>
              <TableCell className="text-gray-900 text-center">
                {totals.jamiLead > 0 ? formatCurrency(Math.round(totals.byudjet / totals.jamiLead)) : "-"}
              </TableCell>
              <TableCell className="text-gray-900 text-center">
                {totals.sotuv > 0 ? formatCurrency(Math.round(totals.byudjet / totals.sotuv)) : "-"}
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "inline-flex px-2 py-1 rounded text-sm font-medium",
                  getStatusBgColor(totalSifatPercent, "sifat"),
                  getStatusColor(totalSifatPercent, "sifat")
                )}>
                  {formatPercent(totalSifatPercent)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "inline-flex px-2 py-1 rounded text-sm font-medium",
                  getStatusBgColor(totalKonversiyaPercent, "konversiya"),
                  getStatusColor(totalKonversiyaPercent, "konversiya")
                )}>
                  {formatPercent(totalKonversiyaPercent)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "inline-flex px-2 py-1 rounded text-sm font-medium",
                  getStatusBgColor(totalRejaPercent, "reja"),
                  getStatusColor(totalRejaPercent, "reja")
                )}>
                  {formatPercent(totalRejaPercent)}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
