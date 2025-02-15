import { Router } from "express";
import { storage } from "../storage";

export const menuRouter = Router();

// GET all menu items
menuRouter.get("/", async (req, res) => {
  try {
    const items = await storage.getMenuItems();
    res.json(items);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// GET single menu item
menuRouter.get("/:id", async (req, res) => {
  try {
    const item = await storage.getMenuItem(parseInt(req.params.id));
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
});

// Update menu item availability
menuRouter.post("/:id/availability", async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      res.status(400).json({ error: "isAvailable must be a boolean" });
      return;
    }

    const updatedItem = await storage.updateMenuItemAvailability(itemId, isAvailable);
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item availability:", error);
    res.status(500).json({ error: "Failed to update menu item availability" });
  }
});