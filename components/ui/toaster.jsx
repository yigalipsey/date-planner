"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={cn("rounded-lg p-4 shadow-lg", {
            "bg-green-500 text-white": variant === "default",
            "bg-red-500 text-white": variant === "destructive",
          })}
        >
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      ))}
    </div>
  );
}
