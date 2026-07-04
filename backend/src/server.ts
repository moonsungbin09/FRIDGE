import express from "express";
import { prisma } from "./lib/prisma";

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10);
const port =
  Number.isInteger(parsedPort) && parsedPort >= 1 && parsedPort <= 65535
    ? parsedPort
    : 4000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const start = async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(async (error) => {
      if (error) {
        console.error("Error during server shutdown:", error);
        process.exit(1);
      }

      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error("Error disconnecting Prisma:", disconnectError);
        process.exit(1);
      }

      console.log("Server stopped");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

void start();
