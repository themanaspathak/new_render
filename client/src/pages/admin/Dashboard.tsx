import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@shared/schema";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingBag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  // Fetch orders
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Calculate statistics
  const activeOrders = orders?.filter(order => order.status === "pending") || [];
  const completedOrders = orders?.filter(order => order.status === "completed") || [];

  const todayOrders = orders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }) || [];

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

  const yesterdayOrders = orders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return orderDate.toDateString() === yesterday.toDateString();
  }) || [];

  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueChange = yesterdayRevenue === 0 ? 0 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

  const stats = [
    {
      title: "Today's Revenue",
      value: `₹${Math.round(todayRevenue)}`,
      change: revenueChange,
      icon: DollarSign,
    },
    {
      title: "Active Orders",
      value: activeOrders.length.toString(),
      change: 0,
      icon: ShoppingBag,
    },
    {
      title: "Today's Orders",
      value: todayOrders.length.toString(),
      change: yesterdayOrders.length === 0 ? 0 : ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100,
      icon: Clock,
    },
    {
      title: "Customers Served",
      value: completedOrders.length.toString(),
      change: 0,
      icon: Users,
    },
  ];

  // Group orders by payment status
  const paidOrders = orders?.filter(order => order.paymentStatus === "paid") || [];
  const pendingPaymentOrders = orders?.filter(order => order.paymentStatus === "pending") || [];
  const failedPaymentOrders = orders?.filter(order => order.paymentStatus === "failed") || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change >= 0;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change !== 0 && (
                    <p className={cn(
                      "text-xs flex items-center",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span>{Math.abs(Math.round(stat.change))}% from yesterday</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment Status Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Payment Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Paid Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Paid Orders</span>
                  <Badge variant="success" className="bg-green-600">
                    {paidOrders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {paidOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold">₹{Math.round(order.total)}</p>
                      </div>
                    ))}
                    {paidOrders.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No paid orders
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pending Payment Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pending Payments</span>
                  <Badge variant="warning" className="bg-yellow-600">
                    {pendingPaymentOrders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {pendingPaymentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold">₹{Math.round(order.total)}</p>
                      </div>
                    ))}
                    {pendingPaymentOrders.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No pending payments
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Failed Payment Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Failed Payments</span>
                  <Badge variant="destructive">
                    {failedPaymentOrders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {failedPaymentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold">₹{Math.round(order.total)}</p>
                      </div>
                    ))}
                    {failedPaymentOrders.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No failed payments
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Orders Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Orders</h2>
          <div className="grid gap-4">
            {activeOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Table {order.tableNumber}
                      </p>
                      <div className="mt-2">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-sm">
                            {item.quantity}x {item.menuItemId}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{Math.round(order.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activeOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No active orders at the moment
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}