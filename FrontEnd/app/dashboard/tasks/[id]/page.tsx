"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api"; // ✅ IMPORTANT

type Priority = "high" | "medium" | "low";

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    priority: "medium" as Priority,
    dueDate: "",
  });

  /* =========================
     FETCH TASK (FIXED)
  ========================= */
  const fetchTask = async () => {
    try {
      const res = await apiFetch(`/tasks/task/${id}`); // ✅ use apiFetch

      const data = await res.json();

      setForm({
        title: data.title || "",
        description: data.description || "",
        subject: data.subject || "",
        priority:
          data.importance === 3
            ? "high"
            : data.importance === 2
            ? "medium"
            : "low",
        dueDate: data.deadline
          ? new Date(data.deadline).toISOString().split("T")[0]
          : "",
      });

    } catch (err) {
      console.error("❌ Fetch task error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTask();
  }, [id]);

  /* =========================
    UPDATE TASK (FIXED)
  ========================= */
  const updateTask = async () => {
    try {
      await apiFetch(`/tasks/${id}`, { // use apiFetch
        method: "PUT",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          subject: form.subject,
          deadline: form.dueDate,

          importance:
            form.priority === "high"
              ? 3
              : form.priority === "medium"
              ? 2
              : 1,

          urgency: 2,
          effort: 1,
        }),
      });

      alert("Task updated!");
      router.push("/dashboard/tasks");

    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Update failed");
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8">

      <h2 className="text-xl font-bold mb-6">Update Task</h2>

      <div className="flex flex-col gap-5">

        {/* TITLE */}
        <div>
          <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-widest">
            Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Complete chapter 4 exercises"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all placeholder:text-gray-300"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-widest">
            Description
          </label>
          <input
            type="text"
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all placeholder:text-gray-300"
          />
        </div>

        {/* SUBJECT + PRIORITY */}
        <div className="grid grid-cols-2 gap-4">

          {/* SUBJECT */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-widest">
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Math"
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all placeholder:text-gray-300"
            />
          </div>

          {/* PRIORITY */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-widest">
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as Priority })
              }
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all bg-white"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>

        </div>

        {/* DATE */}
        <div>
          <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-widest">
            Due Date
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
          />
        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => router.back()}
          className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={updateTask}
          disabled={!form.title.trim()}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] shadow-lg shadow-teal-200"
        >
          Update Task
        </button>
      </div>

    </div>
  </div>
);
}