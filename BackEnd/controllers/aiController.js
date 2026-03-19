const prisma = require("../config/prisma");
const { prioritizeTasksAI } = require("../services/aiService");
const { generateScheduleAI } = require("../services/aiService");


//  AI CONTROLLER - SCHEDULE
exports.generateSchedule = async (req, res) => {
try {
    const userId = req.user.uid;
    const { userInput } = req.body;

    const tasks = await prisma.task.findMany({
        where: { userId },
    });

    if (!tasks.length) {
        return res.json({ reply: "No tasks found." });
    }

    const schedule = await generateScheduleAI(tasks, userInput);

    res.json({ reply: schedule });

} catch (error) {
    console.error("SCHEDULE ERROR:", error);
    res.status(500).json({ error: "Schedule failed" });
}
};

//  AI CONTROLLER - PRIORITIZATION & SCHEDULE
exports.prioritizeTasks = async (req, res) => {
try {
    const userId = req.user.uid;

    //  GET TASKS
    const tasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    if (!tasks.length) {
        return res.json([]);
    }

    //  AI CALCULATION
    const aiResult = await prioritizeTasksAI(tasks);

    //  MERGE AI RESULT + TASK DATA
    const enriched = aiResult.map((aiTask) => {
    const original = tasks.find((t) => t.id === aiTask.id);

    return {
        id: aiTask.id,
        title: original?.title || "Untitled", // ADD TITLE
        description: original?.description || "",
        subject: original?.subject || "General",

        // original data
        importance: original?.importance,
        urgency: original?.urgency,
        effort: original?.effort,
        deadline: original?.deadline,

        // AI
        score: aiTask.score,
    };
    });

    res.json(enriched);

} catch (error) {
    console.error("AI CONTROLLER ERROR:", error);
    res.status(500).json({ error: "AI failed" });
}
};