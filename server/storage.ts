import { db } from "./db";
import { 
  users, orders, menuItems,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type MenuItem, MOCK_MENU_ITEMS
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUser(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserOrders(email: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled' | 'in progress'): Promise<Order>;
  updateMenuItemAvailability(itemId: number, isAvailable: boolean): Promise<MenuItem>;
  getUserOrdersByMobile(mobileNumber: string): Promise<Order[]>;
}

export class DatabaseStorage implements IStorage {
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const items = await db.select().from(menuItems);
      if (items.length === 0) {
        const insertedItems = await db.insert(menuItems)
          .values(MOCK_MENU_ITEMS)
          .returning();
        return insertedItems;
      }
      return items;
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return MOCK_MENU_ITEMS;
    }
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    try {
      const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
      return item;
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return MOCK_MENU_ITEMS.find(item => item.id === id);
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
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      console.log("Creating order with data:", orderData);

      // Create the order with "in progress" status
      const [order] = await db.insert(orders)
        .values({
          mobileNumber: orderData.mobileNumber,
          customerName: orderData.customerName,
          tableNumber: orderData.tableNumber,
          items: orderData.items,
          status: 'in progress',
          paymentStatus: 'pending',
          paymentMethod: orderData.paymentMethod,
          cookingInstructions: orderData.cookingInstructions,
          total: orderData.total,
          createdAt: new Date()
        })
        .returning();

      console.log("Order created successfully:", order);
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      return undefined;
    }
  }

  async getUserOrders(email: string): Promise<Order[]> {
    try {
      return await db.select()
        .from(orders)
        .where(eq(orders.userEmail, email))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      return await db.select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled' | 'in progress'): Promise<Order> {
    try {
      const [updatedOrder] = await db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, orderId))
        .returning();

      if (!updatedOrder) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      return updatedOrder;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error("Failed to update order status");
    }
  }

  async updateMenuItemAvailability(itemId: number, isAvailable: boolean): Promise<MenuItem> {
    try {
      const [updatedItem] = await db
        .update(menuItems)
        .set({ isAvailable })
        .where(eq(menuItems.id, itemId))
        .returning();

      if (!updatedItem) {
        const mockItem = MOCK_MENU_ITEMS.find(item => item.id === itemId);
        if (!mockItem) {
          throw new Error(`Menu item with ID ${itemId} not found`);
        }

        const [insertedItem] = await db
          .insert(menuItems)
          .values({ ...mockItem, isAvailable })
          .returning();

        return insertedItem;
      }

      return updatedItem;
    } catch (error) {
      console.error("Error updating menu item availability:", error);
      throw new Error(`Failed to update availability for item ${itemId}`);
    }
  }
  async getUserOrdersByMobile(mobileNumber: string): Promise<Order[]> {
    try {
      return await db.select()
        .from(orders)
        .where(eq(orders.mobileNumber, mobileNumber))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error fetching user orders by mobile:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();