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
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTaskId = useRef<number | null>(null);

  // 🔥 LOAD SAVED STATE
  useEffect(() => {
    const saved = localStorage.getItem("timer_state");

    if (saved) {
      const data = JSON.parse(saved);

      setTask(data.task);
      setElapsed(data.elapsed);
      setStatus(data.status);
      setManualStop(data.manualStop);
    }
  }, []);

  // 🔥 SAVE STATE
  useEffect(() => {
    if (!task) return;

    localStorage.setItem(
      "timer_state",
      JSON.stringify({
        task,
        elapsed,
        status,
        manualStop,
      })
    );
  }, [task, elapsed, status, manualStop]);

  // 🔥 FETCH SCHEDULE
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
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
      } catch (err) {
        console.error("SCHEDULE ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // 🔥 DETECT TASK (FIXED — NO RESET)
  useEffect(() => {
    const checkCurrentTask = () => {
      if (!tasks.length) {
        setTask(null);
        return;
      }

      if (manualStop) return;

      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();

      let currentTask = tasks.find((t) => {
        const [sh, sm] = t.scheduledStart.split(":").map(Number);
        const [eh, em] = t.scheduledEnd.split(":").map(Number);

        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        return nowMin >= start && nowMin < end;
      });

      if (!currentTask) {
        currentTask = tasks.find((t) => {
          const [sh, sm] = t.scheduledStart.split(":").map(Number);
          const start = sh * 60 + sm;
          return start > nowMin;
        });
      }

      if (!currentTask) {
        currentTask = tasks[0];
      }

      setTask(currentTask);
      setStatus("running");

      // 🔥 ONLY UPDATE ELAPSED IF TASK CHANGED
      if (currentTask.id !== lastTaskId.current) {
        lastTaskId.current = currentTask.id;

        const [sh, sm] = currentTask.scheduledStart.split(":").map(Number);
        const startMin = sh * 60 + sm;

        const seconds = Math.max(
          0,
          (nowMin - startMin) * 60 + now.getSeconds()
        );

        setElapsed(seconds);
      }
    };

    checkCurrentTask();

    const interval = setInterval(checkCurrentTask, 10000);

    return () => clearInterval(interval);
  }, [tasks, manualStop]);

  // 🔥 TIMER LOOP
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
  }, [status, task]);

  // 🔥 UI STATES
  if (loading) {
    return (
      <div className="p-10 text-center">
        ⏳ Loading your schedule...
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="p-10 text-center">
        📭 No tasks yet
      </div>
    );
  }

  const { hours, minutes, seconds } = formatTime(elapsed);

  const progress = task
    ? Math.min(
        100,
        Math.round((elapsed / (task.estimatedMinutes * 60)) * 100)
      )
    : 0;

  const saveSession = async () => {
  try {
    await apiFetch("/sessions", {
      method: "POST",
      body: JSON.stringify({
        duration: Math.floor(elapsed / 60), // minutes
        taskId: task?.id || null,
      }),
    });
  } catch (err) {
    console.error("SESSION SAVE ERROR:", err);
  }
};
function formatTimeAMPM(time?: string) {
  if (!time) return "";

  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

return (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Study Timer</h1>

    {/* 🔥 LOADING STATE */}
    {!task ? (
      <div className="text-center text-gray-400 mb-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
        Loading task...
      </div>
    ) : (
      <div className="bg-black text-white p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold">{task.title}</h2>
        <p className="text-sm text-gray-300">
          {formatTimeAMPM(task.scheduledStart)} -{" "}
          {formatTimeAMPM(task.scheduledEnd)}
        </p>
      </div>
    )}

    {/* 🔥 TIMER */}
    <div className="text-center text-4xl font-mono mb-4">
      {hours}:{minutes}:{seconds}
    </div>

    {/* 🔥 PROGRESS */}
    <p className="text-center mb-2">{progress}% progress</p>

    <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mb-4">
      <div
        className="bg-green-500 h-2 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>

    {/* 🔥 BUTTONS */}
    <div className="flex justify-center gap-3 mt-4">
      <button
        onClick={() => {
          setStatus("running");
          setManualStop(false);
        }}
        className="bg-green-500 px-4 py-2 text-white rounded"
      >
        Start
      </button>

      <button
        onClick={() => {
          setStatus("paused");
          setManualStop(true);
        }}
        className="bg-yellow-500 px-4 py-2 text-white rounded"
      >
        Pause
      </button>

      <button
        onClick={() => {
          saveSession();
          setStatus("idle");
          setManualStop(true);
          setElapsed(0);
        }}
        className="bg-red-500 px-4 py-2 text-white rounded"
      >
        Stop
      </button>
    </div>

    {/* 🔥 STATUS */}
    <p className="text-center text-gray-400 mt-4">
      {status === "running" && "▶ Running"}
      {status === "paused" && "⏸ Paused"}
      {status === "idle" && "⛔ Stopped"}
    </p>
  </div>
);
}