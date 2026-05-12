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
import { DailyEntry, formatNumber, formatPercent, getStatusColor, getStatusBgColor } from "@/lib/rnp-types"
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

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-muted-foreground font-semibold w-16">Kun</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Byudjet</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Sifatli</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Jami Lead</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Sotuv</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Sifatsiz</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center">Reja Lid</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center">Sifat %</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center">Konversiya %</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center">Reja %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.day} className="hover:bg-muted/30">
                <TableCell className="font-medium text-foreground">{entry.day}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={entry.byudjet || ""}
                    onChange={(e) => handleChange(entry.day, "byudjet", e.target.value)}
                    className="w-28 h-8 bg-input border-border text-foreground text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={entry.sifatliLead || ""}
                    onChange={(e) => handleChange(entry.day, "sifatliLead", e.target.value)}
                    className="w-20 h-8 bg-input border-border text-foreground text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={entry.jamiLead || ""}
                    onChange={(e) => handleChange(entry.day, "jamiLead", e.target.value)}
                    className="w-20 h-8 bg-input border-border text-foreground text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={entry.sotuv || ""}
                    onChange={(e) => handleChange(entry.day, "sotuv", e.target.value)}
                    className="w-20 h-8 bg-input border-border text-foreground text-sm"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <div className="w-20 h-8 flex items-center text-muted-foreground text-sm">
                    {entry.sifatsiz}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-muted-foreground text-sm">{entry.rejaLid || "-"}</span>
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
            <TableRow className="bg-primary/10 hover:bg-primary/15 font-bold">
              <TableCell className="text-foreground">JAMI</TableCell>
              <TableCell className="text-foreground">{formatNumber(totals.byudjet)}</TableCell>
              <TableCell className="text-foreground">{formatNumber(totals.sifatliLead)}</TableCell>
              <TableCell className="text-foreground">{formatNumber(totals.jamiLead)}</TableCell>
              <TableCell className="text-foreground">{formatNumber(totals.sotuv)}</TableCell>
              <TableCell className="text-foreground">{formatNumber(totals.sifatsiz)}</TableCell>
              <TableCell className="text-foreground text-center">{formatNumber(totals.rejaLid)}</TableCell>
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
