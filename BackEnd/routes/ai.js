const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/authMiddleware");
const { prioritizeTasks } = require("../controllers/aiController");
const { chatWithAI } = require("../controllers/aiChatController");
const { generateSchedule } = require("../controllers/aiController");
router.post("/chat", chatWithAI);
router.post("/prioritize", prioritizeTasks);
router.post("/schedule", generateSchedule);

module.exports = router;