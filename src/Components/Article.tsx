import styled from "@emotion/styled";
import { ClassNames } from "@emotion/react";
import { ReactComponent as NotFavoriteArcitle } from "../AddFavorite.svg";
import { ReactComponent as FavoriteArticle } from "../IsInFavorites.svg";
import { ReactComponent as Dot } from "../Dot.svg";
import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { BlackParagraph } from "./Articles";
import ReactModal from "react-modal";
import { mediumButtonStyles, smallButtonStyles } from "../styles";
import { favoriteArticlesContext, shoppingCartContext } from "../Context";

type ArticleProps = {
  id: number;
  articleTitle: string;
  submitSeen?: (id: number) => void;
};

type ArticleDetail = {
  date: string;
  link: string;
  title: {
    rendered: string;
  };
  yoast_head_json: {
    author: string;
  };
};

const ArticleStyledModal = (props: ReactModal.Props) => (
  <ClassNames>
    {({ css }) => (
      <ReactModal
        {...props}
        className={css`
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          position: absolute;
          background: #fff;
          -webkit-overflow-scrolling: touch;
          border-radius: 15px;
          padding: 30px 40px 15px 40px;
          box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 0.25);
          width: 40%;
        `}
        overlayClassName={css`
          position: fixed;
          display: flex;
          justify-content: center;
          flex-direction: row;
          align-items: center;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.75);
          z-index: 2;
        `}
      ></ReactModal>
    )}
  </ClassNames>
);

const Article: React.FC<ArticleProps> = ({ id, articleTitle, submitSeen }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const decodeHtmlEntities = (text: string) => {
    const element = document.createElement("div");
    element.innerHTML = text;
    return element.textContent || element.innerText;
  };
  const [articleURL, setArticleURL] = useState(
    "https://techcrunch.com/wp-json/wp/v2/posts/"
  );
  const [articleDetails, setArticleDetail] = useState<ArticleDetail>({
    date: "",
    link: "",
    title: {
      rendered: "",
    },
    yoast_head_json: {
      author: "",
    },
  });
  const favoriteArticles = useContext(favoriteArticlesContext);
  const articlesInCart = useContext(shoppingCartContext);
  const thisArticle = articlesInCart.shoppingCartItems.find(
    (article) => article.id === id
  );

  const handleModalOpen = () => {
    setArticleURL(`https://techcrunch.com/wp-json/wp/v2/posts/${id}`);
    setIsModalOpened(true);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const intersectionObserver = useMemo(() => {
    return new IntersectionObserver(() => {
      submitSeen?.(id);
    });
  }, [id, submitSeen]);

  useEffect(() => {
    if (containerRef.current !== null) {
      intersectionObserver.observe(containerRef.current);
    }
  }, [intersectionObserver]);
  useEffect(() => {
    (async () => {
      const fetchedArticleDetail: ArticleDetail = await (
        await fetch(articleURL)
      ).json();
      if (fetchedArticleDetail.yoast_head_json) {
        setArticleDetail({
          date: fetchedArticleDetail.date.split("T")[0],
          link: fetchedArticleDetail.link,
          title: fetchedArticleDetail.title,
          yoast_head_json: {
            author: fetchedArticleDetail.yoast_head_json.author,
          },
        });
      }
    })();
  }, [articleURL]);

  const handleFavorite = () => {
    if (
      favoriteArticles.favoriteArticles.some((article) => article.id === id)
    ) {
      favoriteArticles.setfavoriteArticles((prevData) =>
        prevData.filter((article) => article.id !== id)
      );
    } else {
      favoriteArticles.setfavoriteArticles((prevData) => [
        ...prevData,
        {
          id: id,
          title: articleTitle,
        },
      ]);
    }
  };

  return (
    <SmallSpacer ref={containerRef}>
      <ArticleStyledModal
        isOpen={isModalOpened}
        onRequestClose={() => setIsModalOpened(false)}
      >
        <ArticleModalTitle>
          {decodeHtmlEntities(articleDetails.title.rendered)}
        </ArticleModalTitle>
        <DisplayInRow>
          <ArticleModalInfo>
            {articleDetails.yoast_head_json.author}
          </ArticleModalInfo>
          <Dot></Dot>
          <ArticleModalInfo>{articleDetails.date}</ArticleModalInfo>
        </DisplayInRow>
        <DisplayInRow>
          <AddToFavoriteButton onClick={() => handleFavorite()}>
            {favoriteArticles.favoriteArticles.some(
              (article) => article.id === id
            ) ? (
              <FavoriteArticle></FavoriteArticle>
            ) : (
              <NotFavoriteArcitle></NotFavoriteArcitle>
            )}
          </AddToFavoriteButton>
          <SmallSpacer></SmallSpacer>
          {!articlesInCart.shoppingCartItems.some(
            (article) => article.id === id
          ) ? (
            <AddToCartButton
              onClick={() => {
                articlesInCart.setShoppingCartItems((prevData) => [
                  ...prevData,
                  {
                    id: id,
                    inCartAmmount: 1,
                  },
                ]);
              }}
            >
              <ButtonParagraph>Add to cart</ButtonParagraph>
            </AddToCartButton>
          ) : (
            <DisplayInRow>
              <CartItemButton
                onClick={() => {
                  if (thisArticle !== undefined) {
                    if (thisArticle.inCartAmmount === 1) {
                      articlesInCart.setShoppingCartItems((prevData) =>
                        prevData.filter((article) => article.id !== id)
                      );
                    } else {
                      articlesInCart.setShoppingCartItems(
                        articlesInCart.shoppingCartItems.map((article) => {
                          if (article.id === id) {
                            return {
                              ...article,
                              inCartAmmount: thisArticle.inCartAmmount - 1,
                            };
                          } else {
                            return article;
                          }
                        })
                      );
                    }
                  }
                }}
              >
                <InCartParagraph>-</InCartParagraph>
              </CartItemButton>
              <SmallSpacer>
                <InCartParagraph>{thisArticle?.inCartAmmount}</InCartParagraph>
              </SmallSpacer>
              <CartItemButton
                onClick={() => {
                  if (thisArticle !== undefined) {
                    articlesInCart.setShoppingCartItems(
                      articlesInCart.shoppingCartItems.map((article) => {
                        if (article.id === id) {
                          return {
                            ...article,
                            inCartAmmount: thisArticle.inCartAmmount + 1,
                          };
                        } else {
                          return article;
                        }
                      })
                    );
                  }
                }}
              >
                <InCartParagraph>+</InCartParagraph>
              </CartItemButton>
            </DisplayInRow>
          )}
          <SmallSpacer></SmallSpacer>
          <ArticleModalLink
            href={articleDetails.link}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ButtonParagraph>Read article</ButtonParagraph>
          </ArticleModalLink>
        </DisplayInRow>

        <ModalSpacer></ModalSpacer>
        <CloseModalButton
          onClick={() => {
            setIsModalOpened(false);
          }}
        >
          <BlackParagraph>Close</BlackParagraph>
        </CloseModalButton>
      </ArticleStyledModal>
      <ArticleWrapper>
        <ArticleTitleButton onClick={() => handleModalOpen()}>
          <ArticleTitle>{decodeHtmlEntities(articleTitle)}</ArticleTitle>
        </ArticleTitleButton>
        <DisplayInRow>
          <AddToFavoriteButton onClick={() => handleFavorite()}>
            {favoriteArticles.favoriteArticles.some(
              (article) => article.id === id
            ) ? (
              <FavoriteArticle></FavoriteArticle>
            ) : (
              <NotFavoriteArcitle></NotFavoriteArcitle>
            )}
          </AddToFavoriteButton>
          <SmallSpacer></SmallSpacer>
          {!articlesInCart.shoppingCartItems.some(
            (article) => article.id === id
          ) ? (
            <AddToCartButton
              onClick={() => {
                articlesInCart.setShoppingCartItems((prevData) => [
                  ...prevData,
                  {
                    id: id,
                    inCartAmmount: 1,
                  },
                ]);
              }}
            >
              <ButtonParagraph>Add to cart</ButtonParagraph>
            </AddToCartButton>
          ) : (
            <DisplayInRow>
              <CartItemButton
                onClick={() => {
                  if (thisArticle !== undefined) {
                    if (thisArticle.inCartAmmount === 1) {
                      articlesInCart.setShoppingCartItems((prevData) =>
                        prevData.filter((article) => article.id !== id)
                      );
                    } else {
                      articlesInCart.setShoppingCartItems(
                        articlesInCart.shoppingCartItems.map((article) => {
                          if (article.id === id) {
                            return {
                              ...article,
                              inCartAmmount: thisArticle.inCartAmmount - 1,
                            };
                          } else {
                            return article;
                          }
                        })
                      );
                    }
                  }
                }}
              >
                <InCartParagraph>-</InCartParagraph>
              </CartItemButton>
              <SmallSpacer>
                <InCartParagraph>{thisArticle?.inCartAmmount}</InCartParagraph>
              </SmallSpacer>
              <CartItemButton
                onClick={() => {
                  if (thisArticle !== undefined) {
                    articlesInCart.setShoppingCartItems(
                      articlesInCart.shoppingCartItems.map((article) => {
                        if (article.id === id) {
                          return {
                            ...article,
                            inCartAmmount: thisArticle.inCartAmmount + 1,
                          };
                        } else {
                          return article;
                        }
                      })
                    );
                  }
                }}
              >
                <InCartParagraph>+</InCartParagraph>
              </CartItemButton>
            </DisplayInRow>
          )}
        </DisplayInRow>
      </ArticleWrapper>
    </SmallSpacer>
  );
};

const ArticleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: #f9f9f9;
  border-radius: 0.5rem;
  padding: 0.5rem;
  width: 25rem;
  min-height: 10rem;
  max-height: 15rem;
  border: 0;
  transition: 0.5s;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);
  :hover {
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.25);
  }
`;

export const ArticleTitleButton = styled.button`
  border: 0;
  background: none;
  cursor: pointer;
  transition: 0.2s;
  :hover {
    color: #b30000;
    text-decoration: underline;
  }
`;

export const ArticleTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
  padding: 0.5rem;
`;

export const SmallSpacer = styled.div`
  padding: 0.5rem;
`;

export const AddToCartButton = styled.button`
  ${mediumButtonStyles}
  background-color: red;
  :hover {
    background: #db0000;
  }
`;

export const ButtonParagraph = styled.p`
  font-family: Montserrat;
  color: white;
  font-weight: 700;
  margin: 0;
  font-size: 0.8rem;
`;

export const AddToFavoriteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  cursor: pointer;
  border: 0;
  background: none;
  padding: 0.5rem;
`;

export const CartItemButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: 900;
  color: #202020;
  cursor: pointer;
  font-family: Montserrat;
  font-weight: 400;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);
  background-color: #fdfdfd;
`;

export const DisplayInRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const InCartParagraph = styled.p`
  margin: 0;
  width: 1rem;
  text-align: center;
`;

export const ArticleModalTitle = styled.h1`
  font-weight: 600;
  text-align: center;
`;

export const ArticleModalInfo = styled.p`
  font-weight: 600;
  padding: 1rem;
`;

export const CloseModalButton = styled.button`
  ${smallButtonStyles}
  background: #d4d4d4;
  :hover {
    background: #aaaaaa;
  }
`;

export const ModalSpacer = styled.div`
  padding: 1.5rem;
`;

export const ArticleModalLink = styled.a`
  ${mediumButtonStyles}
  text-decoration: none;
  background-color: #888aff;
  :hover {
    background: #5d60ff;
  }
`;

export default Article;
