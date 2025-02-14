import { createContext, useContext, useReducer, ReactNode } from "react";
import { MenuItem } from "@shared/schema";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: Record<string, string[]>;
}

interface CartState {
  items: CartItem[];
  tableNumber: number | null;
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; menuItemId: number }
  | { type: "UPDATE_QUANTITY"; menuItemId: number; quantity: number }
  | { type: "SET_TABLE"; tableNumber: number }
  | { type: "CLEAR" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.item],
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.menuItem.id !== action.menuItemId),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.menuItem.id === action.menuItemId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    case "SET_TABLE":
      return {
        ...state,
        tableNumber: action.tableNumber,
      };
    case "CLEAR":
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    tableNumber: null,
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
