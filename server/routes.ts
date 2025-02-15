import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertUserSchema } from "@shared/schema";
import { menuRouter } from "./routes/menu";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/menu", menuRouter);

  app.get("/api/user", async (req, res) => {
    try {
      const userEmail = req.headers['x-user-email'];
      if (!userEmail || typeof userEmail !== 'string') {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userEmail);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);

      const isValid = await storage.verifyUserPassword(email, password);
      if (!isValid) {
        console.log("Invalid credentials for user:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = await storage.getUser(email);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      console.log("Login successful for user:", email);
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const created = await storage.createOrder(order);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.post("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = parseInt(req.params.id);

      if (!['completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Failed to update order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
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

  app.get("/api/users/:email/orders", async (req, res) => {
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