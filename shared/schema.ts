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
    name: "Vegetable Manchurian",
    description: "Crispy vegetable dumplings in a spicy Indo-Chinese sauce",
    price: 8.99,
    category: "Starters",
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
    customizations: {
      options: [
        {
          name: "Spice Level",
          choices: ["Mild", "Medium", "Hot"],
          maxChoices: 1
        },
        {
          name: "Sauce",
          choices: ["Dry", "With Gravy"],
          maxChoices: 1
        }
      ]
    }
  },
  {
    id: 2,
    name: "Paneer Popcorn",
    description: "Bite-sized crispy cottage cheese fritters with Indian spices",
    price: 9.99,
    category: "Starters",
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
    customizations: {
      options: [
        {
          name: "Spice Level",
          choices: ["Mild", "Medium", "Hot"],
          maxChoices: 1
        },
        {
          name: "Dips",
          choices: ["Mint Chutney", "Tamarind Chutney", "Tomato Sauce"],
          maxChoices: 2
        }
      ]
    }
  },
  {
    id: 3,
    name: "Mutter Paneer",
    description: "Fresh cottage cheese and green peas in rich tomato gravy",
    price: 14.99,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1631452180775-7c5d27efa8d4",
    customizations: {
      options: [
        {
          name: "Spice Level",
          choices: ["Mild", "Medium", "Hot"],
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
    id: 4,
    name: "Malai Kofta",
    description: "Potato and cheese dumplings in creamy cashew sauce",
    price: 15.99,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1585032226639-91c2e508a542",
    customizations: {
      options: [
        {
          name: "Spice Level",
          choices: ["Mild", "Medium", "Hot"],
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
    id: 5,
    name: "Hyderabadi Chicken Biryani",
    description: "Aromatic basmati rice cooked with spiced chicken and herbs",
    price: 16.99,
    category: "Rice and Biryani",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
    customizations: {
      options: [
        {
          name: "Spice Level",
          choices: ["Mild", "Medium", "Hot"],
          maxChoices: 1
        },
        {
          name: "Add-ons",
          choices: ["Raita", "Salan", "Extra Gravy"],
          maxChoices: 2
        }
      ]
    }
  },
  {
    id: 6,
    name: "Masala Dosa",
    description: "Crispy rice crepe filled with spiced potato masala",
    price: 11.99,
    category: "South Indian",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc",
    customizations: {
      options: [
        {
          name: "Accompaniments",
          choices: ["Coconut Chutney", "Sambar", "Tomato Chutney"],
          maxChoices: 3
        },
        {
          name: "Extra Filling",
          choices: ["More Potato", "Onion", "Cheese"],
          maxChoices: 1
        }
      ]
    }
  },
  {
    id: 7,
    name: "Chana Masala with Rice",
    description: "Spiced chickpeas curry served with steamed basmati rice",
    price: 12.99,
    category: "Fast Food",
    imageUrl: "https://images.unsplash.com/photo-1585032226634-b2ef638c7350",
    customizations: {
      options: [
        {
          name: "Spice Level",
          choices: ["Mild", "Medium", "Hot"],
          maxChoices: 1
        },
        {
          name: "Add-ons",
          choices: ["Raita", "Papad", "Extra Rice"],
          maxChoices: 2
        }
      ]
    }
  },
  {
    id: 8,
    name: "Idli Sambhar",
    description: "Steamed rice cakes served with lentil soup and chutneys",
    price: 10.99,
    category: "South Indian",
    imageUrl: "https://images.unsplash.com/photo-1589301841844-1cf2d77f9b36",
    customizations: {
      options: [
        {
          name: "Accompaniments",
          choices: ["Coconut Chutney", "Tomato Chutney", "Extra Sambhar"],
          maxChoices: 3
        },
        {
          name: "Extra Items",
          choices: ["Vada", "Podi", "Ghee"],
          maxChoices: 2
        }
      ]
    }
  }
];