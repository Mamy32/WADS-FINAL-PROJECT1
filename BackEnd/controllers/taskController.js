const prisma = require("../config/prisma");

/* =========================
  CREATE TASK
========================= */
exports.createTask = async (req, res) => {
  try {
    const { title, description, subject, deadline, importance, urgency, effort } = req.body;

    const userId = req.user.uid;

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: req.user.email || `${userId}@example.com`,
        password: "firebase-auth"
      }
    });

    // 🔥 SAFE DEADLINE
    let parsedDeadline = null;
    if (deadline && !isNaN(new Date(deadline))) {
      parsedDeadline = new Date(deadline);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        subject,
        deadline: parsedDeadline, // ✅ FIXED
        importance,
        urgency,
        effort,
        userId,
        status: "pending" // 🔥 always set default
      }
    });

    res.json(task);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Task creation failed" });
  }
};

/* =========================
  GET ALL TASKS (USER)
========================= */
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.uid;
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    
    res.json(tasks);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};


/* =========================
   GET TASK BY ID
========================= */
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const task = await prisma.task.findFirst({
      where: {
        id: id,
        userId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

//* =========================
//  UPDATE TASK
//========================= */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const existing = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const {
      title,
      description,
      subject,
      deadline,
      importance,
      urgency,
      effort,
      status
    } = req.body;

    // 🔥 BUILD SAFE UPDATE OBJECT
    const data = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (subject !== undefined) data.subject = subject;
    if (importance !== undefined) data.importance = importance;
    if (urgency !== undefined) data.urgency = urgency;
    if (effort !== undefined) data.effort = effort;
    if (status !== undefined) data.status = status;

    // 🔥 SAFE DEADLINE UPDATE
    if (deadline !== undefined) {
      if (deadline && !isNaN(new Date(deadline))) {
        data.deadline = new Date(deadline);
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data
    });

    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Update failed" });
  }
};
/* =========================
  DELETE TASK
========================= */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const existing = await prisma.task.findFirst({
      where: {
        id: id,
        userId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.delete({
      where: { id: id }
    });

    res.json({ message: "Task deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
};