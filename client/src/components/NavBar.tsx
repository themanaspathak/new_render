import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ClipboardList } from "lucide-react";

export default function NavBar() {
  const verifiedEmail = localStorage.getItem("verifiedEmail");
  const [location] = useLocation();

  // Hide navigation on kitchen page and email verification page
  if (location === "/kitchen" || location === "/email-verification") {
    return null;
  }

  return (
    <nav className="fixed top-0 right-0 p-4 flex gap-2 z-50">
      <Link href="/cart">
        <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm">
          <ShoppingCart className="h-5 w-5" />
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