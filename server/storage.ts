import { MenuItem, Order, InsertOrder, MOCK_MENU_ITEMS } from "@shared/schema";

export interface IStorage {
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private menuItems: MenuItem[];
  private orders: Map<number, Order>;
  private currentOrderId: number;

  constructor() {
    this.menuItems = MOCK_MENU_ITEMS;
    this.orders = new Map();
    this.currentOrderId = 1;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return this.menuItems;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.find(item => item.id === id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { ...order, id };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
}

export const storage = new MemStorage();
