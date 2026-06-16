export interface ILink {
  href: string;
  label: string;
}

export const LINKS: ILink[] = [
  { href: "/ingredients", label: "Ingredients" },
  { href: "/recipes", label: "Recipes" },
  { href: "/ingredients/my-list", label: "My list" },
];
