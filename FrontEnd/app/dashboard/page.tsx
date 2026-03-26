"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Task = {
  id: string;
  title: string;
  subject: string;
  duration: string;
  priority: "high" | "medium" | "low";
  date: string;
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-500",
  medium: "bg-orange-100 text-orange-400",
  low: "bg-green-100 text-green-500",
};

const priorityBar: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-green-500",
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aiTasks, setAiTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
    GREETING
  ========================= */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();

  /* =========================
    FETCH TASKS
  ========================= */
const fetchTasks = async () => {
  try {
    const res = await apiFetch("/tasks");
    const data = await res.json();

    // ✅ FIX HERE
    const safeData = Array.isArray(data)
      ? data
      : data.tasks || data.data || [];

    const formatted: Task[] = safeData.map((t: any) => ({
      id: t.id,
      title: t.title,
      subject: t.subject || "General",
      duration: "60 min",
      priority:
        t.importance === 3
          ? "high"
          : t.importance === 2
          ? "medium"
          : "low",
      date: new Date(t.deadline).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
    }));

    setTasks(formatted);

  } catch (err) {
    console.error("FETCH TASK ERROR:", err);
    setTasks([]);
  }
};

  /* =========================
     FETCH AI PRIORITY
  ========================= */
  const fetchAi = async () => {
    try {
      const res = await apiFetch("/ai/prioritize", {
        method: "POST",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setAiTasks(data);
      } else {
        setAiTasks([]);
      }
    } catch (err) {
      console.error("AI ERROR:", err);
      setAiTasks([]); // 🔥 prevent crash
    }
  };

  /* =========================
     LOAD BOTH (ORDER FIX)
  ========================= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchTasks();
      await fetchAi();
      setLoading(false);
    };

    load();
  }, []);

  /* =========================
     STATS
  ========================= */
  const total = tasks.length;
  const completed = 0;
  const urgentTasks = tasks.filter((t) => t.priority === "high");

  /* =========================
     SORT TASKS
  ========================= */
  const sortedTasks = [...tasks].sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 };
    return order[b.priority] - order[a.priority];
  });

  /* =========================
     MERGE AI + TASKS (SAFE)
  ========================= */
  const aiMerged = Array.isArray(aiTasks)
    ? aiTasks
        .map((ai: any) => {
          const fullTask = tasks.find(
            (t) => String(t.id) === String(ai.id)
          );

          return fullTask
            ? {
                ...ai,
                title: fullTask.title,
              }
            : null;
        })
        .filter(Boolean) // 🔥 remove nulls
    : [];

  const topTask = aiMerged[0];
  const top3 = aiMerged.slice(0, 3);

  /* =========================
     UI
  ========================= */
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {greeting}, Jean
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          You have {urgentTasks.length} urgent tasks due soon.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Tasks Done" value={`${completed}/${total}`} icon="🕐" />
        <StatCard label="Study streak" value="5 days" icon="🔥" />
        <StatCard label="Focus Time" value="3h 20min" icon="⏱️" />
        <StatCard label="Completion Rate" value="0%" icon="📊" />
      </div>

      {/* Content */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>

          <div className="flex flex-col gap-3">
            {sortedTasks.map((task, i) => (
              <div
                key={i}
                className="bg-white rounded-xl flex items-center gap-3 px-4 py-3 shadow-sm border"
              >
                <div
                  className={`w-1 h-10 rounded-full ${priorityBar[task.priority]}`}
                />
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-400">
                    {task.subject} · {task.duration}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}
                >
                  {task.priority}
                </span>
                <span className="text-xs text-gray-400">{task.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">✨ AI Suggestions</h2>

          <div className="bg-white p-4 rounded-xl shadow-sm border">
            {!loading && topTask ? (
              <>
                <p className="font-semibold text-sm mb-2">
                  ⚠️ Priority Alert
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {topTask.title} is your most important task
                </p>

                <p className="font-semibold text-sm mb-2">
                  ✨ Recommended Order
                </p>
                <p className="text-xs text-gray-500 whitespace-pre-line">
                  {top3
                    .map(
                      (t: any, i: number) =>
                        `${i + 1}. ${t.title} (Score ${Math.round(t.score)})`
                    )
                    .join("\n")}
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">
                No AI suggestions yet...
              </p>
            )}

            <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg">
              Open AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );


function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <span>{icon}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
}