"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type MessageRole = "user" | "assistant";
type QuickActionId = "prioritize" | "schedule";

interface Message {
  id: number;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: QuickActionId;
  icon: string;
  title: string;
  description: string;
  prompt: string;
}

const quickActions: QuickAction[] = [
  {
    id: "prioritize",
    icon: "☰",
    title: "Prioritize my tasks",
    description: "AI ranks your tasks",
    prompt: "Prioritize my tasks",
  },
  {
    id: "schedule",
    icon: "📅",
    title: "Optimize my schedule",
    description: "Generate study plan",
    prompt: "Optimize my schedule",
  },
];

async function getAIResponse(message: string): Promise<string> {
  try {
    const lower = message.toLowerCase();

    // 🔥 PRIORITIZE
    if (lower.includes("priorit")) {
      const res = await apiFetch("/ai/prioritize", { method: "POST" });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return "📭 You don’t have any tasks yet.";
      }

      let response = "🔥 Your prioritized tasks:\n\n";

      data.forEach((task: any, index: number) => {
        response += `${index + 1}. ${task.title} — Score: ${task.score}\n`;
      });

      return response;
    }

    // 🔥 SCHEDULE
    if (lower.includes("schedule") || lower.includes("plan")) {
      const res = await apiFetch("/ai/schedule", { method: "POST" });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return "📭 No schedule available.";
      }

      let text = "📅 Your study schedule:\n\n";

      data.forEach((t: any, i: number) => {
        text += `${i + 1}. ${t.title}\n⏰ ${t.start} → ${t.end}\n🔥 ${t.priority}\n\n`;
      });

      return text;
    }

    // 💬 CHAT
    const res = await apiFetch("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data?.reply || "⚠️ No response";

  } catch (error) {
    console.error("AI ERROR:", error);
    return "⚠️ AI failed.";
  }
}

function formatMessageContent(content?: string) {
  if (!content) return null;

  return content.split("\n").map((line, i) => (
    <div key={i}>{line}</div>
  ));
}

export default function AIAssistantPage() {

  // 🔥 LOAD FROM LOCAL STORAGE (FIXED)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];

    const saved = localStorage.getItem("ai_messages");

    if (saved) {
      return JSON.parse(saved).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }

    return [
      {
        id: 1,
        role: "assistant",
        content: "Hello there! 👋 I'm your AI assistant.",
        timestamp: new Date(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // 🔥 SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("ai_messages", JSON.stringify(messages));
  }, [messages]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getAIResponse(content);

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "⚠️ Something went wrong.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col p-6 bg-gray-50">

      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>

      {/* QUICK ACTIONS */}
      <div className="flex gap-3 mb-4">
        {quickActions.map((a) => (
          <button
            key={a.id}
            onClick={() => sendMessage(a.prompt)}
            className="px-4 py-2 bg-white rounded-xl shadow"
          >
            {a.icon} {a.title}
          </button>
        ))}
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl max-w-[70%] ${
              m.role === "user"
                ? "bg-black text-white ml-auto"
                : "bg-gray-100"
            }`}
          >
            {formatMessageContent(m.content)}
          </div>
        ))}

        {isLoading && <p>Typing...</p>}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="flex mt-3 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          className="flex-1 border rounded-xl px-4 py-2"
          placeholder="Ask anything..."
        />

        <button
          onClick={() => sendMessage(input)}
          className="bg-teal-600 text-white px-4 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}