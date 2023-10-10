import { createContext } from "react";

export type FavortiteArticle = {
  id: number;
};

export type InCartArticle = {
  id: number;
  inCartAmmount: number;
};

export const favoriteArticlesContext = createContext<{
  favoriteArticles: FavortiteArticle[];
  setfavoriteArticles: React.Dispatch<React.SetStateAction<FavortiteArticle[]>>;
}>({
  favoriteArticles: [],
  setfavoriteArticles: () => {},
});

export const shoppingCartContext = createContext<{
  shoppingCartItems: InCartArticle[];
  setShoppingCartItems: React.Dispatch<React.SetStateAction<InCartArticle[]>>;
}>({
  shoppingCartItems: [],
  setShoppingCartItems: () => {},
});
