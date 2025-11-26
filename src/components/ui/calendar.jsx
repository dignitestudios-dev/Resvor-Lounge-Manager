"use client";
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const toDate = (isoOrStr) => {
  const d =
    typeof isoOrStr === "string" ? new Date(isoOrStr + "T00:00:00") : isoOrStr;
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatISO = (d) => d.toISOString().slice(0, 10);

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const isSameDay = (a, b) => a.getTime() === b.getTime();

const Calendar = ({ selectedDate, onDateSelect, initialMonth }) => {
  const today = useMemo(() => {
    const d = initialMonth ? new Date(initialMonth + "-01") : new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [initialMonth]);

  const [currentMonth, setCurrentMonth] = useState(today);

  const startOfMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    [currentMonth]
  );
  const endOfMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
    [currentMonth]
  );

  const startDayOffset = (startOfMonth.getDay() + 6) % 7;
  const totalDays = endOfMonth.getDate();

  const gridDays = useMemo(() => {
    const days = [];
    for (let i = -startDayOffset; i < totalDays; i++) {
      days.push(addDays(startOfMonth, i));
    }
    while (days.length % 7 !== 0) days.push(addDays(startOfMonth, days.length));
    return days;
  }, [startOfMonth, startDayOffset, totalDays]);

  const prevMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div className="w-full max-w-[780px] bg-white rounded-3xl p-6 shadow-custom-sm">
      {/* Header with Month/Year and Nav Buttons */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 shadow-sm rounded-full hover:bg-gray-100 transition"
        >
          <ChevronLeft size={28} className="text-[#1a1a6e]" />
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-[#1a1a6e]">
            {currentMonth.toLocaleString(undefined, { month: "long" })}
          </h3>
          <h3 className="text-2xl font-bold text-[#1a1a6e]">
            {currentMonth.getFullYear()}
          </h3>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 shadow-sm rounded-full hover:bg-gray-100 transition"
        >
          <ChevronRight size={28} className="text-[#1a1a6e]" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div
            key={d}
            className="text-center font-semibold text-[#23223a] text-lg"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {gridDays.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelected = selectedDate && formatISO(day) === selectedDate;
          console.log(
            "🚀 ~ Calendar ~ isSelected:",
            isSelected,
            "day:",
            formatISO(day),
            "selectedDate:",
            selectedDate
          );

          return (
            <button
              key={idx}
              onClick={() => onDateSelect && onDateSelect(formatISO(day))}
              className={`h-14 w-14 flex items-center justify-center rounded-2xl font-semibold text-lg transition ${
                isSelected
                  ? "bg-linear-to-br from-[#0d0d6b] to-[#2d1e6b] text-white shadow-lg"
                  : isCurrentMonth
                  ? "text-[#23223a] hover:bg-[#e8e8ff]"
                  : "text-[#bdbdd7] opacity-50"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { Calendar };
