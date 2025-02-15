import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OrderPayment() {
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Group orders by payment status
  const paidOrders = orders?.filter(order => order.paymentStatus === "paid") || [];
  const pendingPaymentOrders = orders?.filter(order => order.paymentStatus === "pending") || [];
  const failedPaymentOrders = orders?.filter(order => order.paymentStatus === "failed") || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Order Payments</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paid Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Paid Orders</span>
                <Badge className="bg-green-600">
                  {paidOrders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {paidOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Table #{order.tableNumber}
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
                <Badge className="bg-yellow-600">
                  {pendingPaymentOrders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {pendingPaymentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Table #{order.tableNumber}
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
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {failedPaymentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Table #{order.tableNumber}
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
    </AdminLayout>
  );
}
