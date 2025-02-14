import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { JSX } from "react";

type ToastType = "success" | "error" | "warning";

export function showToast(message: string, type: ToastType = "success"): void {
  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
  }[type];

  const variantColors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
  }[type];

  const variants = {
    success: "default",
    error: "destructive",
    warning: "secondary",
  }[type];

  toast({
    variant: variants,
    description: (
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${variantColors}`} />
        <span className="text-base font-medium">{message}</span>
      </div>
    ) as JSX.Element,
    duration: 3000,
  });
}