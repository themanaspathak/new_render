import { MenuItem, Order, InsertOrder } from "@shared/schema";

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
    this.menuItems = [
      {
        id: 1,
        name: "Butter Chicken",
        description: "Tender chicken in rich, creamy tomato gravy",
        price: 320,
        category: "Main Course",
        imageUrl: "https://source.unsplash.com/800x600/?butter-chicken",
        isVegetarian: false,
        isBestSeller: true,
        customizations: {
          options: [
            {
              name: "Spice Level",
              choices: ["Mild", "Medium", "Spicy"],
              maxChoices: 1
            },
            {
              name: "Bread",
              choices: ["Naan", "Roti", "Paratha"],
              maxChoices: 1
            }
          ]
        }
      },
      {
        id: 2,
        name: "Paneer Tikka Masala",
        description: "Grilled cottage cheese in spiced tomato gravy",
        price: 280,
        category: "Main Course",
        imageUrl: "https://source.unsplash.com/800x600/?paneer-tikka",
        isVegetarian: true,
        isBestSeller: true,
        customizations: {
          options: [
            {
              name: "Spice Level",
              choices: ["Mild", "Medium", "Spicy"],
              maxChoices: 1
            }
          ]
        }
      },
      {
        id: 3,
        name: "Dal Makhani",
        description: "Creamy black lentils simmered overnight",
        price: 220,
        category: "Main Course",
        imageUrl: "https://source.unsplash.com/800x600/?dal-makhani",
        isVegetarian: true,
        isBestSeller: false,
        customizations: {
          options: [
            {
              name: "Add-ons",
              choices: ["Extra Butter", "Extra Cream"],
              maxChoices: 2
            }
          ]
        }
      },
      {
        id: 4,
        name: "Chicken Biryani",
        description: "Fragrant rice layered with spiced chicken",
        price: 340,
        category: "Rice",
        imageUrl: "https://source.unsplash.com/800x600/?biryani",
        isVegetarian: false,
        isBestSeller: true,
        customizations: {
          options: [
            {
              name: "Size",
              choices: ["Half", "Full"],
              maxChoices: 1
            }
          ]
        }
      },
      {
        id: 5,
        name: "Gulab Jamun",
        description: "Deep-fried milk dumplings in sugar syrup",
        price: 120,
        category: "Desserts",
        imageUrl: "https://source.unsplash.com/800x600/?gulab-jamun",
        isVegetarian: true,
        isBestSeller: false,
        customizations: null
      },
      {
        id: 6,
        name: "Garlic Naan",
        description: "Butter naan topped with garlic and herbs",
        price: 60,
        category: "Breads",
        imageUrl: "https://source.unsplash.com/800x600/?naan",
        isVegetarian: true,
        isBestSeller: false,
        customizations: null
      },
      {
        id: 7,
        name: "Malai Kofta",
        description: "Cheese and potato dumplings in creamy gravy",
        price: 260,
        category: "Main Course",
        imageUrl: "https://source.unsplash.com/800x600/?kofta",
        isVegetarian: true,
        isBestSeller: false,
        customizations: {
          options: [
            {
              name: "Spice Level",
              choices: ["Mild", "Medium", "Spicy"],
              maxChoices: 1
            }
          ]
        }
      },
      {
        id: 8,
        name: "Tandoori Roti",
        description: "Whole wheat bread baked in tandoor",
        price: 40,
        category: "Breads",
        imageUrl: "https://source.unsplash.com/800x600/?roti",
        isVegetarian: true,
        isBestSeller: false,
        customizations: null
      },
      {
        id: 9,
        name: "Chicken Tikka",
        description: "Marinated & grilled chicken pieces",
        price: 280,
        category: "Starters",
        imageUrl: "https://source.unsplash.com/800x600/?chicken-tikka",
        isVegetarian: false,
        isBestSeller: true,
        customizations: {
          options: [
            {
              name: "Spice Level",
              choices: ["Mild", "Medium", "Spicy"],
              maxChoices: 1
            }
          ]
        }
      },
      {
        id: 10,
        name: "Rasgulla",
        description: "Soft cheese balls in sugar syrup",
        price: 100,
        category: "Desserts",
        imageUrl: "https://source.unsplash.com/800x600/?rasgulla",
        isVegetarian: true,
        isBestSeller: false,
        customizations: null
      }
    ];
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
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date(),
      status: order.status || 'pending'
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
}

export const storage = new MemStorage();