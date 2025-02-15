import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { menuRouter } from "./routes/menu";
import { requireAuth, requireAdmin } from "./auth";
import { pool } from "./db";

const PostgresSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      store: new PostgresSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.use("/api/menu", menuRouter);

  // Auth routes
  app.get("/api/user", requireAuth, (req, res) => {
    res.json(req.session.user);
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for:", email);

      const user = await storage.getUser(email);
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("User found, verifying password...");
      const isValid = await storage.verifyUserPassword(email, password);

      if (!isValid) {
        console.log("Password verification failed for:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      const { password: _, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;

      console.log("Login successful for:", email);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Protected routes
  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const created = await storage.createOrder(order);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.post("/api/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = parseInt(req.params.id);

      if (!["completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Failed to update order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/users/:email/orders", requireAuth, async (req, res) => {
    try {
      const { email } = req.params;
      const orders = await storage.getUserOrders(email);
      res.json(orders);
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      res.status(500).json({ message: "Failed to fetch order history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}