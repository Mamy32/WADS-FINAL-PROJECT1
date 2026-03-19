import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { prisma } from "./config/prisma.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Study Planner API running")
})

app.get("/test-db", async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})