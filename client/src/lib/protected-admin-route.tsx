import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedAdminRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedAdminRoute({ path, component: Component }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // If user is not logged in or is not an admin, redirect to admin login
  if (!user?.isAdmin) {
    setLocation("/admin/login");
    return null;
  }

  return <Route path={path} component={Component} />;
}