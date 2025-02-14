import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ClipboardList } from "lucide-react";

export default function NavBar() {
  const verifiedEmail = localStorage.getItem("verifiedEmail");

  return (
    <div className="fixed top-0 right-0 p-4 flex gap-2">
      <Link href="/cart">
        <Button variant="outline" size="icon" className="rounded-full">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </Link>
      
      {verifiedEmail && (
        <Link href={`/orders/${encodeURIComponent(verifiedEmail)}`}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ClipboardList className="h-5 w-5" />
          </Button>
        </Link>
      )}
    </div>
  );
}
