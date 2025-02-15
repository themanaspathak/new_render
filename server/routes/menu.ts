import { Router } from "express";
import { storage } from "../storage";

export const menuRouter = Router();

menuRouter.post("/:id/availability", async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { isAvailable } = req.body;

    const updatedItem = await storage.updateMenuItemAvailability(itemId, isAvailable);
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item availability:", error);
    res.status(500).json({ error: "Failed to update menu item availability" });
  }
});
