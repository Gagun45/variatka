import { ISearchBarItem } from "@/zustand/search.store";

export const frontendUrls = {
  ingredients: {
    index: "/ingredients",
    view: (id: number) => `/ingredients/${id}`,
    edit: (id: number) => `/ingredients/${id}/edit`,
    saved: "/ingredients/saved",
  },
  recipes: {
    index: "/recipes",
    view: (id: number) => `/recipes/${id}`,
    edit: (id: number) => `/recipes/${id}/edit`,
    saved: "/recipes/saved",
  },
  stuff: {
    index: "/stuff",
    view: (id: number) => `/stuff/${id}`,
    edit: (id: number) => `/stuff/${id}/edit`,
  },
  index: "/",
  admin: "/admin",
};

export const getSearchItemHref = (item: ISearchBarItem) => {
  switch (item.type) {
    case "ingredient":
      return frontendUrls.ingredients.view(item.id);

    case "recipe":
      return frontendUrls.recipes.view(item.id);

    case "stuff":
      return frontendUrls.stuff.view(item.id); // or wherever it goes

    default:
      return "#";
  }
};
