import { pgTable, text, serial, integer, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  customizations: jsonb("customizations").$type<{
    options: { name: string; choices: string[]; maxChoices: number }[];
  }>(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").notNull(),
  items: jsonb("items").$type<{
    menuItemId: number;
    quantity: number;
    customizations: Record<string, string[]>;
  }[]>().notNull(),
  status: text("status").notNull(),
  total: real("total").notNull(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems);
export const insertOrderSchema = createInsertSchema(orders);

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 12.99,
    category: "Mains",
    imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
    customizations: {
      options: [
        {
          name: "Cheese",
          choices: ["None", "American", "Swiss", "Cheddar"],
          maxChoices: 1
        },
        {
          name: "Toppings",
          choices: ["Lettuce", "Tomato", "Onion", "Pickles"],
          maxChoices: 4
        }
      ]
    }
  },
  {
    id: 2,
    name: "Caesar Salad",
    description: "Crisp romaine lettuce, croutons, parmesan cheese",
    price: 9.99,
    category: "Starters",
    imageUrl: "https://images.unsplash.com/photo-1454944338482-a69bb95894af",
    customizations: {
      options: [
        {
          name: "Protein",
          choices: ["None", "Chicken", "Shrimp"],
          maxChoices: 1
        },
        {
          name: "Dressing",
          choices: ["Regular", "Light", "On Side"],
          maxChoices: 1
        }
      ]
    }
  }
];
