import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function MyOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my-orders"],
  });

  if (isLoading) {
    return <div className="p-4">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-background/95 backdrop-blur py-4 -mx-4 px-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">My Orders</h1>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order #{order.id}</CardTitle>
                <span className="text-sm text-gray-500">
                  {format(new Date(order.createdAt), "PPp")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {/* We need to fetch menu item details */}
                      </p>
                      <div className="text-sm text-gray-600">
                        {Object.entries(item.customizations).map(([category, choices]) => (
                          <div key={category}>
                            {category}: {choices.join(", ")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {order.cookingInstructions && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Special Instructions:</p>
                    <p>{order.cookingInstructions}</p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">₹{Math.round(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
