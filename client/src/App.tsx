import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Auth from "@/pages/Auth";
import Checkout from "@/pages/Checkout";
import Kitchen from "@/pages/Kitchen";
import OrderConfirmed from "@/pages/OrderConfirmed";
import MyOrders from "@/pages/MyOrders";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Menu} />
      <Route path="/cart" component={Cart} />
      <Route path="/auth" component={Auth} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/kitchen" component={Kitchen} />
      <Route path="/order-confirmed" component={OrderConfirmed} />
      <Route path="/my-orders" component={MyOrders} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;