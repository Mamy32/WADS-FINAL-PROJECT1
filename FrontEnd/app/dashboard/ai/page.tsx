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
    description: "AI ranks your tasks by urgency, importance, effort and dependency",
    prompt: "Prioritize my tasks",
  },
  {
    id: "schedule",
    icon: "📅",
    title: "Optimize my schedule",
    description: "Get a study schedule based on your energy levels",
    prompt: "Optimize my schedule",
  },
];

async function getAIResponse(message: string): Promise<string> {
  try {
    const lower = message.toLowerCase();

    // 🔥 PRIORITIZE
if (lower.includes("prioriti")) {
  const res = await apiFetch("/ai/prioritize", {
    method: "POST",
  });

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return "You don't have any tasks yet.";
  }

  let response =
    "\n\n";

  response += "🔥 Here’s your prioritized tasks:\n\n";

  data.forEach((task: any, index: number) => {
    response += `${index + 1}. ${task.title || "Task"} (Score: ${task.score})\n`;
  });

  response += "\n👉 Start with the first task!";

  return response;
}

    // 🔥 SCHEDULE
    if (lower.includes("schedule") || lower.includes("optimiz")) {
      const res = await apiFetch("/ai/schedule", {
        method: "POST",
        body: JSON.stringify({ userInput: message }),
      });

      const data = await res.json();
      return data?.reply || " AI unvailable right now";
    }

    // 💬 DEFAULT CHAT
    const res = await apiFetch("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    return data.reply;

  } catch (error) {
    console.error("AI ERROR:", error);
    return "⚠️ AI failed. Try again.";
  }
}

function formatMessageContent(content?: string) {
  if (!content || typeof content !== "string") {
    return <span>⚠️ AI returned empty response</span>;
  }

  return content.split("\n").map((line, i) => {
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: boldLine }} />
        {i < content.split("\n").length - 1 && <br />}
      </span>
    );
  });
}


export default function AIAssistantPage() {
const [messages, setMessages] = useState<Message[]>([
      {
      id: 1,
      role: "assistant",
      content: "Hello there! 👋 I'm your AI assistant.",
      timestamp: new Date(),
    },

]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
useEffect(() => {
  if (typeof window === "undefined") return;

  const saved = localStorage.getItem("ai_messages");

  if (saved) {
    setMessages(
      JSON.parse(saved).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    );
  }
}, []);
  const bottomRef = useRef<HTMLDivElement>(null);

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
          content: "Something went wrong.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }

}
  return (
    <div className="h-screen flex flex-col p-6 bg-gray-50">

      {/* HEADER */}
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