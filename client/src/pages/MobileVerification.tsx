import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function MobileVerification() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsResending(true);
      const response = await fetch("/api/send-mobile-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: mobileNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP Sent",
          description: `Please check your mobile (+91 ${formatPhoneNumber(mobileNumber)}) for OTP`,
        });
        setShowOtpInput(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/verify-mobile-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: mobileNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // Store verified phone number in localStorage
        localStorage.setItem("verifiedPhone", mobileNumber);

        toast({
          title: "Mobile Verified",
          description: "Proceeding to order confirmation",
        });
        navigate("/order-confirmed");
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
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
                disabled={mobileNumber.length !== 10 || isLoading}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-500">
                  Enter the 6-digit code sent to +91 {formatPhoneNumber(mobileNumber)}
                </p>
                <InputOTP
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} index={index} {...slot} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
                <div className="pt-4 space-y-4">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500">
                      Didn't receive the OTP?
                    </p>
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-primary/90"
                      onClick={handleSendOtp}
                      disabled={isResending}
                    >
                      {isResending ? "Sending..." : "Resend OTP"}
                    </Button>
                  </div>

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