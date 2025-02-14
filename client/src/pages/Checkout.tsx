import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Checkout() {
  const { state, dispatch } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const createOrder = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders", {
        tableNumber: state.tableNumber || 1,
        items: state.items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: item.customizations,
        })),
        status: "pending",
        total: state.items.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        ),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been confirmed and is being prepared.",
      });
      dispatch({ type: "CLEAR" });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate();
  };

  if (state.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-background/95 backdrop-blur py-4 -mx-4 px-4 mb-6 md:hidden">
        <Link href="/cart">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentDetails.cardNumber}
                  onChange={(e) =>
                    setPaymentDetails((prev) => ({
                      ...prev,
                      cardNumber: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={paymentDetails.expiry}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        expiry: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentDetails.cvv}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        cvv: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.menuItem.name}
                  </span>
                  <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    $
                    {state.items
                      .reduce(
                        (sum, item) => sum + item.menuItem.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}