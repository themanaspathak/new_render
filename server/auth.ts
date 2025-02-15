import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.session.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
