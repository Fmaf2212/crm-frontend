import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "h-10 px-3 rounded-md text-sm font-medium transition-colors",
        variant === "default" &&
          "bg-[#006341] text-white hover:bg-[#004f32]",
        variant === "outline" &&
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
}
