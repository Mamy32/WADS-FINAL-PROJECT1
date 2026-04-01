require("dotenv").config();
const express = require("express");
const cors = require("cors");


const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/ai");
const sessionRoutes = require("./routes/sessionRoutes");
const app = express();

/* =========================
  MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
  ROUTES
========================= */
app.use("/auth", authRoutes);   // Firebase sync route
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);
app.use("/ai", aiRoutes);
app.use("/sessions", sessionRoutes);

/* =========================
  TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Study Planner API running");
});


/* =========================
  START SERVER
========================= */
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});