import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MenuItem, Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, ChefHat, History, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import cn from 'classnames';

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
  const [updatingOrders, setUpdatingOrders] = useState<Record<number, string>>({});

  const handleAvailabilityToggle = async (itemId: number) => {
    const menuItem = menuItems?.find(item => item.id === itemId);
    const newStatus = !menuItem?.isAvailable;

    try {
      await apiRequest(
        `/api/menu/${itemId}/availability`,
        'POST',
        { isAvailable: newStatus }
      );

      await queryClient.invalidateQueries({ queryKey: ['/api/menu'] });

      toast({
        title: `Menu Item ${newStatus ? 'Available' : 'Unavailable'}`,
        description: `${menuItem?.name} is now ${newStatus ? 'available' : 'unavailable'} for ordering`,
        variant: newStatus ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Failed to update menu item availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update menu item availability',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: 'completed' | 'cancelled') => {
    try {
      setUpdatingOrders(prev => ({
        ...prev,
        [orderId]: newStatus
      }));

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/orders'] });

      toast({
        title: `Order ${newStatus}`,
        description: `Order #${orderId} has been marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      setUpdatingOrders(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });

      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getOrderStatus = (order: Order) => {
    return updatingOrders[order.id] || order.status;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "pending":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case "cancelled":
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const activeOrders = orders?.filter(order => getOrderStatus(order) === 'pending') || [];
  const completedOrders = orders?.filter(order =>
    ['completed', 'cancelled'].includes(getOrderStatus(order))
  ) || [];

  if (menuLoading || ordersLoading) {
    return <div className="p-4">Loading kitchen dashboard...</div>;
  }

  const OrderCard = ({ order }: { order: Order }) => {
    const currentStatus = getOrderStatus(order);
    const orderDate = new Date(order.createdAt);
    return (
      <Card key={order.id} className="mb-4 border-2">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full justify-between items-center">
              <Badge variant="default" className="text-lg px-3 py-1 bg-primary/90 hover:bg-primary">
                Order #{order.id}
              </Badge>
              <Badge
                className={`text-base px-3 py-1 ${getStatusBadgeStyle(currentStatus)}`}
              >
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </Badge>
            </div>
            <div className="flex flex-col items-center gap-1 w-full">
              <CardTitle className="text-4xl font-bold">
                Table #{order.tableNumber}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span title={format(orderDate, 'PPpp')}>
                  {format(orderDate, 'hh:mm aa')} - {format(orderDate, 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
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
          {currentStatus === "pending" && (
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
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-8">
        <ChefHat className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold">Active Orders</h2>
            <Badge variant="secondary" className="text-sm">
              {activeOrders.length}
            </Badge>
          </div>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 pr-4">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {activeOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active orders at the moment
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold">Completed Orders</h2>
            <Badge variant="secondary" className="text-sm">
              {completedOrders.length}
            </Badge>
          </div>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 pr-4">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {completedOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No completed orders
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Menu Availability</h2>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 pr-4">
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
                      checked={item.isAvailable ?? true}
                      onCheckedChange={() => handleAvailabilityToggle(item.id)}
                      className={cn(
                        "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500",
                        "focus-visible:ring-green-500"
                      )}
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