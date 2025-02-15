import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  Table,
  ClipboardList,
  CreditCard,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin",
  },
  {
    icon: MenuIcon,
    label: "Menu Management",
    href: "/admin/menu",
  },
  {
    icon: Table,
    label: "Tables",
    href: "/admin/tables",
  },
  {
    icon: ClipboardList,
    label: "Orders",
    href: "/admin/orders",
  },
  {
    icon: CreditCard,
    label: "Payments & Reports",
    href: "/admin/reports",
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Restaurant Admin</h1>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors",
                        location === item.href && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}>
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
