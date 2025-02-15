import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Payment() {
  const { state, dispatch } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = state.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  // Simulated UPI ID - In production, this would be your restaurant's actual UPI ID
  const upiId = "restaurant@upi";

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({
      title: "UPI ID Copied",
      description: "The UPI ID has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentVerification = async () => {
    try {
      setIsProcessing(true);

      // Get email from earlier verification step
      const userEmail = localStorage.getItem("verifiedEmail");
      if (!userEmail) {
        toast({
          title: "Error",
          description: "Please verify your email first",
          variant: "destructive",
        });
        navigate("/email-verification");
        return;
      }

      // Create the order with UPI payment method
      const response = await apiRequest("/api/orders", "POST", {
        tableNumber: state.tableNumber || 1,
        userEmail,
        items: state.items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: item.customizations
        })),
        status: "pending",
        paymentStatus: "paid",
        paymentMethod: "upi",
        cookingInstructions: state.cookingInstructions,
        total: total,
      });

      if (response.ok) {
        // Clear cart and redirect to confirmation
        dispatch({ type: "CLEAR_CART" });
        navigate("/order-confirmed");

        toast({
          title: "Payment Successful",
          description: "Your order has been placed successfully!",
        });
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast({
        title: "Payment Error",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
        <p className="mb-4">No items in cart</p>
        <Button onClick={() => navigate("/")}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Button variant="ghost" onClick={() => navigate("/checkout")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Checkout
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">UPI Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <QrCode className="mx-auto h-48 w-48 text-primary" />
            <p className="text-sm text-muted-foreground">
              Scan this QR code with any UPI app to pay
            </p>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount:</span>
              <span className="font-bold">₹{Math.round(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">UPI ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{upiId}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyUPI}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePaymentVerification}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "I have completed the payment"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}