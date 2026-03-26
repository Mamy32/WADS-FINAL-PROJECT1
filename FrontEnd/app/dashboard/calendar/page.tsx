"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Priority = "high" | "medium" | "low";

interface CalEvent {
  id: number;
  title: string;
  time?: string;
  priority: Priority;
  day: number;
  description?: string;
}

const priorityStyle = {
  high: "bg-red-100 text-red-500",
  medium: "bg-orange-100 text-orange-500",
  low: "bg-gray-100 text-gray-500",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}


export default function CalendarPage() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1);

  // ✅ FETCH AI SCHEDULE
  useEffect(() => {
    const fetchAISchedule = async () => {
      try {
        const res = await apiFetch("/ai/schedule", { method: "POST" });
        const data = await res.json();

        const safeData = Array.isArray(data)
          ? data
          : data.schedule || [];

        const parsed: CalEvent[] = safeData.map((item: any, i: number) => {
          const date = new Date(item.date);

          return {
            id: i + 1,
            title: item.title,
            time: item.start,
            priority: item.priority || "low", // 🔥 IMPORTANT
            day: date.getDate(),
            description: item.subject || "Study task",
          };
        });

        setEvents(parsed);
      } catch (err) {
        console.error("AI CALENDAR ERROR:", err);
      }
    };

    fetchAISchedule();
  }, []);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const eventsForDay = (day: number) =>
    events.filter((e) => e.day === day);

  // GRID
  const cells: { day: number; currentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      day: cells.length - firstDay - daysInMonth + 1,
      currentMonth: false,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-400 text-sm">{events.length} events</p>
        </div>

        <div className="bg-white rounded-3xl border overflow-hidden">

          {/* NAV */}
          <div className="flex justify-between px-8 py-5 border-b">
            <button onClick={prevMonth}>◀</button>
            <h2 className="font-bold">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth}>▶</button>
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 border-b">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs py-3 text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const dayEvents = cell.currentMonth ? eventsForDay(cell.day) : [];

              return (
                <div
                  key={idx}
                  className="min-h-[110px] p-2 border"
                >
                  {/* DAY NUMBER */}
                  <div className={`text-xs text-right mb-1 ${
                    isToday(cell.day)
                      ? "text-teal-600 font-bold"
                      : "text-gray-400"
                  }`}>
                    {cell.day}
                  </div>

                  {/* EVENTS */}
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className={`flex justify-between items-center px-2 py-1 rounded-full text-[11px] font-medium mb-1 ${
                        priorityStyle[ev.priority]
                      }`}
                    >
                      <span className="truncate">{ev.title}</span>
                      <span className="ml-2 text-[10px] opacity-70">
                        {ev.time}
                      </span>
                    </div>
                  ))}

                  {/* + MORE */}
                  {dayEvents.length > 3 && (
                    <p className="text-[10px] text-gray-400">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}