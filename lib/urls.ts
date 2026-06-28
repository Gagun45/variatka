export const frontendUrls = {
  ingredients: {
    index: "/admin/ingredients",
    view: (id: number) => `/admin/ingredients/${id}`,
    edit: (id: number) => `/admin/ingredients/${id}/edit`,
    saved: "/admin/ingredients/saved",
  },
  recipes: {
    index: "/admin/recipes",
    view: (id: number) => `/admin/recipes/${id}`,
    edit: (id: number) => `/admin/recipes/${id}/edit`,
    saved: "/admin/recipes/saved",
  },
  stuff: {
    index: "/admin/stuff",
    view: (id: number) => `/admin/stuff/${id}`,
    edit: (id: number) => `/admin/stuff/${id}/edit`,
  },
  index: "/",
  admin: {
    admin: "/admin/admin",
    wishlists: "/admin/wishlists",
  },
  public: {
    recipes: "/recipes",
    wishlist: "/wishlist",
    view: (id: number) => `/recipes/${id}`,
    login: "/login",
  },
};
