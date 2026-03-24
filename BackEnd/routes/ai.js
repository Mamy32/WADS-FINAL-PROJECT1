const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/authMiddleware");
const { prioritizeTasks } = require("../controllers/aiController");
const { chatWithAI } = require("../controllers/aiChatController");
const { generateSchedule } = require("../controllers/aiController");
router.post("/chat", verifyToken, chatWithAI);
router.post("/prioritize", verifyToken, prioritizeTasks);
router.post("/schedule", verifyToken, generateSchedule);

module.exports = router;