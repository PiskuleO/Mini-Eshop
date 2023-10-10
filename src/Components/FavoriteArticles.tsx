import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { favoriteArticlesContext } from "../Context";
import Article, { SmallSpacer } from "./Article";
import {
  ArticlesWrapper,
  BlackParagraph,
  FetchedArticle,
  MainTitle,
  DisplayColumn,
} from "./Articles";
import { mediumButtonStyles } from "../styles";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";

const FavoriteArticles: React.FC = () => {
  const favoriteArticles = useContext(favoriteArticlesContext);
  const initialFetchDone = useRef<boolean>(false);
  const [fetchedFavoriteArticle, setFetchedFavoriteArticles] = useState<
    FetchedArticle[]
  >([]);

  const handleLoad = useCallback(() => {
    let favoriteIDs = [0];
    if (favoriteArticles.favoriteArticles.length > 0) {
      favoriteIDs = favoriteArticles.favoriteArticles.map(
        (article) => article.id
      );
    }

    (async () => {
      const url = `https://techcrunch.com/wp-json/wp/v2/posts?include=${favoriteIDs}&per_page=${favoriteIDs.length}`;
      const articlesData = await (await fetch(url)).json();
      const articles: FetchedArticle[] = articlesData.map(
        (article: FetchedArticle) => {
          return {
            id: article.id,
            title: article.title,
          };
        }
      );
      setFetchedFavoriteArticles(articles);
    })();
  }, [favoriteArticles.favoriteArticles]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      handleLoad();
    }
    initialFetchDone.current = true;
  }, [handleLoad]);

  return (
    <DisplayColumn>
      <MainTitle>Your favorite articles</MainTitle>
      <ArticlesWrapper>
        {favoriteArticles.favoriteArticles.length > 0 ? (
          fetchedFavoriteArticle.map((article) => {
            return (
              <Article
                articleTitle={article.title.rendered}
                id={article.id}
                key={article.id + "Favorite"}
              ></Article>
            );
          })
        ) : (
          <NoArticlesMenu>
            <BlackParagraph>
              You have no favorite arcitles, let's change it!
            </BlackParagraph>
            <SmallSpacer></SmallSpacer>
            <RedirectButton to={"/"}>
              <BlackParagraph>Back to Articles</BlackParagraph>
            </RedirectButton>
          </NoArticlesMenu>
        )}
      </ArticlesWrapper>
    </DisplayColumn>
  );
};

const RedirectButton = styled(Link)`
  ${mediumButtonStyles}
  text-decoration: none;
  background-color: #f0f0f0;
  :hover {
    background: #c9c9c9;
  }
`;

export const NoArticlesMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default FavoriteArticles;
