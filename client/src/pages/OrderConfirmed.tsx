import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmed() {
  const { state, dispatch } = useCart();

  useEffect(() => {
    // Submit order to kitchen
    const submitOrder = async () => {
      try {
        // Get email from earlier verification step
        const userEmail = localStorage.getItem("verifiedEmail");
        if (!userEmail) {
          console.error("No verified email found");
          return;
        }

        // Calculate total with GST
        const subtotal = state.items.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        );
        const gst = subtotal * 0.05; // 5% GST
        const total = subtotal + gst;

        // Submit order with table number
        await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableNumber: state.tableNumber,
            userEmail,
            items: state.items.map(item => ({
              menuItemId: item.menuItem.id,
              quantity: item.quantity,
              customizations: item.customizations
            })),
            status: "pending",
            cookingInstructions: state.cookingInstructions,
            total: Math.round(total),
          }),
        });

        // Clear the cart after successful order submission
        dispatch({ type: "CLEAR_CART" });
      } catch (error) {
        console.error("Failed to submit order:", error);
      }
    };

    if (state.items.length > 0 && state.tableNumber) {
      submitOrder();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card className="p-6 text-center">
        <div className="mb-6">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-2">
          Your order has been received and is being prepared.
        </p>
        <p className="text-gray-600 mb-6">
          Please proceed to Table #{state.tableNumber}
        </p>
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Place Another Order
            </Button>
          </Link>
          <Link href={`/orders/${encodeURIComponent(localStorage.getItem("verifiedEmail") || "")}`}>
            <Button variant="outline" className="w-full">
              View Order History
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}