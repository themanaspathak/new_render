import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MenuItem, Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Kitchen() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  };

  const handleStatusUpdate = async (orderId: number, newStatus: 'completed' | 'cancelled') => {
    try {
      await apiRequest('/api/orders/' + orderId, {
        method: 'PATCH',
        body: { status: newStatus },
      });

      // Invalidate and refetch orders
      await queryClient.invalidateQueries({ queryKey: ['/api/orders'] });

      toast({
        title: `Order ${newStatus}`,
        description: `Order #${orderId} has been marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
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
            <div className="space-y-4">
              {orders?.map((order) => (
                <Card key={order.id} className="mb-4 border-2">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex w-full justify-between items-center">
                        <Badge variant="default" className="text-lg px-3 py-1 bg-primary/90 hover:bg-primary">
                          Order #{order.id}
                        </Badge>
                        <Badge 
                          variant={
                            order.status === "completed" 
                              ? "default" 
                              : order.status === "pending" 
                              ? "destructive" 
                              : "secondary"
                          }
                          className={`text-base px-3 py-1 ${
                            order.status === "completed" ? "bg-green-600 hover:bg-green-700 text-white" : ""
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <CardTitle className="text-4xl font-bold">
                        Table #{order.tableNumber}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-4">
                    <div className="space-y-4">
                      {order.items.map((item, index) => {
                        const menuItem = menuItems?.find(m => m.id === item.menuItemId);
                        return (
                          <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium">{menuItem?.name} × {item.quantity}</p>
                              {/* Customizations */}
                              <div className="text-sm text-gray-600 mt-1">
                                {Object.entries(item.customizations).map(([category, choices]) => (
                                  <div key={category} className="ml-4">
                                    • {category}: {choices.join(", ")}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Cooking Instructions */}
                      {order.cookingInstructions && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Pencil className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">Special Instructions:</span>
                          </div>
                          <p className="text-gray-600">{order.cookingInstructions}</p>
                        </div>
                      )}
                    </div>
                    {order.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        <Button 
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')} 
                          variant="destructive"
                          size="lg"
                          className="w-full"
                        >
                          Can't serve
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(order.id, 'completed')} 
                          variant="default"
                          size="lg"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Served
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!orders || orders.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No active orders at the moment
                </div>
              )}
            </div>
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