import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MenuItem, Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChefHat, Clock, Calendar, FilterX, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Kitchen() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
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

      await apiRequest(`/api/orders/${orderId}/status`, 'POST', { status: newStatus });
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

      // Show more specific error message
      toast({
        title: 'Cannot Update Order',
        description: error instanceof Error ? error.message : 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getOrderStatus = (order: Order) => {
    return updatingOrders[order.id] || order.status;
  };

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

  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  console.log("Fetched orders:", orders); // Debug log

  const filteredOrders = orders?.filter(order => {
    if (!dateRange.from || !dateRange.to) return true;
    const orderDate = new Date(order.createdAt);
    return orderDate >= dateRange.from && orderDate <= dateRange.to;
  }) || [];

  const activeOrders = filteredOrders.filter(order => order.status === 'in progress') || [];
  const completedOrders = filteredOrders.filter(order => order.status === 'completed') || [];
  const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled') || [];

  console.log("Active orders:", activeOrders); // Debug log

  if (menuLoading || ordersLoading) {
    return <div className="p-4">Loading kitchen dashboard...</div>;
  }

  const OrderCard = ({ order }: { order: Order }) => {
    const currentStatus = getOrderStatus(order);
    const orderDate = new Date(order.createdAt);
    const isActionable = currentStatus === "in progress";

    return (
      <Card key={order.id} className="mb-3 border shadow-sm">
        <CardHeader className="bg-muted/50 p-3 sm:p-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Badge variant="default" className="text-sm sm:text-base px-2 py-1 bg-primary/90 hover:bg-primary">
                Order #{order.id}
              </Badge>
              <Badge
                className={cn(
                  "text-sm sm:text-base px-2 py-1",
                  getStatusBadgeStyle(currentStatus)
                )}
              >
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </Badge>
            </div>
            <div className="flex flex-col items-start gap-1">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                Table #{order.tableNumber}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground">
                  {order.customerName}
                </div>
                <div>+91 {order.mobileNumber}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs" title={format(orderDate, 'PPpp')}>
                    {format(orderDate, 'hh:mm aa')} - {format(orderDate, 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {order.items.map((item, index) => {
              const menuItem = menuItems?.find(m => m.id === item.menuItemId);
              return (
                <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium text-sm sm:text-base">{menuItem?.name} × {item.quantity}</p>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {Object.entries(item.customizations).map(([category, choices]) => (
                        <div key={category} className="ml-3">
                          • {category}: {choices.join(", ")}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {order.cookingInstructions && (
              <div className="mt-3 p-2 sm:p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <span className="font-medium text-sm">Special Instructions:</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{order.cookingInstructions}</p>
              </div>
            )}
          </div>
          {isActionable && (
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                variant="destructive"
                size="sm"
                className="w-full text-xs sm:text-sm py-2"
              >
                Can't serve
              </Button>
              <Button
                onClick={() => handleStatusUpdate(order.id, 'completed')}
                variant="default"
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-2"
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 sm:h-8 sm:w-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Kitchen</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium">Filter:</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={dateRange.from ? "default" : "outline"}
                className={cn(
                  "h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  "Select dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={1}
                className="p-2"
              />
            </PopoverContent>
          </Popover>

          {(dateRange.from || dateRange.to) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDateRange({ from: undefined, to: undefined })}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
              title="Clear filter"
            >
              <FilterX className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-2xl font-semibold">Active Orders</h2>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {activeOrders.length}
            </Badge>
          </div>
          <ScrollArea className="h-[60vh] sm:h-[70vh]">
            <div className="space-y-3 pr-2 sm:pr-4">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {activeOrders.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  No active orders at the moment
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-2xl font-semibold">Completed</h2>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {completedOrders.length}
            </Badge>
          </div>
          <ScrollArea className="h-[60vh] sm:h-[70vh]">
            <div className="space-y-3 pr-2 sm:pr-4">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {completedOrders.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  No completed orders
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-2xl font-semibold">Cancelled</h2>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {cancelledOrders.length}
            </Badge>
          </div>
          <ScrollArea className="h-[60vh] sm:h-[70vh]">
            <div className="space-y-3 pr-2 sm:pr-4">
              {cancelledOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {cancelledOrders.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  No cancelled orders
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}