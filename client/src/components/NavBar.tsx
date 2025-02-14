import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ClipboardList } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

export default function NavBar() {
  const verifiedEmail = localStorage.getItem("verifiedEmail");
  const [location] = useLocation();
  const { state } = useCart();

  // Hide navigation on kitchen page and email verification page
  if (location === "/kitchen" || location === "/email-verification") {
    return null;
  }

  const cartItemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 right-0 p-4 flex gap-2 z-50">
      <Link href="/cart">
        <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs z-10"
            >
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </Link>

      {verifiedEmail && (
        <Link href={`/orders/${encodeURIComponent(verifiedEmail)}`}>
          <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm z-0">
            <ClipboardList className="h-5 w-5" />
          </Button>
        </Link>
      )}
    </nav>
  );
}