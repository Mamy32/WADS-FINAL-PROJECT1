"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";

type TimerStatus = "idle" | "running" | "paused";

interface ScheduledTask {
  id: number;
  title: string;
  subject: string;
  estimatedMinutes: number;
  scheduledStart: string;
  scheduledEnd: string;
  priority: "high" | "medium" | "low";
  startMinutes: number;
  date: string;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return {
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    seconds: String(s).padStart(2, "0"),
  };
}

export default function StudyTimerPage() {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [elapsed, setElapsed] = useState(0);

  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<ScheduledTask[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ FETCH + SYNC WITH TODAY
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await apiFetch("/ai/schedule", { method: "POST" });
        const data = await res.json();

        const safe = Array.isArray(data) ? data : data.schedule || [];

        const today = new Date().toDateString();

        const parsed: ScheduledTask[] = safe
          .filter((item: any) => new Date(item.date).toDateString() === today) // ✅ ONLY TODAY
          .map((item: any, i: number) => {
            const [h, m] = item.start.split(":").map(Number);

            return {
              id: i,
              title: item.title,
              subject: item.subject || "General",
              estimatedMinutes: item.duration || 60,
              scheduledStart: item.start,
              scheduledEnd: item.end,
              priority: item.priority || "medium",
              startMinutes: h * 60 + m,
              date: item.date,
            };
          });

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const currentTask =
          parsed.find((t) => currentMinutes >= t.startMinutes) || parsed[0];

        setTask(currentTask);
        setUpcomingTasks(parsed.filter((t) => t.id !== currentTask?.id));

        // ✅ AUTO START if within task time
        if (currentTask && currentMinutes >= currentTask.startMinutes) {
          setStatus("running");
        }

      } catch (err) {
        console.error("Schedule fetch error", err);
      }
    };

    fetchSchedule();
  }, []);

  // ✅ AUTO SWITCH TASKS
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      setUpcomingTasks((prev) => {
        if (!task) return prev;

        const nextTask = prev.find((t) => currentMinutes >= t.startMinutes);

        if (nextTask) {
          setTask(nextTask);
          setStatus("running"); // auto start new task
          setElapsed(0);

          return prev.filter((t) => t.id !== nextTask.id);
        }

        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [task]);

  // ✅ TIMER CORE
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          const newTime = e + 1;

          // 🔥 SAVE FOCUS TIME (dashboard sync)
          localStorage.setItem("focusTime", String(
            Number(localStorage.getItem("focusTime") || 0) + 1
          ));

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const handleStart = () => setStatus("running");
  const handlePause = () => setStatus("paused");
  const handleResume = () => setStatus("running");

  const handleStop = () => {
    setStatus("idle");
    setElapsed(0);
  };

  if (!task) {
    return <div className="p-10 text-center">No tasks for today</div>;
  }

  const { hours, minutes, seconds } = formatTime(elapsed);

  const progress = Math.min(
    100,
    Math.round((elapsed / (task.estimatedMinutes * 60)) * 100)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-6">Study Timer</h1>

        {/* CURRENT TASK */}
        <div className="bg-black text-white p-6 rounded-2xl mb-6">
          <p className="text-sm text-gray-400">Current Task</p>
          <h2 className="text-xl font-bold">{task.title}</h2>
          <p className="text-gray-400 text-sm">
            {task.scheduledStart} - {task.scheduledEnd}
          </p>
        </div>

        {/* TIMER */}
        <div className="bg-white p-8 rounded-2xl text-center mb-6">
          <div className="text-5xl font-mono mb-4">
            {hours}:{minutes}:{seconds}
          </div>

          <p className="text-sm text-gray-400 mb-4">
            {progress}% progress
          </p>

          <div className="flex justify-center gap-3">
            {status === "idle" && (
              <button onClick={handleStart} className="bg-teal-600 text-white px-6 py-2 rounded-xl">
                Start
              </button>
            )}

            {status === "running" && (
              <>
                <button onClick={handlePause} className="bg-yellow-500 text-white px-4 py-2 rounded-xl">
                  Pause
                </button>
                <button onClick={handleStop} className="bg-red-500 text-white px-4 py-2 rounded-xl">
                  Stop
                </button>
              </>
            )}

            {status === "paused" && (
              <>
                <button onClick={handleResume} className="bg-teal-600 text-white px-4 py-2 rounded-xl">
                  Resume
                </button>
                <button onClick={handleStop} className="bg-red-500 text-white px-4 py-2 rounded-xl">
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* UPCOMING */}
        <div className="bg-white p-6 rounded-2xl">
          <h3 className="font-bold mb-4">Upcoming</h3>

          {upcomingTasks.map((t) => (
            <div key={t.id} className="border-b py-2">
              <p className="font-semibold">{t.title}</p>
              <p className="text-xs text-gray-400">
                {t.scheduledStart} · {t.estimatedMinutes} min
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}