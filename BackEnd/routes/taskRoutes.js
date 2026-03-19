const express = require("express")
const router = express.Router()
const {verifyToken} = require("../middleware/authMiddleware");
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controllers/taskController")


router.post("/",verifyToken, createTask)
router.get("/", verifyToken, getTasks)
router.get("/task/:id", verifyToken, getTaskById)
router.put("/:id", verifyToken, updateTask)
router.delete("/:id", verifyToken, deleteTask)

module.exports = router