import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Select({ placeholder, options, value, onChange, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* TRIGGER */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-10 w-full rounded-md border border-gray-300 px-3 text-sm flex items-center justify-between bg-white",
          "text-gray-700",
          "hover:bg-gray-50",
          "focus:outline-none focus:ring-2 focus:ring-[#006341]/30 focus:border-[#006341]"
        )}
      >
        <span className={cn(!value && "text-gray-400")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* MENU */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-md border bg-white shadow-lg z-50 max-h-52 overflow-auto animate-in fade-in"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                value === opt.value && "bg-gray-100 font-medium"
              )}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
