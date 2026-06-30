import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

export function NavigationMenu() {
  return (
    <div className="hidden md:block">
      <nav className="flex space-x-4">
        {/* Dropdown Container */}
        <div className="group relative">
          {/* Trigger Button */}
          <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-accent-foreground">
            Каталог
            <svg
              className="h-4 w-4 transition-transform group-hover:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu Content */}
          <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
            <ul className="grid w-56 gap-1 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
              <li>
                <Link
                  href={frontendUrls.public.recipes}
                  className="flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Вся продукція
                </Link>
              </li>
              {FILTER_CONFIGS.publicRecipes.category.options.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/recipes?category=${category.value}`}
                    className="flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
