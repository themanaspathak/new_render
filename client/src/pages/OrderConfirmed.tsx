import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmed() {
  const { state, dispatch } = useCart();
  const { state: authState } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authState.user) {
      setLocation("/auth");
      return;
    }

    // Submit order to kitchen
    const submitOrder = async () => {
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: authState.user.id,
            tableNumber: 1, // This should be dynamic in a real implementation
            items: state.items.map(item => ({
              menuItemId: item.menuItem.id,
              quantity: item.quantity,
              customizations: item.customizations
            })),
            status: "pending",
            cookingInstructions: state.cookingInstructions,
            total: state.items.reduce(
              (sum, item) => sum + item.menuItem.price * item.quantity,
              0
            ),
          }),
        });

        // Clear the cart after successful order submission
        dispatch({ type: "CLEAR_CART" });
      } catch (error) {
        console.error("Failed to submit order:", error);
      }
    };

    if (state.items.length > 0) {
      submitOrder();
    }
  }, [authState.user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card className="p-6 text-center">
        <div className="mb-6">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been received and is being prepared.
        </p>
        <Link href="/">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            OK
          </Button>
        </Link>
      </Card>
    </div>
  );
}