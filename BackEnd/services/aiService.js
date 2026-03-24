const {
  GoogleGenerativeAI
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================================================
   PRIORITIZE TASKS (REAL AI ONLY — NO FALLBACK)
========================================================= */
exports.prioritizeTasksAI = async (tasks) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite", // ✅ safer than 2.5 (less quota issues)
    });

    const prompt = `
You are an AI that prioritizes student tasks.

Rules:
- Higher importance = higher priority
- Closer deadline = higher priority
- Higher effort = lower priority
- Be realistic and balanced

Return ONLY valid JSON (no explanation):
[
  { "id": "task_id", "score": number }
]

Tasks:
${JSON.stringify(tasks)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🔥 CLEAN RESPONSE
    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid AI response format");
    }

    return parsed;

  } catch (error) {
    console.error("AI SERVICE ERROR (PRIORITY):", error);
    throw new Error("AI failed");
  }
};


/* =========================================================
   GENERATE SCHEDULE (WITH TASK NAMES — NO IDS)
========================================================= */
exports.generateScheduleAI = async (tasks) => {
  try {
    let currentTime = 18 * 60; // start at 6:00 PM

    const scheduled = tasks.map((task, index) => {
      const duration = task.duration || 60;

      const startHour = Math.floor(currentTime / 60);
      const startMin = currentTime % 60;

      const endTime = currentTime + duration;
      const endHour = Math.floor(endTime / 60);
      const endMin = endTime % 60;

      currentTime = endTime;

      return {
        title: task.title,
        subject: task.subject || "General",
        start: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
        end: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
        duration,
        priority: task.priority || "medium",

        date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + index
        ).toISOString(),
      };
    });

    return scheduled;
  } catch (err) {
    console.error("Scheduler fallback:", err);

    return tasks.map((t, i) => ({
      title: t.title,
      start: "18:00",
      end: "19:00",
      subject: t.subject || "General",
      priority: "medium",
    }));
  }
};