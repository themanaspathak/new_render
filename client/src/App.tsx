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
import Kitchen from "@/pages/Kitchen";
import MenuManagement from "@/pages/admin/MenuManagement";
import OrderPayment from "@/pages/admin/OrderPayment";
import OrderConfirmed from "@/pages/OrderConfirmed";
import MobileVerification from "@/pages/MobileVerification";
import OrderHistory from "@/pages/OrderHistory";
import { CartProvider } from "@/contexts/CartContext";
import NavBar from "@/components/NavBar";
import { ProtectedAdminRoute } from "@/lib/protected-admin-route";
import { ProtectedCustomerRoute } from "@/lib/protected-customer-route";

function Router() {
  return (
    <>
      <Switch>
        {/* Customer Routes */}
        <Route path="/" component={Menu} />
        <ProtectedCustomerRoute path="/cart" component={Cart} />
        <ProtectedCustomerRoute path="/checkout" component={Checkout} />
        <Route path="/mobile-verification" component={MobileVerification} />
        <Route path="/order-confirmed" component={OrderConfirmed} />
        <ProtectedCustomerRoute path="/orders/:mobile" component={OrderHistory} />

        {/* Kitchen Route */}
        <Route path="/kitchen" component={Kitchen} />

        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <ProtectedAdminRoute path="/admin" component={AdminDashboard} />
        <ProtectedAdminRoute path="/admin/menu" component={MenuManagement} />
        <ProtectedAdminRoute path="/admin/order-payment" component={OrderPayment} />

        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
      <NavBar />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;