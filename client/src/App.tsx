import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Kitchen from "@/pages/Kitchen";
import OrderConfirmed from "@/pages/OrderConfirmed";
import EmailVerification from "@/pages/EmailVerification";
import OrderHistory from "@/pages/OrderHistory";
import AdminLogin from "@/pages/admin/login";
import { CartProvider } from "@/contexts/CartContext";
import NavBar from "@/components/NavBar";

function Router() {
  return (
    <>
      <NavBar />
      <Switch>
        <Route path="/" component={Menu} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/kitchen" component={Kitchen} />
        <Route path="/email-verification" component={EmailVerification} />
        <Route path="/order-confirmed" component={OrderConfirmed} />
        <Route path="/orders/:email" component={OrderHistory} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router />
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;