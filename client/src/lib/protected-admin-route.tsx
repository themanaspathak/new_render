import { Route } from "wouter";

interface ProtectedAdminRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedAdminRoute({ path, component: Component }: ProtectedAdminRouteProps) {
  return <Route path={path} component={Component} />;
}