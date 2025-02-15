import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order, MenuItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, IndianRupee } from "lucide-react";

export default function OrderHistory() {
  const [, navigate] = useLocation();
  const mobileNumber = localStorage.getItem("verifiedMobile");

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders/mobile/${encodeURIComponent(mobileNumber || "")}`],
    enabled: !!mobileNumber,
  });

  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  if (!mobileNumber) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
        <p className="mb-4">Please verify your mobile number to view order history</p>
        <Button onClick={() => navigate("/")}>Go to Menu</Button>
      </div>
    );
  }

  if (ordersLoading || menuLoading) {
    return <div className="container mx-auto px-4 py-8">Loading order history...</div>;
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "in progress":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case "cancelled":
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-gray-600">+91 {mobileNumber}</p>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {order.customerName}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusBadgeStyle(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => {
                    const menuItem = menuItems?.find(m => m.id === item.menuItemId);
                    return (
                      <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {menuItem?.name || `Item #${item.menuItemId}`} × {item.quantity}
                          </p>
                          <div className="text-sm text-gray-600">
                            {Object.entries(item.customizations).map(([category, choices]) => (
                              <div key={category}>
                                • {category}: {choices.join(", ")}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right font-medium">
                          <IndianRupee className="h-4 w-4 inline-block" />
                          {menuItem ? Math.round(menuItem.price * item.quantity).toLocaleString('en-IN') : 0}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.cookingInstructions && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    <span className="font-medium">Special Instructions:</span>
                    <p>{order.cookingInstructions}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Table #{order.tableNumber}</p>
                    <p className="text-sm text-gray-600">
                      Payment: {order.paymentMethod?.toUpperCase() || 'Not specified'}
                       ({order.paymentStatus})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg">
                      <IndianRupee className="h-4 w-4 inline-block" />
                      {Math.round(order.total).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!orders || orders.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-600">No orders found</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Place Your First Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}