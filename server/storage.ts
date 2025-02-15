import { 
  users, orders, menuItems,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type MenuItem
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUser(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserOrders(email: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled'): Promise<Order>;
  updateMenuItemAvailability(itemId: number, isAvailable: boolean): Promise<MenuItem>;
}

export class DatabaseStorage implements IStorage {
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const items = await db.select().from(menuItems);
      return items;
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return [];
    }
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    try {
      const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
      return item;
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return undefined;
    }
  }

  async getUser(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    if (!userData.password) {
      throw new Error("Password is required");
    }

    const hashedPassword = await hashPassword(userData.password);
    const [user] = await db.insert(users)
      .values({
        ...userData,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(email: string): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.userEmail, email))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled'): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    return updatedOrder;
  }

  async updateMenuItemAvailability(itemId: number, isAvailable: boolean): Promise<MenuItem> {
    try {
      const [updatedItem] = await db
        .update(menuItems)
        .set({ isAvailable })
        .where(eq(menuItems.id, itemId))
        .returning();

      if (!updatedItem) {
        throw new Error(`Menu item with ID ${itemId} not found`);
      }

      return updatedItem;
    } catch (error) {
      console.error("Error updating menu item availability:", error);
      throw new Error(`Failed to update availability for item ${itemId}`);
    }
  }
}

export const storage = new DatabaseStorage();
