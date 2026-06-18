export const frontendUrls = {
  ingredients: {
    index: "/ingredients",
    view: (id: number) => `/ingredients/${id}`,
    edit: (id: number) => `/ingredients/${id}/edit`,
    myList: "/ingredients/my-list",
  },
  recipes: {
    index: "/recipes",
    view: (id: number) => `/recipes/${id}`,
    edit: (id: number) => `/recipes/${id}/edit`,
  },
  stuff: {
    index: "/stuff",
    view: (id: number) => `/stuff/${id}`,
    edit: (id: number) => `/stuff/${id}/edit`,
  },
  index: "/",
};
