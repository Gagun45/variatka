import { frontendUrls } from "./urls";

export interface ILink {
  href: string;
  label: string;
}

export const PUBLIC_LINKS: ILink[] = [
  { href: frontendUrls.ingredients.index, label: "Ingredients" },
  { href: frontendUrls.recipes.index, label: "Recipes" },
];
