"use client"

import { useState, useMemo } from "react"
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

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(dateRange)
  const [viewMonth, setViewMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)

  const presets: PresetOption[] = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 6)
    
    const last14Days = new Date(today)
    last14Days.setDate(last14Days.getDate() - 13)
    
    const last30Days = new Date(today)
    last30Days.setDate(last30Days.getDate() - 29)
    
    const thisWeekStart = new Date(today)
    const dayOfWeek = thisWeekStart.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    thisWeekStart.setDate(thisWeekStart.getDate() - diff)
    
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    
    const maxStart = new Date(2020, 0, 1)
    
    return [
      { label: "Bugun", getValue: () => ({ from: today, to: today }) },
      { label: "Kecha", getValue: () => ({ from: yesterday, to: yesterday }) },
      { label: "Oxirgi 7 kun", getValue: () => ({ from: last7Days, to: today }) },
      { label: "Oxirgi 14 kun", getValue: () => ({ from: last14Days, to: today }) },
      { label: "Oxirgi 30 kun", getValue: () => ({ from: last30Days, to: today }) },
      { label: "Bu hafta", getValue: () => ({ from: thisWeekStart, to: today }) },
      { label: "O'tgan hafta", getValue: () => ({ from: lastWeekStart, to: lastWeekEnd }) },
      { label: "Bu oy", getValue: () => ({ from: thisMonthStart, to: thisMonthEnd }) },
      { label: "O'tgan oy", getValue: () => ({ from: lastMonthStart, to: lastMonthEnd }) },
      { label: "Maksimal", getValue: () => ({ from: maxStart, to: today }) },
    ]
  }, [])

  const formatDateDisplay = (date: Date) => {
    return `${date.getDate()} ${MONTHS_UZ[date.getMonth()]}, ${date.getFullYear()}`
  }

  const formatDateInput = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${day}.${month}.${date.getFullYear()}`
  }

  const displayText = useMemo(() => {
    const from = dateRange.from
    const to = dateRange.to
    
    if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `${from.getDate()} - ${to.getDate()} ${MONTHS_UZ[from.getMonth()]}, ${from.getFullYear()}`
    }
    return `${formatDateDisplay(from)} - ${formatDateDisplay(to)}`
  }, [dateRange])

  const handlePresetClick = (preset: PresetOption) => {
    const range = preset.getValue()
    setTempRange(range)
    setViewMonth(range.from)
  }

  const handleDayClick = (date: Date) => {
    if (selectingStart) {
      setTempRange({ from: date, to: date })
      setSelectingStart(false)
    } else {
      if (date < tempRange.from) {
        setTempRange({ from: date, to: tempRange.from })
      } else {
        setTempRange({ ...tempRange, to: date })
      }
      setSelectingStart(true)
    }
  }

  const handleApply = () => {
    onDateRangeChange(tempRange)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempRange(dateRange)
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempRange(dateRange)
      setViewMonth(dateRange.from)
      setSelectingStart(true)
    }
    setOpen(isOpen)
  }

  const nextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="h-9 px-3 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium"
        >
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
          {displayText}
          <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-xl" align="start">
        <div className="flex">
          {/* Presets Sidebar */}
          <div className="w-44 border-r border-gray-200 py-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors",
                  preset.label === "Bu oy" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {/* Calendars */}
          <div className="p-4">
            <div className="flex gap-4">
              <CalendarMonth 
                month={viewMonth}
                selectedRange={tempRange}
                onDayClick={handleDayClick}
                onPrevMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                onNextMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                showNav="prev"
              />
              <CalendarMonth 
                month={nextMonth}
                selectedRange={tempRange}
                onDayClick={handleDayClick}
                onPrevMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                onNextMonth={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                showNav="next"
              />
            </div>
            
            {/* Date Inputs and Buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
  onDayClick: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  showNav: "prev" | "next"
}

function CalendarMonth({ month, selectedRange, onDayClick, onPrevMonth, onNextMonth, showNav }: CalendarMonthProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
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
  
  const isInRange = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    return date >= selectedRange.from && date <= selectedRange.to
  }
  
  const isRangeStart = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    return date.getTime() === selectedRange.from.getTime()
  }
  
  const isRangeEnd = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    return date.getTime() === selectedRange.to.getTime()
  }
  
  const isToday = (day: number) => {
    return month.getFullYear() === today.getFullYear() && 
           month.getMonth() === today.getMonth() && 
           day === today.getDate()
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
                onClick={() => onDayClick(new Date(month.getFullYear(), month.getMonth(), day))}
                className={cn(
                  "w-full aspect-square flex items-center justify-center text-sm transition-colors relative z-10 text-gray-900",
                  isInRange(day) && !isRangeStart(day) && !isRangeEnd(day) && "bg-blue-100 text-blue-900",
                  isRangeStart(day) && "bg-blue-600 text-white rounded-l-md",
                  isRangeEnd(day) && "bg-blue-600 text-white rounded-r-md",
                  isRangeStart(day) && isRangeEnd(day) && "rounded-md",
                  !isInRange(day) && "hover:bg-gray-100",
                  isToday(day) && !isRangeStart(day) && !isRangeEnd(day) && "ring-2 ring-blue-500 ring-inset rounded-md"
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
