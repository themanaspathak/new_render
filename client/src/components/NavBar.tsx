import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ClipboardList } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function NavBar() {
  const verifiedEmail = localStorage.getItem("verifiedEmail");
  const [location] = useLocation();
  const { state } = useCart();

  // Hide navigation on kitchen page
  if (location === "/kitchen") {
    return null;
  }

  // Calculate total items in cart
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 right-0 p-4 flex gap-2 z-50">
      <Link href="/cart">
        <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </Link>

      {verifiedEmail && (
        <Link href={`/orders/${encodeURIComponent(verifiedEmail)}`}>
          <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </Button>
        </Link>
      )}
    </nav>
  );
}