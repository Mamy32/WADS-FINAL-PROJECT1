const prisma = require("../config/prisma");

/* =========================
  CREATE TASK
========================= */
exports.createTask = async (req, res) => {
  try {
    const { title, description, subject, deadline, importance, urgency, effort } = req.body;

    // user from Firebase token
    const userId = req.user.uid;

    // ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: req.user.email || `${userId}@example.com`,
        password: "firebase-auth"
      }
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        subject,
        deadline: new Date(deadline) ? new Date(deadline).toISOString() : null,
        importance,
        urgency,
        effort,
        userId
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


exports.updateTask = async (req, res) => {
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

    const updated = await prisma.task.update({
      where: { id: id },
      data: {
        title,
        description,
        subject,
        deadline: deadline ? new Date(deadline).toISOString() : null, 
        importance,
        urgency,
        effort,
        status
      }
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