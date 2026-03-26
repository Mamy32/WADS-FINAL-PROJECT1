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
  const [manualStop, setManualStop] = useState(false);
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 FETCH SCHEDULE
  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await apiFetch("/ai/schedule", { method: "POST" });
      const data = await res.json();

      const safe = Array.isArray(data) ? data : data.schedule || [];

      const parsed: ScheduledTask[] = safe.map((item: any, i: number) => ({
        id: i,
        title: item.title,
        subject: item.subject || "General",
        estimatedMinutes: item.duration || 60,
        scheduledStart: item.start,
        scheduledEnd: item.end,
        priority: item.priority || "medium",
        date: item.date,
      }));

      setTasks(parsed);
    };

    fetchSchedule();
  }, []);

  // 🔥 DETECT CURRENT TASK
  useEffect(() => {
  const checkCurrentTask = () => {
    const now = new Date();

    const currentTask = tasks.find((t) => {
      if (!t.date) return false;

      const taskDate = new Date(t.date);

      if (
        taskDate.getDate() !== now.getDate() ||
        taskDate.getMonth() !== now.getMonth() ||
        taskDate.getFullYear() !== now.getFullYear()
      ) return false;

      const [sh, sm] = t.scheduledStart.split(":").map(Number);
      const [eh, em] = t.scheduledEnd.split(":").map(Number);

      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      const nowMin = now.getHours() * 60 + now.getMinutes();

      return nowMin >= start && nowMin < end;
    });

    // 🔥 MANUAL MODE CHECK
    if (manualStop) return;

    if (currentTask) {
      setTask(currentTask);
      setStatus("running");

      const [sh, sm] = currentTask.scheduledStart.split(":").map(Number);
      const startMin = sh * 60 + sm;
      const nowMin = now.getHours() * 60 + now.getMinutes();

      const seconds = (nowMin - startMin) * 60 + now.getSeconds();
      setElapsed(seconds);
    } else {
      setTask(null);
      setStatus("idle");
      setElapsed(0);
    }
  };

  checkCurrentTask();

  const interval = setInterval(checkCurrentTask, 10000);

  return () => clearInterval(interval);
}, [tasks, manualStop]);
  // 🔥 TIMER
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (status === "running" && task) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  if (!task) {
    return <div className="p-10 text-center">No active task</div>;
  }

  const { hours, minutes, seconds } = formatTime(elapsed);

  const progress = Math.min(
    100,
    Math.round((elapsed / (task.estimatedMinutes * 60)) * 100)
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Study Timer</h1>

      <div className="bg-black text-white p-6 rounded-xl mb-6">
        <h2>{task.title}</h2>
        <p>{task.scheduledStart} - {task.scheduledEnd}</p>
      </div>

      <div className="text-center text-4xl font-mono mb-4">
        {hours}:{minutes}:{seconds}
      </div>

      <p className="text-center">{progress}% progress</p>

      <div className="flex justify-center gap-3 mt-4">
        <button
  onClick={() => {
    setStatus("running");
    setManualStop(false); // 🔥 allow auto again
  }}
  className="bg-green-500 px-4 py-2 text-white rounded"
>
  Start
</button>

<button
  onClick={() => setStatus("paused")}
  className="bg-yellow-500 px-4 py-2 text-white rounded"
>
  Pause
</button>

<button
  onClick={() => {
    setStatus("idle");
    setManualStop(true); // 🔥 block auto restart
    setElapsed(0); // 🔥 reset timer
  }}
  className="bg-red-500 px-4 py-2 text-white rounded"
>
  Stop
</button>
      </div>
    </div>
  );
}