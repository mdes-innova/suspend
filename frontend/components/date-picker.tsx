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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";

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

      {/* ถัดไป button */}
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
  date: Date | undefined,
  setDate:  React.Dispatch<React.SetStateAction<Date | undefined>>
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

// export function ThaiDateYearPicker({
//   date, setDate
// }: {
//   date: Date | undefined,
//   setDate:  React.Dispatch<React.SetStateAction<Date | undefined>>
// }) {
//   const [open, setOpen] = React.useState(false);

//   const formatThaiDate = (date: Date) => {
//     const dayMonth = format(date, 'd MMMM', { locale: th });
//     const year = date.getFullYear() + 543;
//     return `${dayMonth} ${year}`;
//   };

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="outline" className="w-full">
//           {date ? formatThaiDate(date) : 'เลือกวันที่'}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={(selectedDate: Date | undefined) => {
//             if (selectedDate) {
//               setDate(selectedDate);
//               setOpen(false);
//             }
//           }}
//           locale={th}
//           initialFocus
//           components={{ Caption: CustomCaption }}
//         />
//       </PopoverContent>
//     </Popover>
//   );
// }

export function ThaiDateYearPicker({
  date, setDate
}: {
  date: Date | undefined,
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
}) {
  const [open, setOpen] = React.useState(false);

  const formatThaiMonthYear = (d: Date | undefined) => {
    if (d instanceof Date) {
      const dayMonth = format(date as Date, 'd MMMM', { locale: th });
      const year = d.getFullYear() + 543;
      return `${dayMonth} ${year}`;
    } else {
      return '';
    }
  };

  const CustomCaption: React.FC<CaptionProps> = ({ displayMonth }) => {
    const { goToMonth } = useNavigation();

    const currentYear = new Date().getFullYear();
    const start = 1950;
    const end = currentYear;

    const years = React.useMemo(
      () => Array.from({ length: end - start + 1 }, (_, i) => start + i),
      [start, end]
    );

    const months = React.useMemo(
      () => Array.from({ length: 12 }, (_, i) =>
        ({ i, label: format(new Date(2000, i, 1), "LLLL", { locale: th }) })
      ),
      []
    );

    const monthIndex = displayMonth.getMonth();
    const yearValue = displayMonth.getFullYear();

    const commit = (y: number, m: number) => {
      goToMonth(new Date(y, m, 1));
    };

    return (
      <div className="flex items-center justify-between gap-2 p-2">
        <Select
            name="month"
            value={`${monthIndex?? ''}`}
            onValueChange={(value: string) => commit(yearValue, Number(value))}
          >
          <SelectTrigger>
            <SelectValue placeholder="เลือกเดือน" />
          </SelectTrigger>
          <SelectContent>
              <SelectGroup>
              <SelectLabel>เดือน</SelectLabel>
                {months.map(({ i, label }) => (<SelectItem  
                    key={`month-${i}`} value={`${i}`}> {label}
                    </SelectItem>)
                )}
              </SelectGroup>
          </SelectContent>
        </Select> 
        <Select
            name="year"
            value={`${yearValue?? ''}`}
            onValueChange={(value: string) => commit(Number(value), monthIndex)}
          >
          <SelectTrigger>
            <SelectValue placeholder="เลือกปี" />
          </SelectTrigger>
          <SelectContent>
              <SelectGroup>
              <SelectLabel>ปี พ.ศ.</SelectLabel>
                {years.map((y) => (<SelectItem  
                    key={`year-${y}`} value={`${y}`}> {y + 543}
                    </SelectItem>)
                )}
              </SelectGroup>
          </SelectContent>
        </Select> 
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {date ? formatThaiMonthYear(date) : "เลือกเดือน/ปี"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        // Keep the popup open unless a day is picked
        onInteractOutside={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d: Date | undefined) => {
            if (!d) return;
            const selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            setDate(selectedDate);      // selection changes only via day click
            setOpen(false);      // and close only then
          }}
          fromYear={1950}
          toYear={new Date().getFullYear()}
          locale={th}
          initialFocus
          components={{ Caption: CustomCaption }}
        />
      </PopoverContent>
    </Popover>
  );
}