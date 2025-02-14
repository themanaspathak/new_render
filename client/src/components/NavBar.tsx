import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ClipboardList } from "lucide-react";

export default function NavBar() {
  const verifiedEmail = localStorage.getItem("verifiedEmail");
  const [location] = useLocation();

  // Hide navigation on kitchen page
  if (location === "/kitchen") {
    return null;
  }

  return (
    <div className="fixed top-0 w-full px-4 py-4 flex justify-between z-50">
      {/* Left side - Order History */}
      <div>
        {verifiedEmail && (
          <Link href={`/orders/${encodeURIComponent(verifiedEmail)}`}>
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Right side - Cart */}
      <div>
        <Link href="/cart">
          <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}