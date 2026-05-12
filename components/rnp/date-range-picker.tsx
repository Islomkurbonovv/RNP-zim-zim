"use client"

import { useState, useMemo, useEffect } from "react"
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { DateRange, MONTHS_UZ, getDaysInMonth } from "@/lib/rnp-types"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

const WEEKDAYS_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]

interface PresetOption {
  label: string
  getValue: () => DateRange
}

// Helper to normalize dates (remove time component)
function normalizeDate(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper to compare dates (day level)
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(dateRange)
  const [viewMonth, setViewMonth] = useState(new Date())
  const [selectionPhase, setSelectionPhase] = useState<"start" | "end">("start")
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  // Sync tempRange when dateRange prop changes
  useEffect(() => {
    setTempRange(dateRange)
  }, [dateRange])

  const presets: PresetOption[] = useMemo(() => {
    const today = normalizeDate(new Date())
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 6)
    
    const last30Days = new Date(today)
    last30Days.setDate(last30Days.getDate() - 29)
    
    // This month (1st to last day)
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    // Last month
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    
    return [
      { label: "Bugun", getValue: () => ({ from: new Date(today), to: new Date(today) }) },
      { label: "Kecha", getValue: () => ({ from: new Date(yesterday), to: new Date(yesterday) }) },
      { label: "Oxirgi 7 kun", getValue: () => ({ from: new Date(last7Days), to: new Date(today) }) },
      { label: "Oxirgi 30 kun", getValue: () => ({ from: new Date(last30Days), to: new Date(today) }) },
      { label: "Bu oy", getValue: () => ({ from: new Date(thisMonthStart), to: new Date(thisMonthEnd) }) },
      { label: "O'tgan oy", getValue: () => ({ from: new Date(lastMonthStart), to: new Date(lastMonthEnd) }) },
    ]
  }, [])

  const formatDateInput = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${day}.${month}.${date.getFullYear()}`
  }

  // Smart display text formatting
  const displayText = useMemo(() => {
    const from = dateRange.from
    const to = dateRange.to
    
    // Single day
    if (isSameDay(from, to)) {
      return `${from.getDate()} ${MONTHS_UZ[from.getMonth()]}, ${from.getFullYear()}`
    }
    
    // Check if it's a full month
    const firstOfMonth = new Date(from.getFullYear(), from.getMonth(), 1)
    const lastOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0)
    if (isSameDay(from, firstOfMonth) && isSameDay(to, lastOfMonth)) {
      return `${MONTHS_UZ[from.getMonth()]} ${from.getFullYear()}`
    }
    
    // Same month range
    if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `${from.getDate()} - ${to.getDate()} ${MONTHS_UZ[from.getMonth()]}, ${from.getFullYear()}`
    }
    
    // Cross-month range (same year)
    if (from.getFullYear() === to.getFullYear()) {
      return `${from.getDate()} ${MONTHS_UZ[from.getMonth()]} - ${to.getDate()} ${MONTHS_UZ[to.getMonth()]}, ${from.getFullYear()}`
    }
    
    // Cross-year range
    return `${from.getDate()} ${MONTHS_UZ[from.getMonth()]}, ${from.getFullYear()} - ${to.getDate()} ${MONTHS_UZ[to.getMonth()]}, ${to.getFullYear()}`
  }, [dateRange])

  // Check which preset is currently active
  const activePreset = useMemo(() => {
    for (const preset of presets) {
      const range = preset.getValue()
      if (isSameDay(tempRange.from, range.from) && isSameDay(tempRange.to, range.to)) {
        return preset.label
      }
    }
    return null
  }, [tempRange, presets])

  const handlePresetClick = (preset: PresetOption) => {
    const range = preset.getValue()
    setTempRange(range)
    setViewMonth(range.from)
    setSelectionPhase("start")
    setHoverDate(null)
  }

  const handleDayClick = (date: Date) => {
    const normalized = normalizeDate(date)
    
    if (selectionPhase === "start") {
      // First click - set start date, clear end, wait for second click
      setTempRange({ from: normalized, to: normalized })
      setSelectionPhase("end")
    } else {
      // Second click - complete the range
      if (normalized < tempRange.from) {
        // Clicked date is before start - swap them
        setTempRange({ from: normalized, to: tempRange.from })
      } else {
        // Normal case - clicked date is end
        setTempRange({ from: tempRange.from, to: normalized })
      }
      setSelectionPhase("start")
      setHoverDate(null)
    }
  }

  const handleDayHover = (date: Date) => {
    if (selectionPhase === "end") {
      setHoverDate(normalizeDate(date))
    }
  }

  const handleMouseLeave = () => {
    setHoverDate(null)
  }

  const handleApply = () => {
    onDateRangeChange(tempRange)
    // Save to localStorage
    localStorage.setItem("rnp-date-range", JSON.stringify({
      from: tempRange.from.toISOString(),
      to: tempRange.to.toISOString()
    }))
    setOpen(false)
  }

  const handleCancel = () => {
    setTempRange(dateRange)
    setSelectionPhase("start")
    setHoverDate(null)
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempRange(dateRange)
      setViewMonth(dateRange.from)
      setSelectionPhase("start")
      setHoverDate(null)
    } else {
      // Clicking outside = cancel
      setTempRange(dateRange)
      setSelectionPhase("start")
      setHoverDate(null)
    }
    setOpen(isOpen)
  }

  const nextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)

  // Calculate preview range for hover effect
  const previewRange = useMemo(() => {
    if (selectionPhase === "end" && hoverDate) {
      if (hoverDate < tempRange.from) {
        return { from: hoverDate, to: tempRange.from }
      }
      return { from: tempRange.from, to: hoverDate }
    }
    return tempRange
  }, [selectionPhase, hoverDate, tempRange])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="h-9 px-3 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
        >
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
          {displayText}
          <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-xl" align="start">
        <div className="flex">
          {/* Presets Sidebar */}
          <div className="w-40 border-r border-gray-200 py-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors",
                  activePreset === preset.label 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-700"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {/* Calendars */}
          <div className="p-4" onMouseLeave={handleMouseLeave}>
            {/* Selection hint */}
            {selectionPhase === "end" && (
              <div className="text-sm text-blue-600 mb-3 text-center font-medium">
                Endi tugash kunini tanlang
              </div>
            )}
            
            <div className="flex gap-4">
              <CalendarMonth 
                month={viewMonth}
                selectedRange={tempRange}
                previewRange={previewRange}
                onDayClick={handleDayClick}
                onDayHover={handleDayHover}
                onPrevMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                onNextMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                showNav="prev"
                isSelectingEnd={selectionPhase === "end"}
              />
              <CalendarMonth 
                month={nextMonth}
                selectedRange={tempRange}
                previewRange={previewRange}
                onDayClick={handleDayClick}
                onDayHover={handleDayHover}
                onPrevMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                onNextMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                showNav="next"
                isSelectingEnd={selectionPhase === "end"}
              />
            </div>
            
            {/* Date Inputs and Buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">From:</span>
                  <Input 
                    value={formatDateInput(tempRange.from)}
                    readOnly
                    className="w-28 h-8 text-sm bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">To:</span>
                  <Input 
                    value={formatDateInput(tempRange.to)}
                    readOnly
                    className="w-28 h-8 text-sm bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Bekor qilish
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApply}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Tasdiqlash
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface CalendarMonthProps {
  month: Date
  selectedRange: DateRange
  previewRange: DateRange
  onDayClick: (date: Date) => void
  onDayHover: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  showNav: "prev" | "next"
  isSelectingEnd: boolean
}

function CalendarMonth({ 
  month, 
  selectedRange, 
  previewRange,
  onDayClick, 
  onDayHover,
  onPrevMonth, 
  onNextMonth, 
  showNav,
  isSelectingEnd
}: CalendarMonthProps) {
  const today = normalizeDate(new Date())
  
  const daysInMonth = getDaysInMonth(month)
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  let startDay = firstDayOfMonth.getDay()
  startDay = startDay === 0 ? 6 : startDay - 1 // Adjust for Monday start
  
  const days: (number | null)[] = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  
  // Add the days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  
  const getDateForDay = (day: number) => 
    new Date(month.getFullYear(), month.getMonth(), day)
  
  const isInPreviewRange = (day: number) => {
    const date = normalizeDate(getDateForDay(day))
    return date >= previewRange.from && date <= previewRange.to
  }
  
  const isRangeStart = (day: number) => {
    return isSameDay(getDateForDay(day), previewRange.from)
  }
  
  const isRangeEnd = (day: number) => {
    return isSameDay(getDateForDay(day), previewRange.to)
  }
  
  const isToday = (day: number) => {
    return isSameDay(getDateForDay(day), today)
  }

  return (
    <div className="w-64">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        {showNav === "prev" ? (
          <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8 text-gray-700 hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : <div className="w-8" />}
        <span className="font-bold text-gray-900">
          {MONTHS_UZ[month.getMonth()]} {month.getFullYear()}
        </span>
        {showNav === "next" ? (
          <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8 text-gray-700 hover:bg-gray-100">
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : <div className="w-8" />}
      </div>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {WEEKDAYS_UZ.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, index) => (
          <div key={index} className="relative">
            {day !== null ? (
              <button
                onClick={() => onDayClick(getDateForDay(day))}
                onMouseEnter={() => onDayHover(getDateForDay(day))}
                className={cn(
                  "w-full aspect-square flex items-center justify-center text-sm transition-colors relative z-10",
                  // Default state
                  "text-gray-900 hover:bg-gray-100",
                  // In range (not start/end)
                  isInPreviewRange(day) && !isRangeStart(day) && !isRangeEnd(day) && 
                    "bg-blue-100 text-blue-900 hover:bg-blue-200",
                  // Range start
                  isRangeStart(day) && "bg-blue-600 text-white rounded-l-md hover:bg-blue-700",
                  // Range end
                  isRangeEnd(day) && "bg-blue-600 text-white rounded-r-md hover:bg-blue-700",
                  // Single day (start and end same)
                  isRangeStart(day) && isRangeEnd(day) && "rounded-md",
                  // Today indicator (when not selected)
                  isToday(day) && !isRangeStart(day) && !isRangeEnd(day) && !isInPreviewRange(day) && 
                    "ring-2 ring-blue-500 ring-inset rounded-md"
                )}
              >
                {day}
              </button>
            ) : (
              <div className="w-full aspect-square" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
