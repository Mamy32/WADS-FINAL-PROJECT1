const OpenAI = require("openai");

// 🔥 ONLY USE WORKING MODEL
const nvidia = new OpenAI({
  apiKey: process.env.FALLBACK_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "⚠️ Empty message" });
    }

    // ===============================
    // 🔥 1. NVIDIA QWEN (MAIN)
    // ===============================
    try {
      const response = await nvidia.chat.completions.create({
        model: "qwen/qwen3.5-122b-a10b",
        messages: [
          {
            role: "system",
            content: "You are a smart study assistant. Be clear and helpful.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const reply = response.choices?.[0]?.message?.content;

      if (reply) {
        return res.json({ reply });
      }

      throw new Error("Empty QWEN response");

    } catch (err) {
      console.error("QWEN ERROR:", err.message);
      console.warn("⚠️ QWEN FAILED → fallback to OpenRouter...");
    }

    // ===============================
    // 🔥 2. OPENROUTER (BACKUP)
    // ===============================
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: "You are a helpful study assistant.",
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "⚠️ No response from AI";

    return res.json({ reply });

  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    res.status(500).json({ reply: "⚠️ Chat failed" });
  }
};