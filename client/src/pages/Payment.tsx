import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payment() {
  const { state } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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
      // Get email from earlier verification step
      const userEmail = localStorage.getItem("verifiedEmail");
      if (!userEmail) {
        console.error("No verified email found");
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      if (response.ok) {
        navigate("/order-confirmed");
      } else {
        toast({
          title: "Payment Error",
          description: "Failed to verify payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          >
            I have completed the payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
