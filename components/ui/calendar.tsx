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
  let years: number[] = []
  for(let year = 2025; year <= currentYear; year++) {
    years.push(year)
  }

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
        border-radius: 0.375rem !important;
      }
      .calendar-wrapper .rdp-day_range_end,
      .calendar-wrapper .rdp-day_range_end.rdp-day_selected,
      .calendar-wrapper [data-selected].rdp-day_range_end {
        background-color: rgb(37 99 235) !important;
        color: white !important;
        border-radius: 0.375rem !important;
      }
      .calendar-wrapper .rdp-day_range_middle,
      .calendar-wrapper .rdp-day_range_middle.rdp-day_selected,
      .calendar-wrapper [data-selected].rdp-day_range_middle {
        background-color: rgb(229 231 235) !important;
        color: rgb(55 65 81) !important;
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
        background-color: rgb(229 231 235) !important;
        color: rgb(55 65 81) !important;
      }
      .calendar-wrapper .rdp-months {
        display: block !important;
      }
      .calendar-wrapper .rdp-month {
        display: block !important;
      }
      .calendar-wrapper .rdp-table {
        width: 100% !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        table-layout: fixed !important;
      }
      .calendar-wrapper .rdp-head_row,
      .calendar-wrapper .rdp-row {
        display: table-row !important;
      }
      .calendar-wrapper .rdp-head_cell,
      .calendar-wrapper .rdp-cell {
        display: table-cell !important;
        width: 14.28% !important;
        text-align: center !important;
        vertical-align: middle !important;
        padding: 2px !important;
        box-sizing: border-box !important;
      }
      .calendar-wrapper .rdp-day {
        width: 36px !important;
        height: 36px !important;
        margin: 0 auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
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

  // Custom formatters for weekday labels
  const formatWeekdayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  return (
    <div className="calendar-wrapper">
      {/* Custom Header */}
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
      </div>

      {/* DayPicker */}
      <div className="px-3 pb-3">
        <DayPicker
          showOutsideDays={showOutsideDays}
          month={month}
          onMonthChange={setMonth}
          formatters={{
            formatWeekdayName
          }}
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
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell:
              "text-muted-foreground flex-1 font-medium text-xs text-center pb-2",
            row: "flex w-full mt-2",
            cell: "flex-1 text-center text-sm p-0 relative",
            day: cn(
              "h-9 w-9 p-3 font-normal rounded-md hover:bg-gray-100 cursor-pointer mx-auto"
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