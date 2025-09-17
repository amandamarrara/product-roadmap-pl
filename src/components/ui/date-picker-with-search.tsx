import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithSearchProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePickerWithSearch({
  selected,
  onSelect,
  placeholder = "Selecionar data",
  className
}: DatePickerWithSearchProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Update search value when selected date changes
  React.useEffect(() => {
    if (selected) {
      setSearchValue(format(selected, "dd/MM/yyyy"))
    } else {
      setSearchValue("")
    }
  }, [selected])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    
    // Try to parse different date formats
    const formats = ["dd/MM/yyyy", "dd/MM", "d/M/yyyy", "d/M"]
    
    for (const formatStr of formats) {
      try {
        const currentYear = new Date().getFullYear()
        let dateStr = value
        
        // If only dd/mm provided, add current year
        if (formatStr === "dd/MM" || formatStr === "d/M") {
          dateStr = value + "/" + currentYear
        }
        
        const parsedDate = parse(dateStr, formatStr === "dd/MM" || formatStr === "d/M" ? formatStr + "/yyyy" : formatStr, new Date())
        
        if (isValid(parsedDate)) {
          onSelect(parsedDate)
          return
        }
      } catch {
        // Continue to next format
      }
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Digite dd/mm/aaaa ou dd/mm"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="pl-8"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Formatos aceitos: 15/03/2024, 15/03, 1/3/2024, 1/3
          </p>
        </div>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onSelect(date)
            setIsOpen(false)
          }}
          initialFocus
          className="pointer-events-auto"
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}