import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/Dashboard";
import Kitchen from "@/pages/admin/Kitchen";
import MenuManagement from "@/pages/admin/MenuManagement";
import OrderConfirmed from "@/pages/OrderConfirmed";
import EmailVerification from "@/pages/EmailVerification";
import OrderHistory from "@/pages/OrderHistory";
import { CartProvider } from "@/contexts/CartContext";
import NavBar from "@/components/NavBar";
import { ProtectedAdminRoute } from "@/lib/protected-admin-route";

function Router() {
  return (
    <>
      <NavBar />
      <Switch>
        {/* Customer Routes */}
        <Route path="/" component={Menu} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/email-verification" component={EmailVerification} />
        <Route path="/order-confirmed" component={OrderConfirmed} />
        <Route path="/orders/:email" component={OrderHistory} />

        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <ProtectedAdminRoute path="/admin" component={AdminDashboard} />
        <ProtectedAdminRoute path="/admin/kitchen" component={Kitchen} />
        <ProtectedAdminRoute path="/admin/menu" component={MenuManagement} />

        {/* 404 Route */}
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