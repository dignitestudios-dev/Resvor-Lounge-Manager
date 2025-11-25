"use client";
import * as React from "react";
import { addDays, format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const css = `
.rdp {
  --rdp-accent-color: #1a1a6e;
  --rdp-background-color: #fff;
  --rdp-outline: 2px solid #1a1a6e;
  --rdp-selected-color: #fff;
  --rdp-selected-bg: linear-gradient(180deg, #0d0d6b 0%, #2d1e6b 100%);
  --rdp-today-bg: #e8e8ff;
  --rdp-cell-size: 56px;
  font-family: inherit;
}
.rdp-months {
  width: 100%;
}
.rdp-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}
.rdp-day {
  border-radius: 14px;
  font-weight: 500;
  font-size: 1.1rem;
  color: #23223a;
  transition: background 0.2s, color 0.2s;
  margin: 0 2px;
}
.rdp-day_selected,
.rdp-day_selected:focus {
  background: var(--rdp-selected-bg) !important;
  color: var(--rdp-selected-color) !important;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(26,26,110,0.10);
}
.rdp-day_today:not(.rdp-day_selected) {
  background: var(--rdp-today-bg) !important;
  color: #1a1a6e;
  border-radius: 14px;
  font-weight: 700;
}
.rdp-caption {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.rdp-caption_label {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a1a6e;
  background: #fff;
  border-radius: 10px;
  padding: 0.2rem 1.2rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.rdp-head_cell {
  font-size: 1.1rem;
  color: #23223a;
  font-weight: 600;
  padding-bottom: 0.5rem;
}
.rdp-nav_button {
  background: #fff;
  border-radius: 50%;
  border: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  width: 44px;
  height: 44px;
  color: #1a1a6e;
  font-size: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.rdp-nav_button:active {
  background: #e8e8ff;
}
.rdp-day_outside {
  color: #bdbdd7 !important;
  background: transparent !important;
}
`;

export function Calendar({ selected, onSelect, ...props }) {
  React.useEffect(() => {
    if (!document.getElementById("shadcn-calendar-style")) {
      const style = document.createElement("style");
      style.id = "shadcn-calendar-style";
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      className="rounded-xl bg-white p-4 shadow w-full"
      {...props}
    />
  );
}
