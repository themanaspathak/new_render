import { Bell } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Bell className="h-5 w-5 text-primary" />
        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-primary/20 rounded-full blur-sm" />
      </div>
      <span className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
        Zinglebell
      </span>
    </div>
  );
}