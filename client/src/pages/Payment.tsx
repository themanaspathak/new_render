import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, Copy, Check, Loader2, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";

export default function Payment() {
  const { state, dispatch } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

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

  const getUPILink = (app: string) => {
    const amount = Math.round(total).toString();
    const tn = `ORDER_${Date.now()}`; // Transaction reference
    const params = new URLSearchParams({
      pa: upiId,
      pn: "Restaurant Name",
      tn,
      am: amount,
      cu: "INR"
    });

    switch (app) {
      case "gpay":
        return `tez://upi/pay?${params.toString()}`;
      case "phonepe":
        return `phonepe://pay?${params.toString()}`;
      case "paytm":
        return `paytmmp://pay?${params.toString()}`;
      case "mobikwik":
        return `mobikwik://pay?${params.toString()}`;
      default:
        return `upi://pay?${params.toString()}`;
    }
  };

  const handleAppPayment = async (app: string) => {
    setSelectedApp(app);
    const paymentLink = getUPILink(app);

    // Open the UPI app
    window.location.href = paymentLink;

    // Show toast with instructions
    toast({
      title: "Opening Payment App",
      description: "Complete the payment in your UPI app and come back here",
    });
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
      setSelectedApp(null);
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
          {/* Payment Apps */}
          <div className="space-y-3">
            <h3 className="font-medium mb-2">Choose Payment App</h3>

            {/* Google Pay */}
            <Button
              onClick={() => handleAppPayment("gpay")}
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-between"
              disabled={isProcessing}
            >
              <div className="flex items-center gap-3">
                <SiGooglepay className="h-6 w-6" />
                <span>Google Pay</span>
              </div>
              <span className="font-bold">₹{Math.round(total)}</span>
            </Button>

            {/* PhonePe */}
            <Button
              onClick={() => handleAppPayment("phonepe")}
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-between"
              disabled={isProcessing}
            >
              <div className="flex items-center gap-3">
                <SiPhonepe className="h-6 w-6" />
                <span>PhonePe</span>
              </div>
              <span className="font-bold">₹{Math.round(total)}</span>
            </Button>

            {/* Paytm */}
            <Button
              onClick={() => handleAppPayment("paytm")}
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-between"
              disabled={isProcessing}
            >
              <div className="flex items-center gap-3">
                <SiPaytm className="h-6 w-6" />
                <span>Paytm</span>
              </div>
              <span className="font-bold">₹{Math.round(total)}</span>
            </Button>

            {/* Mobikwik */}
            <Button
              onClick={() => handleAppPayment("mobikwik")}
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-between"
              disabled={isProcessing}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6" />
                <span>Mobikwik</span>
              </div>
              <span className="font-bold">₹{Math.round(total)}</span>
            </Button>
          </div>

          {/* QR Code Section */}
          <div className="text-center space-y-4 pt-4 border-t">
            <h3 className="font-medium">Or scan QR code</h3>
            <QrCode className="mx-auto h-48 w-48 text-primary" />
            <p className="text-sm text-muted-foreground">
              Scan this QR code with any UPI app to pay
            </p>
          </div>

          {/* UPI ID Section */}
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

          {/* Verification Button */}
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