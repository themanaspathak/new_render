1:import { useState } from "react";
2:import { useQuery } from "@tanstack/react-query";
3:import { MenuItem, Order } from "@shared/schema";
4:import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
5:import { Button } from "@/components/ui/button";
6:import { Switch } from "@/components/ui/switch";
7:import { Badge } from "@/components/ui/badge";
8:import { ScrollArea } from "@/components/ui/scroll-area";
9:import { Pencil, ChefHat } from "lucide-react";
10:
11:export default function Kitchen() {
12:  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
13:    queryKey: ["/api/menu"],
14:  });
15:
16:  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
17:    queryKey: ["/api/orders"],
18:  });
19:
20:  const [availabilityMap, setAvailabilityMap] = useState<Record<number, boolean>>({});
21:
22:  const handleAvailabilityToggle = async (itemId: number) => {
23:    setAvailabilityMap(prev => ({
24:      ...prev,
25:      [itemId]: !prev[itemId]
26:    }));
27:  };
28:
29:  if (menuLoading || ordersLoading) {
30:    return <div className="p-4">Loading kitchen dashboard...</div>;
31:  }
32:
33:  return (
34:    <div className="container mx-auto px-4 py-6">
35:      <div className="flex items-center gap-2 mb-8">
36:        <ChefHat className="h-8 w-8" />
37:        <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
38:      </div>
39:
40:      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
41:        {/* Active Orders Section */}
42:        <div className="space-y-4">
43:          <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>
44:          <ScrollArea className="h-[70vh]">
45:            <div className="space-y-4">
46:              {orders?.map((order) => (
47:                <Card key={order.id} className="mb-4 border-2">
48:                  <CardHeader className="bg-muted/50">
49:                    <div className="flex flex-col items-center gap-4">
50:                      <div className="flex w-full justify-between items-center">
51:                        <Badge variant="default" className="text-lg px-3 py-1 bg-primary/90 hover:bg-primary">
52:                          Order #{order.id}
53:                        </Badge>
54:                        <Badge 
55:                          variant={order.status === "pending" ? "outline" : "secondary"}
56:                          className={`text-base px-3 py-1 ${order.status === "pending" ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-200" : ""}`}
57:                        >
58:                          {order.status}
59:                        </Badge>
60:                      </div>
61:                      <CardTitle className="text-4xl font-bold">
62:                        Table #{order.tableNumber}
63:                      </CardTitle>
64:                    </div>
65:                  </CardHeader>
66:                  <CardContent className="mt-4">
67:                    <div className="space-y-4">
68:                      {order.items.map((item, index) => {
69:                        const menuItem = menuItems?.find(m => m.id === item.menuItemId);
70:                        return (
71:                          <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
72:                            <div>
73:                              <p className="font-medium">{menuItem?.name} × {item.quantity}</p>
74:                              {/* Customizations */}
75:                              <div className="text-sm text-gray-600 mt-1">
76:                                {Object.entries(item.customizations).map(([category, choices]) => (
77:                                  <div key={category} className="ml-4">
78:                                    • {category}: {choices.join(", ")}
79:                                  </div>
80:                                ))}
81:                              </div>
82:                            </div>
83:                          </div>
84:                        );
85:                      })}
86:                      {/* Cooking Instructions */}
87:                      {order.cookingInstructions && (
88:                        <div className="mt-4 p-3 bg-muted/50 rounded-md">
89:                          <div className="flex items-center gap-2 mb-2">
90:                            <Pencil className="h-4 w-4 text-gray-600" />
91:                            <span className="font-medium">Special Instructions:</span>
92:                          </div>
93:                          <p className="text-gray-600">{order.cookingInstructions}</p>
94:                        </div>
95:                      )}
96:                    </div>
97:                    <div className="mt-4 flex gap-2">
98:                      {order.status === "pending" ? (
99:                        <>
100:                          <Button 
101:                            onClick={() => {/* TODO: Update order status to cancelled */}} 
102:                            variant="destructive"
103:                            size="lg"
104:                            className="w-full"
105:                          >
106:                            Can't Serve
107:                          </Button>
108:                          <Button 
109:                            onClick={() => {/* TODO: Update order status to served */}} 
110:                            variant="default"
111:                            size="lg"
112:                            className="w-full bg-green-600 hover:bg-green-700"
113:                          >
114:                            Served
115:                          </Button>
116:                        </>
117:                      ) : (
118:                        <Button 
119:                          variant="outline"
120:                          size="lg"
121:                          className="w-full"
122:                          disabled
123:                        >
124:                          {order.status}
125:                        </Button>
126:                      )}
127:                    </div>
128:                  </CardContent>
129:                </Card>
130:              ))}
131:              {(!orders || orders.length === 0) && (
132:                <div className="text-center py-8 text-gray-500">
133:                  No active orders at the moment
134:                </div>
135:              )}
136:            </div>
137:          </ScrollArea>
138:        </div>
139:
140:        {/* Menu Management Section */}
141:        <div>
142:          <h2 className="text-2xl font-semibold mb-4">Menu Availability</h2>
143:          <ScrollArea className="h-[70vh]">
144:            <div className="space-y-4">
145:              {menuItems?.map((item) => (
146:                <Card key={item.id}>
147:                  <CardContent className="flex items-center justify-between p-4">
148:                    <div className="flex items-center gap-3">
149:                      <div className={`w-3 h-3 rounded-full ${item.isVegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
150:                      <div>
151:                        <p className="font-medium">{item.name}</p>
152:                        <p className="text-sm text-gray-600">₹{item.price}</p>
153:                      </div>
154:                    </div>
155:                    <Switch
156:                      checked={availabilityMap[item.id] ?? true}
157:                      onCheckedChange={() => handleAvailabilityToggle(item.id)}
158:                    />
159:                  </CardContent>
160:                </Card>
161:              ))}
162:            </div>
163:          </ScrollArea>
164:        </div>
165:      </div>
166:    </div>
167:  );
168:}