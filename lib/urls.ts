export const frontendUrls = {
  ingredients: {
    index: "/ingredients",
    view: (id: number) => `/ingredients/${id}`,
    edit: (id: number) => `/ingredients/${id}/edit`,
  },
  recipes: {
    index: "/recipes",
    view: (id: number) => `/recipes/${id}`,
    edit: (id: number) => `/recipes/${id}/edit`,
  },
};
