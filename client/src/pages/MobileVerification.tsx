import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

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
    // For now, we'll simulate OTP sending with code 123456
    toast({
      title: "OTP Sent",
      description: `Please check your mobile (+91 ${formatPhoneNumber(mobileNumber)}) for OTP`,
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

    // For testing, accept any 6-digit OTP
    toast({
      title: "Mobile Verified",
      description: "Proceeding to order confirmation",
    });
    navigate("/order-confirmed");
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "").slice(0, 10);

    // Format as XXXXX XXXXX
    if (digits.length >= 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return digits;
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formatPhoneNumber(mobileNumber)}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-12 text-lg tracking-wide"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  We'll send you a one-time password (OTP)
                </p>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSendOtp}
                disabled={mobileNumber.length !== 10}
              >
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Input
                        key={index}
                        type="text"
                        maxLength={1}
                        className="w-12 h-12 text-center text-2xl"
                        value={otp[index] || ""}
                        onChange={(e) => {
                          const newOtp = otp.split("");
                          newOtp[index] = e.target.value;
                          setOtp(newOtp.join(""));

                          // Auto-focus next input
                          if (e.target.value && index < 5) {
                            const nextInput = e.target.parentElement?.nextElementSibling?.querySelector("input");
                            if (nextInput) nextInput.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle backspace
                          if (e.key === "Backspace" && !otp[index] && index > 0) {
                            const prevInput = e.currentTarget.parentElement?.previousElementSibling?.querySelector("input");
                            if (prevInput) prevInput.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter the 6-digit code sent to +91 {formatPhoneNumber(mobileNumber)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6}
                  >
                    Verify OTP
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp("");
                    }}
                  >
                    Change Number
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}