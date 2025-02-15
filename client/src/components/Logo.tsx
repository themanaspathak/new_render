import { Bell } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative">
        <Bell className="h-12 w-12 text-primary" />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary/20 rounded-full blur-sm" />
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
        Zinglebell
      </h1>
    </div>
  );
}
