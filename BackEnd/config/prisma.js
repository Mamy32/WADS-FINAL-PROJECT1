// Import Prisma Client
const { PrismaClient } = require("@prisma/client");

// Create a new Prisma instance
const prisma = new PrismaClient();

// Export it so other files can use it
module.exports = prisma;
