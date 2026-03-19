const {
    GoogleGenerativeAI
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//  NEW AI SERVICE - CAN BE CALLED FROM ANY CONTROLLER
exports.prioritizeTasksAI = async (tasks) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
        });

        const prompt = `
You are a productivity AI.

Given these tasks, return JSON array:
[{ "id": "...", "score": number }]

Rules:
- Higher score = higher priority
- Consider deadline, importance, urgency

Tasks:
${JSON.stringify(tasks)}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return JSON.parse(text);

    } catch (error) {
        console.error("AI LIMIT → USING FALLBACK");

        // 🔥 SMART FALLBACK LOGIC
        return tasks.map((task) => {
            let score = 0;

            // Priority weight
            if (task.importance === 3) score += 50;
            if (task.importance === 2) score += 30;
            if (task.importance === 1) score += 10;

            // Deadline weight
            const now = new Date();
            const deadline = new Date(task.deadline);
            const diff = (deadline - now) / (1000 * 60 * 60 * 24);

            if (diff <= 1) score += 40;
            else if (diff <= 3) score += 25;
            else score += 10;

            return {
                id: task.id,
                score,
            };
        }).sort((a, b) => b.score - a.score);
    }
};

// NEW AI FUNCTION FOR SCHEDULE GENERATION
exports.generateScheduleAI = async (tasks, userInput = "") => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
    });

    const prompt = `
You are a smart study planner.

User info:
${userInput}

Tasks:
${JSON.stringify(tasks)}

Create an optimized study schedule.

Rules:
- Consider urgency, importance, effort
- Prioritize high score tasks first
- Add breaks
- Keep it realistic
- Return clean readable schedule

Format:
Time — Task — Reason
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
};