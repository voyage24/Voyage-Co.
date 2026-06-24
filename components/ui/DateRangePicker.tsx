"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  onClose: () => void;
  minDate?: Date;
  singleDate?: boolean;
  initialSelecting?: "start" | "end";
}

const DAY_KEYS = ["datePicker.day.0", "datePicker.day.1", "datePicker.day.2", "datePicker.day.3", "datePicker.day.4", "datePicker.day.5", "datePicker.day.6"];
const MONTH_KEYS = [
  "datePicker.month.0", "datePicker.month.1", "datePicker.month.2", "datePicker.month.3",
  "datePicker.month.4", "datePicker.month.5", "datePicker.month.6", "datePicker.month.7",
  "datePicker.month.8", "datePicker.month.9", "datePicker.month.10", "datePicker.month.11",
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface MonthCalendarProps {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  minDate: Date;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
  singleDate?: boolean;
}

function MonthCalendar({
  year, month, startDate, endDate, hoverDate, minDate,
  onDateClick, onDateHover, singleDate,
}: MonthCalendarProps) {
  const { t } = useLanguage();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const today = startOfDay(new Date());

  const effectiveEnd = singleDate ? startDate : (endDate || hoverDate);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="min-w-[280px]">
      <p className="text-center font-semibold text-gray-800 mb-4">
        {t(MONTH_KEYS[month])} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {DAY_KEYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-600 py-1">
            {t(d)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const isStart = startDate ? isSameDay(date, startDate) : false;
          const isEnd = effectiveEnd ? isSameDay(date, effectiveEnd) : false;
          const inRange = !singleDate && isInRange(date, startDate, effectiveEnd);
          const isToday = isSameDay(date, today);
          const disabled = date.getTime() < minDate.getTime();
          const isSelected = isStart || isEnd;

          let bgClass = "";
          if (!singleDate && (isStart || isEnd) && startDate && effectiveEnd && !isSameDay(startDate, effectiveEnd)) {
            if (isStart) bgClass = "bg-blue-50 rounded-l-full";
            if (isEnd) bgClass = "bg-blue-50 rounded-r-full";
          }
          if (inRange) bgClass = "bg-blue-50";

          return (
            <div key={i} className={`relative ${bgClass}`}>
              <button
                disabled={disabled}
                onClick={() => !disabled && onDateClick(date)}
                onMouseEnter={() => !disabled && onDateHover(date)}
                onMouseLeave={() => onDateHover(null)}
                className={[
                  "w-full aspect-square flex items-center justify-center text-sm rounded-full transition-colors",
                  disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "cursor-pointer",
                  isSelected
                    ? "bg-brand-blue text-white font-semibold shadow-sm"
                    : !disabled
                    ? "hover:bg-blue-100 text-gray-700"
                    : "",
                  isToday && !isSelected
                    ? "font-bold text-brand-blue"
                    : "",
                ].join(" ")}
              >
                {date.getDate()}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-blue" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  startDate, endDate, onChange, onClose,
  minDate: minDateProp, singleDate = false, initialSelecting,
}: DateRangePickerProps) {
  const { t } = useLanguage();
  const today = startOfDay(new Date());
  const minDate = minDateProp ? startOfDay(minDateProp) : today;

  const initMonth = startDate
    ? startDate.getMonth()
    : today.getMonth();
  const initYear = startDate
    ? startDate.getFullYear()
    : today.getFullYear();

  const [navYear, setNavYear] = useState(initYear);
  const [navMonth, setNavMonth] = useState(initMonth);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<"start" | "end">(
    initialSelecting ?? (!startDate ? "start" : !endDate ? "end" : "start")
  );

  const secondYear = navMonth === 11 ? navYear + 1 : navYear;
  const secondMonth = navMonth === 11 ? 0 : navMonth + 1;

  const goBack = useCallback(() => {
    if (navMonth === 0) { setNavMonth(11); setNavYear(y => y - 1); }
    else setNavMonth(m => m - 1);
  }, [navMonth]);

  const goForward = useCallback(() => {
    if (navMonth === 11) { setNavMonth(0); setNavYear(y => y + 1); }
    else setNavMonth(m => m + 1);
  }, [navMonth]);

  const handleDateClick = useCallback((date: Date) => {
    if (singleDate) {
      onChange(date, null);
      onClose();
      return;
    }
    if (selecting === "start" || (startDate && date < startDate)) {
      onChange(date, null);
      setSelecting("end");
    } else {
      onChange(startDate, date);
      setSelecting("start");
      onClose();
    }
  }, [selecting, startDate, onChange, onClose, singleDate]);

  const handleClear = () => {
    onChange(null, null);
    setSelecting("start");
  };

  const nightCount = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
    : null;

  const canGoBack = new Date(navYear, navMonth, 1) > minDate;

  return (
    <div className="animate-slide-down bg-white rounded-2xl shadow-widget border border-gray-100 p-5 w-full max-w-[640px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-sm">
          {!singleDate && (
            <>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${selecting === "start" ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-600"}`}>
                {t("datePicker.departure")}
                {startDate && <span className="ml-1">{startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>}
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${selecting === "end" ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-600"}`}>
                {t("datePicker.return")}
                {endDate && <span className="ml-1">{endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>}
              </div>
              {nightCount && (
                <span className="text-xs text-gray-500 self-center">{nightCount} {nightCount > 1 ? t("datePicker.nights") : t("datePicker.night")}</span>
              )}
            </>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex gap-8 sm:gap-16">
          <span className="text-sm font-semibold text-gray-700">
            {t(MONTH_KEYS[navMonth])} {navYear}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {t(MONTH_KEYS[secondMonth])} {secondYear}
          </span>
        </div>
        <button onClick={goForward} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Calendars */}
      <div className="flex gap-6 overflow-x-auto">
        <MonthCalendar
          year={navYear} month={navMonth}
          startDate={startDate} endDate={endDate}
          hoverDate={hoverDate} minDate={minDate}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
          singleDate={singleDate}
        />
        <div className="w-px bg-gray-100 shrink-0" />
        <MonthCalendar
          year={secondYear} month={secondMonth}
          startDate={startDate} endDate={endDate}
          hoverDate={hoverDate} minDate={minDate}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
          singleDate={singleDate}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-brand-blue transition-colors"
        >
          {t("datePicker.clearDates")}
        </button>
        {!singleDate && (
          <p className="text-xs text-gray-600">
            {selecting === "start" ? t("datePicker.selectDeparture") : t("datePicker.selectReturn")}
          </p>
        )}
      </div>
    </div>
  );
}
