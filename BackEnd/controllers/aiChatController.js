const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Study Planner",
      },
      body: JSON.stringify({
        model: "liquid/lfm-2.5-1.2b-instruct:free", // 🔥 FIXED
        temperature: 0.7,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();


    const reply =
      data?.choices?.[0]?.message?.content ||
      "⚠️ No response from AI";

    res.json({ reply });

  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    res.status(500).json({ reply: "⚠️ Chat failed" });
  }
};