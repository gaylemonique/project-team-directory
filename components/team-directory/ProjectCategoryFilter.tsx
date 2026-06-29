import type { ProjectCategory } from "@/types/team-directory";
import { FILTER_ALL, type CategoryFilterValue } from "@/types/team-directory";

type ProjectCategoryFilterProps = {
  categories: ProjectCategory[];
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
};

export function ProjectCategoryFilter({
  categories,
  value,
  onChange,
}: ProjectCategoryFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="category-filter"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
      >
        Filter by project category
      </label>
      <select
        id="category-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 sm:max-w-md"
      >
        <option value={FILTER_ALL}>All</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
