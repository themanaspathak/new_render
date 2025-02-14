import { db } from "./db";
import { 
  users, orders, menuItems,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type MenuItem, MOCK_MENU_ITEMS
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Existing methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;

  // New methods for user management
  getUser(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserOrders(email: string): Promise<Order[]>;
}

export class DatabaseStorage implements IStorage {
  async getMenuItems(): Promise<MenuItem[]> {
    const items = await db.select().from(menuItems);
    return items.length > 0 ? items : MOCK_MENU_ITEMS;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async getUser(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    // Create user if doesn't exist
    let user = await this.getUser(orderData.userEmail);
    if (!user) {
      user = await this.createUser({ email: orderData.userEmail });
    }

    // Create order with user reference
    const [order] = await db.insert(orders)
      .values({
        ...orderData,
        userId: user.id
      })
      .returning();

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
}

export const storage = new DatabaseStorage();