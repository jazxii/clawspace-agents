import Link from "next/link";

/**
 * Breadcrumb — ACCESSIBILITY-BRIEF-V2 §7.3.
 * <nav aria-label="Breadcrumb"> with <ol>, no DOM separators (CSS ::before).
 * Tail uses aria-current="page".
 */
export interface BreadcrumbItem {
  label: string;
  href?: string; // omitted on the tail
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol>
        {items.map((it, i) => {
          const isTail = i === items.length - 1;
          return (
            <li key={`${i}-${it.label}`}>
              {isTail || !it.href ? (
                <span aria-current={isTail ? "page" : undefined}>{it.label}</span>
              ) : (
                <Link href={it.href}>{it.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
