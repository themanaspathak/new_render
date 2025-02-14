import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function MobileVerification() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSendOtp = () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    // TODO: Integrate with actual OTP service
    // For now, we'll simulate OTP sending
    toast({
      title: "OTP Sent",
      description: "Please check your mobile for OTP",
    });
    setShowOtpInput(true);
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    // TODO: Integrate with actual OTP verification
    // For now, we'll simulate verification
    toast({
      title: "Mobile Verified",
      description: "Proceeding to order confirmation",
    });
    navigate("/order-confirmed");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify Mobile Number</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showOtpInput ? (
            <>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  We'll send you a one-time password (OTP)
                </p>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSendOtp}
              >
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    render={({ slots }) => (
                      <InputOTPGroup className="gap-2">
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Enter the 6-digit code sent to {mobileNumber}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleVerifyOtp}
                >
                  Verify OTP
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowOtpInput(false)}
                >
                  Change Number
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
