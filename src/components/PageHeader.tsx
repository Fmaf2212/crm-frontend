import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function PageHeader({
  title,
  breadcrumb
}: {
  title: string;
  breadcrumb: BreadcrumbItem[];
}) {
  return (
    <div className="mb-4">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground mb-1">
        {breadcrumb.map((item, index) => (
          <span key={index} className="flex items-center">
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}

            {index < breadcrumb.length - 1 && (
              <ChevronRight className="mx-2 w-4 h-4" />
            )}
          </span>
        ))}
      </nav>

      {/* Título */}
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
}
