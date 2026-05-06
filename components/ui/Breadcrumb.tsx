import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="breadcrumb">
      {items.map((item, i) => (
        <>
          {i > 0 && <span className="breadcrumb__sep">›</span>}
          {item.href ? (
            <Link href={item.href} className="breadcrumb__item">
              {item.label}
            </Link>
          ) : (
            <span className={`breadcrumb__item${i === items.length - 1 ? " current" : ""}` }>
              {item.label}
            </span>
          )}
        </>
      ))}
    </div>
  );
}
