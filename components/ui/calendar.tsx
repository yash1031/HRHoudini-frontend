"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.defaultMonth || props.month || new Date())
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const currentMonthIndex = month.getMonth()
  const currentYear = month.getFullYear()
  const years = React.useMemo(() => 
    Array.from({ length: 20 }, (_, i) => currentYear - 10 + i),
    [currentYear]
  )

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(month)
    newDate.setMonth(parseInt(monthIndex))
    setMonth(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(month)
    newDate.setFullYear(parseInt(year))
    setMonth(newDate)
  }

  const goToPreviousMonth = () => {
    const newDate = new Date(month)
    newDate.setMonth(newDate.getMonth() - 1)
    setMonth(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(month)
    newDate.setMonth(newDate.getMonth() + 1)
    setMonth(newDate)
  }

  // Sync month state when defaultMonth or month prop changes
  React.useEffect(() => {
    if (props.month) {
      setMonth(props.month)
    } else if (props.defaultMonth) {
      setMonth(props.defaultMonth)
    }
  }, [props.month, props.defaultMonth])

  React.useEffect(() => {
    const styleId = 'calendar-custom-styles'
    if (document.getElementById(styleId)) return
    
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .calendar-wrapper .rdp-day_range_start,
      .calendar-wrapper .rdp-day_range_start.rdp-day_selected,
      .calendar-wrapper [data-selected].rdp-day_range_start {
        background-color: rgb(37 99 235) !important;
        color: white !important;
        border-radius: 0.375rem 0 0 0.375rem !important;
      }
      .calendar-wrapper .rdp-day_range_end,
      .calendar-wrapper .rdp-day_range_end.rdp-day_selected,
      .calendar-wrapper [data-selected].rdp-day_range_end {
        background-color: rgb(37 99 235) !important;
        color: white !important;
        border-radius: 0 0.375rem 0.375rem 0 !important;
      }
      .calendar-wrapper .rdp-day_range_middle,
      .calendar-wrapper .rdp-day_range_middle.rdp-day_selected,
      .calendar-wrapper [data-selected].rdp-day_range_middle {
        background-color: rgb(219 234 254) !important;
        color: rgb(30 58 138) !important;
        border-radius: 0 !important;
      }
      .calendar-wrapper .rdp-day_selected:not(.rdp-day_range_start):not(.rdp-day_range_end):not(.rdp-day_range_middle),
      .calendar-wrapper [data-selected]:not(.rdp-day_range_start):not(.rdp-day_range_end):not(.rdp-day_range_middle) {
        background-color: rgb(37 99 235) !important;
        color: white !important;
        border-radius: 0.375rem !important;
      }
      .calendar-wrapper .rdp-day_selected:hover,
      .calendar-wrapper [data-selected]:hover {
        background-color: rgb(29 78 216) !important;
      }
      .calendar-wrapper .rdp-caption,
      .calendar-wrapper .rdp-nav {
        display: none !important;
      }
      .calendar-wrapper [aria-selected="true"][data-range-start] {
        background-color: rgb(37 99 235) !important;
        color: white !important;
      }
      .calendar-wrapper [aria-selected="true"][data-range-end] {
        background-color: rgb(37 99 235) !important;
        color: white !important;
      }
      .calendar-wrapper [aria-selected="true"][data-range-middle] {
        background-color: rgb(219 234 254) !important;
        color: rgb(30 58 138) !important;
      }
      .calendar-wrapper .rdp-months {
        display: block !important;
      }
      .calendar-wrapper .rdp-month {
        display: block !important;
      }
      .calendar-wrapper .rdp-table {
        display: table !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        margin: 0 auto !important;
      }
      .calendar-wrapper .rdp-head_row,
      .calendar-wrapper .rdp-row {
        display: table-row !important;
      }
      .calendar-wrapper .rdp-head_cell,
      .calendar-wrapper .rdp-cell {
        display: table-cell !important;
        width: 36px !important;
        min-width: 36px !important;
        max-width: 36px !important;
        text-align: center !important;
        vertical-align: middle !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }
      .calendar-wrapper .rdp-head_row .rdp-head_cell,
      .calendar-wrapper .rdp-row .rdp-cell {
        display: table-cell !important;
      }
      .calendar-wrapper .rdp-month .rdp-table {
        display: table !important;
      }
      .calendar-wrapper .rdp-month .rdp-table .rdp-head_row {
        display: table-row !important;
      }
      .calendar-wrapper .rdp-month .rdp-table .rdp-row {
        display: table-row !important;
      }
      .calendar-wrapper .rdp-month .rdp-table .rdp-head_row .rdp-head_cell {
        display: table-cell !important;
      }
      .calendar-wrapper .rdp-month .rdp-table .rdp-row .rdp-cell {
        display: table-cell !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  return (
    <div className="calendar-wrapper">
      {/* Custom Header - Rendered separately */}
      <div className="flex justify-between items-center px-3 pt-3 pb-2 bg-white">
        <div className="flex items-center gap-2">
          <Select
            value={currentMonthIndex.toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 w-[130px] text-sm border-gray-300 bg-white">
              <SelectValue placeholder={monthNames[currentMonthIndex]}>
                {monthNames[currentMonthIndex]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((monthName, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-[90px] text-sm border-gray-300 bg-white">
              <SelectValue placeholder={currentYear.toString()}>
                {currentYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="h-8 w-8 bg-white p-0 opacity-70 hover:opacity-100 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center transition-opacity"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="h-8 w-8 bg-white p-0 opacity-70 hover:opacity-100 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center transition-opacity"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* DayPicker with hidden caption */}
      <div className="px-3 pb-3">
        <DayPicker
          showOutsideDays={showOutsideDays}
          month={month}
          onMonthChange={setMonth}
          className={cn("", className)}
          classNames={{
            months: "",
            month: "",
            caption: "hidden",
            caption_label: "hidden",
            nav: "hidden",
            nav_button: "hidden",
            nav_button_previous: "hidden",
            nav_button_next: "hidden",
            table: "border-collapse mx-auto",
            head_row: "",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
            row: "",
            cell: "h-9 w-9 text-center text-sm p-0 relative",
            day: cn(
              "h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 cursor-pointer"
            ),
            day_today: "bg-gray-100 text-gray-900 font-bold",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
            day_hidden: "invisible",
            ...classNames,
          }}
          hideNavigation
          {...props}
        />
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
