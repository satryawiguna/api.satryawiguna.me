import app from "./app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Handle database connection
async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Start server
async function startServer() {
  const isConnected = await connectToDatabase();

  if (isConnected) {
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  } else {
    console.error("❌ Server not started due to database connection failure");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("✅ Database disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("✅ Database disconnected");
  process.exit(0);
});

// Start the server
startServer().catch((err) => {
  console.error("❌ Error starting server:", err);
  process.exit(1);
});
