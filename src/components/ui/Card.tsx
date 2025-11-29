import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "border border-gray-200 bg-[#F7F9FA] shadow-sm",
        className
      )}
      style={{
        borderRadius: '0 0 20px 20px',
        clipPath: 'polygon(0 12.5px, 12.5px 0, calc(100% - 12.5px) 0, 100% 12.5px, 100% 100%, 0 100%)'
      }}
    >
      {children}
    </div>
  );
}
