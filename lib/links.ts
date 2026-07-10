import { frontendUrls } from "./urls";

export interface ILink {
  href: string;
  label: string;
}

export const MAIN_LINKS: ILink[] = [
  { href: frontendUrls.ingredients.index, label: "Ingredients" },
  { href: frontendUrls.recipes.index, label: "Recipes" },
  { href: frontendUrls.stuff.index, label: "Stuff" },
];

// export const ADMIN_LINKS: ILink[] = [
//   { href: frontendUrls.admin.wishlists, label: "Wishlists" },
//   { href: frontendUrls.admin.admin, label: "Admin" },
// ];
export const PUBLIC_LINKS: ILink[] = [
  { href: frontendUrls.public.recipes, label: "Продукція" },
  { href: frontendUrls.public.wishlist, label: "Обране" },
  { href: frontendUrls.public.orders, label: "Замовлення" },
];
