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
import { useNavigation, CaptionProps, useDayPicker } from 'react-day-picker';
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
    const { fromYear, toYear } = useDayPicker();

    const currentYear = new Date().getFullYear();
    const start = fromYear ?? 1900;
    const end = toYear ?? currentYear + 20;

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
      // ✅ Only navigate; DO NOT change selected value
      goToMonth(new Date(y, m, 1));
      // (Removed: setDate(...))
      // (Do not close here)
    };

    return (
      <div className="flex items-center justify-between gap-2 p-2">
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={monthIndex}
          onChange={(e) => commit(yearValue, Number(e.target.value))}
        >
          {months.map(({ i, label }) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={yearValue}
          onChange={(e) => commit(Number(e.target.value), monthIndex)}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y + 543}</option>
          ))}
        </select>
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
            const first = new Date(d.getFullYear(), d.getMonth(), 1);
            setDate(first);      // selection changes only via day click
            setOpen(false);      // and close only then
          }}
          fromYear={1900}
          toYear={new Date().getFullYear() + 20}
          locale={th}
          initialFocus
          components={{ Caption: CustomCaption }}
        />
      </PopoverContent>
    </Popover>
  );
}