import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuItem, Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, ChefHat } from "lucide-react";

export default function Kitchen() {
  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const [availabilityMap, setAvailabilityMap] = useState<Record<number, boolean>>({});

  const handleAvailabilityToggle = async (itemId: number) => {
    setAvailabilityMap(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    // TODO: Update availability in backend
  };

  if (menuLoading || ordersLoading) {
    return <div className="p-4">Loading kitchen dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-8">
        <ChefHat className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>
          <ScrollArea className="h-[70vh]">
            {orders?.map((order) => (
              <Card key={order.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Badge className="text-sm px-2 py-1 bg-primary">Order #{order.id}</Badge>
                      <CardTitle>Table #{order.tableNumber}</CardTitle>
                    </div>
                    <Badge variant={order.status === "pending" ? "destructive" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => {
                      const menuItem = menuItems?.find(m => m.id === item.menuItemId);
                      return (
                        <div key={index} className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{menuItem?.name} × {item.quantity}</p>
                            {/* Customizations */}
                            <div className="text-sm text-gray-600">
                              {Object.entries(item.customizations).map(([category, choices]) => (
                                <div key={category}>
                                  {category}: {choices.join(", ")}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Cooking Instructions */}
                    {order.cookingInstructions && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Pencil className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Special Instructions:</span>
                        </div>
                        <p className="text-gray-600">{order.cookingInstructions}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      onClick={() => {/* TODO: Update order status */}} 
                      variant={order.status === "pending" ? "default" : "outline"}
                    >
                      {order.status === "pending" ? "Start Preparing" : "Mark as Ready"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>

        {/* Menu Management Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Menu Availability</h2>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4">
              {menuItems?.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.isVegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                    </div>
                    <Switch
                      checked={availabilityMap[item.id] ?? true}
                      onCheckedChange={() => handleAvailabilityToggle(item.id)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}