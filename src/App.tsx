import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import NoPage from "./Components/NoPage";
import Modal from "react-modal";
import FavoriteArticles from "./Components/FavoriteArticles";
import {
  FavortiteArticle,
  InCartArticle,
  favoriteArticlesContext,
  shoppingCartContext,
} from "./Context";
import Articles from "./Components/Articles";

Modal.setAppElement("#root");

function App() {
  const favoritesStorageKey = "favoritesKey";

  const initialFavoriteArticles = getLocalFavorites();

  const [favoriteArticles, setfavoriteArticles] = useState<FavortiteArticle[]>(
    initialFavoriteArticles
  );
  const [shoppingCartItems, setShoppingCartItems] = useState<InCartArticle[]>(
    []
  );

  useEffect(() => {
    localStorage.setItem(favoritesStorageKey, JSON.stringify(favoriteArticles));
  }, [favoriteArticles]);

  function getLocalFavorites() {
    const localStorageFavoriteArticles =
      localStorage.getItem(favoritesStorageKey);
    return localStorageFavoriteArticles
      ? JSON.parse(localStorageFavoriteArticles)
      : [];
  }

  return (
    <shoppingCartContext.Provider
      value={{ shoppingCartItems, setShoppingCartItems }}
    >
      <favoriteArticlesContext.Provider
        value={{ favoriteArticles, setfavoriteArticles }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Articles />}></Route>
              <Route path="favorites" element={<FavoriteArticles />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </favoriteArticlesContext.Provider>
    </shoppingCartContext.Provider>
  );
}

export default App;
