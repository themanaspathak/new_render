import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedAdminRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedAdminRoute({ path, component: Component }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated or not admin, redirect to login
  if (!isAuthenticated || !user?.isAdmin) {
    return <Redirect to="/admin/login" />;
  }

  return <Route path={path} component={Component} />;
}