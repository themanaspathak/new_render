import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order, MenuItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OrderHistory() {
  const [, navigate] = useLocation();
  const email = localStorage.getItem("verifiedEmail");

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/users/${encodeURIComponent(email || "")}/orders`],
    enabled: !!email,
  });

  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  if (!email) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
        <p className="mb-4">Please verify your email to view order history</p>
        <Button onClick={() => navigate("/")}>Go to Menu</Button>
      </div>
    );
  }

  if (ordersLoading || menuLoading) {
    return <div className="container mx-auto px-4 py-8">Loading order history...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-gray-600">{email}</p>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order #{order.id}</CardTitle>
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  {order.items.map((item, index) => {
                    const menuItem = menuItems?.find(m => m.id === item.menuItemId);
                    return (
                      <div key={index} className="flex justify-between items-start py-2">
                        <div>
                          <p className="font-medium">{menuItem?.name || `Item #${item.menuItemId}`} × {item.quantity}</p>
                          {Object.entries(item.customizations).map(([category, choices]) => (
                            <div key={category} className="text-sm text-gray-600">
                              {category}: {choices.join(", ")}
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{menuItem ? Math.round(menuItem.price * item.quantity) : 0}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {order.cookingInstructions && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Special Instructions:</span>
                    <p>{order.cookingInstructions}</p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">₹{Math.round(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}