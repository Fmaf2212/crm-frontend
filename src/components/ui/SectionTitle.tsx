interface SectionTitleProps {
  icon: React.ElementType; // cualquier icono (Lucide)
  children: React.ReactNode;
}

export function SectionTitle({ icon: Icon, children }: SectionTitleProps) {
  return (
    <div className="p-6 border-b border-gray-300 flex items-center gap-2">
      <Icon className="w-5 h-5 text-[#006341]" />
      <span className="text-[#006341] font-medium">
        {children}
      </span>
    </div>
  );
}
