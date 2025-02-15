import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import authRouter from "./routes/auth";
import { ensureAdminUser } from "./services/auth";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

app.use("/api/", limiter);

// Session configuration
app.use(session({
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CSRF protection
app.use(csrf({ cookie: true }));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

// Register auth routes
app.use("/api", authRouter);

// Logging middleware
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

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      message: 'Invalid CSRF token'
    });
  }
  next(err);
});

(async () => {
  try {
    // Create default admin user
    await ensureAdminUser("admin@restaurant.com", "admin123");

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Don't expose stack traces in production
      const error = process.env.NODE_ENV === 'production' 
        ? { message } 
        : { message, stack: err.stack };

      res.status(status).json(error);
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      log(`Server running in ${app.get("env")} mode on port ${PORT}`);
    });

  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
})();