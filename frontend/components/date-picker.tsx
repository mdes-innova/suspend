'use client';

import { cn } from "@/lib/utils";
import { th } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useNavigation, CaptionProps } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();

  const yearBE = props.displayMonth.getFullYear() + 543;
  const month = props.displayMonth.toLocaleString('th-TH', { month: 'long' });

  return (
    <div className="flex justify-between items-center px-2 py-1">
      {/* Prev button */}
      <button
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Thai month + Buddhist year */}
      <div className="font-medium">
        {month} {yearBE}
      </div>

      {/* Next button */}
      <button
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function DatePicker() {
  const [date, setDate] = React.useState<Date>()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function ThaiDatePicker({
  date, setDate
}: {
  date: Date,
  setDate:  React.Dispatch<React.SetStateAction<Date>>
}) {
  const [open, setOpen] = React.useState(false);

  const formatThaiDate = (date: Date) => {
    const dayMonth = format(date, 'd MMMM', { locale: th });
    const year = date.getFullYear() + 543;
    return `${dayMonth} ${year}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          {date ? formatThaiDate(date) : 'เลือกวันที่'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate: Date | undefined) => {
            if (selectedDate) {
              setDate(selectedDate);
              setOpen(false);
            }
          }}
          locale={th}
          initialFocus
          components={{ Caption: CustomCaption }}
        />
      </PopoverContent>
    </Popover>
  );
}