const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function callOpenRouter(prompt) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "liquid/lfm-2.5-1.2b-instruct:free",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You are a strict API. Return ONLY valid JSON. No explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    // 🔥 HANDLE API ERROR
    if (!response.ok) {
      console.error("OPENROUTER ERROR:", data);
      return [];
    }

    let text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("EMPTY AI RESPONSE:", data);
      return [];
    }

    // 🔥 CLEAN JSON
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]") + 1;

    if (start === -1 || end === -1) {
      console.error("INVALID JSON FORMAT:", text);
      return [];
    }

    const clean = text.slice(start, end);

    try {
      return JSON.parse(clean); // ✅ ONLY PARSE ONCE
    } catch (err) {
      console.error("JSON PARSE ERROR:", clean);
      return [];
    }

  } catch (err) {
    console.error("AI ERROR:", err);
    return [];
  }
}
/* =========================================================
   PRIORITIZE TASKS (REAL AI ONLY — NO FALLBACK)
========================================================= */
exports.prioritizeTasksAI = async (tasks) => {
  try {
    if (!tasks || tasks.length === 0) return [];

    // 🔥 CLEAN INPUT (ONLY IMPORTANT FIELDS)
    const cleanTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      importance: t.importance,
      urgency: t.urgency,
      effort: t.effort,
      deadline: t.deadline,
    }));

    const prompt = `
You are an AI that prioritizes student tasks.

SCORING RULES:
- Importance (1–3): higher = more important
- Urgency (1–3): higher = more urgent
- Effort: lower effort = higher priority
- Earlier deadline = higher priority

INSTRUCTIONS:
- Give each task a score from 0 to 100
- Higher score = higher priority
- Be consistent and realistic

OUTPUT RULES:
- Return ONLY valid JSON
- No explanation, no text
- Format EXACTLY like this:

[
  { "id": number, "score": number }
]

Tasks:
${JSON.stringify(cleanTasks)}
`;

    const ai = await callOpenRouter(prompt);

    if (!Array.isArray(ai)) {
      console.error("INVALID AI RESPONSE:", ai);
      return [];
    }

    // 🔥 SORT BY SCORE (HIGH → LOW)
    const sorted = ai
      .map((item) => ({
        id: item.id,
        score: Number(item.score) || 0,
      }))
      .sort((a, b) => b.score - a.score);

    return sorted;

  } catch (err) {
    console.error("PRIORITY AI ERROR:", err);
    return [];
  }
};


/* =========================================================
   GENERATE SCHEDULE (WITH TASK NAMES — NO IDS)
========================================================= */
exports.generateScheduleAI = async (tasks) => {
  try {
    if (!tasks || tasks.length === 0) return [];

    // 🔥 STEP 1 — GET PRIORITY SCORES
    const aiPriority = await exports.prioritizeTasksAI(tasks);

    // 🔥 STEP 2 — MERGE SCORE INTO TASKS
    const enrichedTasks = tasks.map((t) => {
      const ai = aiPriority.find((a) => String(a.id) === String(t.id));

      return {
        ...t,
        score: ai?.score || 0,
      };
    });

    // 🔥 STEP 3 — SORT BY PRIORITY
    enrichedTasks.sort((a, b) => b.score - a.score);

    // 🔥 STEP 4 — BUILD REAL SCHEDULE
    const schedule = [];

    let current = new Date();

    // normalize time
    current.setSeconds(0);
    current.setMilliseconds(0);

    // OPTIONAL: start at next full hour
    current.setMinutes(0);
    current.setHours(current.getHours() + 1);

    for (let i = 0; i < enrichedTasks.length; i++) {
      const task = enrichedTasks[i];

      const duration = task.duration || 60;

      const start = new Date(current);
      const end = new Date(current.getTime() + duration * 60000);

      schedule.push({
        id: task.id, // 🔥 IMPORTANT (for tracking)
        title: task.title,
        subject: task.subject || "General",
        start: start.toTimeString().slice(0, 5),
        end: end.toTimeString().slice(0, 5),
        duration,
        priority:
          task.importance === 3
          ? "high"
          : task.importance === 2
          ? "medium"
          : "low",
        date: start.toISOString(), // ✅ REAL DATE
      });

      // move forward
      current = end;

      // 🔥 BREAK LOGIC
      if ((i + 1) % 2 === 0) {
        current = new Date(current.getTime() + 10 * 60000);
      }

      // 🔥 DAY OVERFLOW FIX (CRITICAL)
      if (current.getHours() >= 23) {
        current = new Date(current);
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0); // next day 09:00
      }
    }

    // 🔥 REMOVE DUPLICATES (SAFETY)
    const unique = Array.from(
      new Map(schedule.map((t) => [t.id, t])).values()
    );

    return unique;

  } catch (err) {
    console.error("AI SCHEDULE ERROR:", err);
    return [];
  }
};