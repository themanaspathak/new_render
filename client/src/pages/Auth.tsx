import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const { loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mobile number format
    if (!/^[0-9]{10}$/.test(mobile)) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginMutation.mutateAsync({ name, mobile });
      setLocation("/checkout");
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please try again",
        variant: "destructive",
      });
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In / Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                placeholder="Enter 10 digit mobile number"
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Please wait..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}