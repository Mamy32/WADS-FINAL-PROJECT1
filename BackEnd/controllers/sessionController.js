const prisma = require("../config/prisma");

// 🔥 SAVE SESSION
exports.createSession = async (req, res) => {
    try {
        const {
            duration,
            taskId
        } = req.body;
        const userId = req.user.uid;

        const session = await prisma.studySession.create({
            data: {
                userId,
                taskId,
                duration,
            },
        });

        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to save session"
        });
    }
};

// 🔥 GET USER SESSIONS
exports.getSessions = async (req, res) => {
    try {
        const userId = req.user.uid;

        const sessions = await prisma.studySession.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc"
            },
        });

        res.json(sessions);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch sessions"
        });
    }
};