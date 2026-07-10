# Styling system

The application uses Tailwind CSS v4 utilities backed by semantic CSS variables in
`app/globals.css`. Keep global CSS limited to design tokens, element defaults, and
small patterns shared by unrelated features.

## Token strategy

- Use semantic colors (`background`, `foreground`, `card`, `muted`, `success`,
  `warning`, `favorite`, `spicy`, and `destructive`) instead of palette names.
- Use the shared radius scale (`rounded-sm` through `rounded-4xl`) and surface
  shadows (`shadow-surface` and `shadow-raised`).
- Use named layout values such as `h-app-header`, `max-w-content`,
  `max-w-filter-badge`, and `z-header` when a value is part of the app shell.
- Prefer Tailwind's standard spacing and typography scales. Add a token only when
  the same non-standard value represents a recurring design decision.

## Class conventions

Order utilities by purpose: layout, sizing, spacing, typography, color, border,
effects, interaction, then responsive/state variants. Use `cn()` when classes are
conditional or supplied by callers; avoid interpolated class strings where a
conditional `cn()` expression is clearer.

Build repeated UI through components and variants first. Add a global component
class only when the same pattern is used by unrelated components and extracting a
React component would make the API less clear.

## Adding or changing tokens

1. Define theme-neutral values in `:root` and their dark equivalents in `.dark`.
2. Expose the value in `@theme inline` using a semantic Tailwind name.
3. Consume only the generated utility in components; do not reference the raw CSS
   variable unless a third-party API requires a CSS color string.
4. Check both themes and the smallest supported viewport before merging.
