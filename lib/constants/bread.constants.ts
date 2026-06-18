import { IBreadcrumbItem } from "../types";
import { frontendUrls } from "../urls";

export const BREADCRUMB_ITEMS = {
  ingredients: {
    view: (id: number): IBreadcrumbItem[] => [
      {
        label: "Ingredients",
        href: frontendUrls.ingredients.index,
      },
      {
        label: `${id}`,
        href: frontendUrls.ingredients.view(id),
      },
    ],
    edit: (id: number): IBreadcrumbItem[] => [
      ...BREADCRUMB_ITEMS.ingredients.view(id),
      {
        label: "Edit",
        href: frontendUrls.ingredients.edit(id),
      },
    ],
  },
  recipes: {
    view: (id: number): IBreadcrumbItem[] => [
      {
        label: "Recipes",
        href: frontendUrls.recipes.index,
      },
      {
        label: `${id}`,
        href: frontendUrls.recipes.view(id),
      },
    ],
    edit: (id: number): IBreadcrumbItem[] => [
      ...BREADCRUMB_ITEMS.recipes.view(id),
      {
        label: "Edit",
        href: frontendUrls.recipes.edit(id),
      },
    ],
  },
  stuff: {
    view: (id: number): IBreadcrumbItem[] => [
      {
        label: "Stuff",
        href: frontendUrls.stuff.index,
      },
      {
        label: `${id}`,
        href: frontendUrls.stuff.view(id),
      },
    ],
    edit: (id: number): IBreadcrumbItem[] => [
      ...BREADCRUMB_ITEMS.stuff.view(id),
      {
        label: "Edit",
        href: frontendUrls.stuff.edit(id),
      },
    ],
  },
};
