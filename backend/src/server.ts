import express from "express";
import path from "node:path";
import recipesRouter from "./routes/recipes";

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10);
const port =
  Number.isInteger(parsedPort) && parsedPort >= 1 && parsedPort <= 65535
    ? parsedPort
    : 4000;

app.use(express.json());
app.use("/api/recipes", recipesRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const start = () => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close((error) => {
      if (error) {
        console.error("Error during server shutdown:", error);
        process.exit(1);
      }

      console.log("Server stopped");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();
