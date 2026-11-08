import type { Category } from "@/types";

/** Pestañas fijas arriba que saltan a cada categoría. */
export function CategoryTabs({ categories }: { categories: readonly Category[] }) {
  return (
    <nav className="scrollbar-subtle sticky top-2 z-30 -mx-3 flex gap-2 overflow-x-auto whitespace-nowrap border-y border-line bg-surface/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:gap-3">
      {categories.map((category) => (
        <a
          key={category.id}
          href={`#category-${category.id}`}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-card border border-line bg-panel px-4 py-2.5 text-center text-sm font-semibold text-text transition hover:border-brand/40 hover:bg-brand/5"
        >
          {category.name}
        </a>
      ))}
    </nav>
  );
}
