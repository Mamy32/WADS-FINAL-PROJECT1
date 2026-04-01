const express = require("express");
const router = express.Router();

const { createSession, getSessions } = require("../controllers/sessionController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createSession);   // 🔥 save session
router.get("/", verifyToken, getSessions);      // 🔥 fetch sessions

module.exports = router;