import type { ProjectCategory } from "@/types/team-directory";
import { FILTER_ALL, type CategoryFilterValue } from "@/types/team-directory";

type ProjectCategoryFilterProps = {
  categories: ProjectCategory[];
  value: CategoryFilterValue;
  memberCountByCategory: Record<string, number>;
  totalCount: number;
  filteredCount: number;
  onChange: (value: CategoryFilterValue) => void;
};

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "interactive inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium",
        active ? "chip-active" : "chip",
      ].join(" ")}
    >
      <span>{label}</span>
      <span
        className={[
          "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
          active
            ? "bg-accent/15 text-accent"
            : "bg-surface-muted text-muted",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

export function ProjectCategoryFilter({
  categories,
  value,
  memberCountByCategory,
  totalCount,
  filteredCount,
  onChange,
}: ProjectCategoryFilterProps) {
  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Filter by project category
          </p>
          <p className="mt-1 text-sm text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">{filteredCount}</span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            {totalCount === 1 ? "profile" : "profiles"}
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Project category filters"
        className="flex flex-wrap gap-2"
      >
        <FilterChip
          active={value === FILTER_ALL}
          label="All"
          count={totalCount}
          onClick={() => onChange(FILTER_ALL)}
        />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            active={value === category.id}
            label={category.name}
            count={memberCountByCategory[category.id] ?? 0}
            onClick={() => onChange(category.id)}
          />
        ))}
      </div>
    </div>
  );
}
