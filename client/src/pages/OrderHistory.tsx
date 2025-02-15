import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order, MenuItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, IndianRupee, User, Phone } from "lucide-react";

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
      <div className="mb-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 py-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>+91 {mobileNumber}</span>
        </div>
      </div>

      <div className="space-y-6">
        {orders?.map((order) => (
          <Card key={order.id} className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{order.customerName}</span>
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
                  <Badge className={`${getStatusBadgeStyle(order.status)} px-3 py-1`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="divide-y">
                  {order.items.map((item, index) => {
                    const menuItem = menuItems?.find(m => m.id === item.menuItemId);
                    return (
                      <div key={index} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {menuItem?.name || `Item #${item.menuItemId}`} × {item.quantity}
                            </p>
                            <div className="mt-1 space-y-1">
                              {Object.entries(item.customizations).map(([category, choices]) => (
                                <div key={category} className="text-sm text-muted-foreground">
                                  {category}: {choices.join(", ")}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-right font-medium">
                            <IndianRupee className="h-4 w-4 inline-block" />
                            {menuItem ? Math.round(menuItem.price * item.quantity).toLocaleString('en-IN') : 0}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.cookingInstructions && (
                  <div className="text-sm bg-muted/50 p-4 rounded-lg">
                    <span className="font-medium block mb-1">Special Instructions:</span>
                    <p className="text-muted-foreground">{order.cookingInstructions}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Table #{order.tableNumber}</span>
                    <span>
                      Payment: {order.paymentMethod?.toUpperCase() || 'Not specified'}
                      {' '}({order.paymentStatus})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Amount</span>
                    <span className="text-xl font-bold">
                      <IndianRupee className="h-5 w-5 inline-block" />
                      {Math.round(order.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!orders || orders.length === 0) && (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground mb-4">No orders found</p>
            <Button onClick={() => navigate("/")} variant="default">
              Place Your First Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}