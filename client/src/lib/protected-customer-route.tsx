import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export function ProtectedCustomerRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Get current route to check if user is in kitchen
  const isKitchenRoute = window.location.pathname.includes('/kitchen');
  
  if (isKitchenRoute) {
    return (
      <Route path={path}>
        <Redirect to="/kitchen" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
