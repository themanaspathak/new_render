import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import authRouter from "./routes/auth";
import { ensureAdminUser } from "./services/auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register auth routes
app.use("/api", authRouter);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Run database migrations in production
    if (process.env.NODE_ENV === 'production') {
      const { runMigrations } = await import('./migrate.js');
      await runMigrations();
    }

    // Create default admin user
    await ensureAdminUser("admin@restaurant.com", "admin123");

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    const startServer = () => {
      server.listen(PORT, () => {
        log(`Server running in ${app.get("env")} mode on port ${PORT}`);
      });

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          log(`Port ${PORT} is busy, retrying in 5 seconds...`);
          setTimeout(() => {
            server.close();
            startServer();
          }, 5000);
        } else {
          console.error('Server error:', error);
          process.exit(1);
        }
      });
    };

    startServer();
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
})();