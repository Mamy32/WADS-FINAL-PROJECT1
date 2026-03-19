const {
    GoogleGenerativeAI
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
    try {
        const {
            message
        } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message required"
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite", // ✅ use this
        });

        const result = await model.generateContent(message);
        const response = await result.response;

        const text = response.text();

        res.json({
            reply: text
        });

    } catch (error) {
        console.error("AI CHAT ERROR:", error);
        res.status(500).json({
            error: "Chat failed"
        });
    }
};