import { Bell } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative">
        <Bell className="h-16 w-16 text-primary animate-pulse" />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-primary/20 rounded-full blur-sm" />
      </div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
        Zinglebell
      </h1>
    </div>
  );
}