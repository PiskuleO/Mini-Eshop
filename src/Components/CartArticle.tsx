import styled from "@emotion/styled";
import { ClassNames } from "@emotion/react";
import { ReactComponent as NotFavoriteArcitle } from "../AddFavorite.svg";
import { ReactComponent as FavoriteArticle } from "../IsInFavorites.svg";
import { ReactComponent as Dot } from "../Dot.svg";
import { useEffect, useState, useContext } from "react";
import { BlackParagraph } from "./Articles";
import ReactModal from "react-modal";
import { favoriteArticlesContext, shoppingCartContext } from "../Context";
import {
  AddToCartButton,
  AddToFavoriteButton,
  ArticleModalInfo,
  ArticleModalTitle,
  ArticleTitleButton,
  ButtonParagraph,
  CartItemButton,
  CloseModalButton,
  InCartParagraph,
  SmallSpacer,
  DisplayInRow,
  ModalSpacer,
  ArticleModalLink,
} from "./Article";
import { tdStyle } from "../styles";

type ArticleProps = {
  id: number;
  articleTitle: string;
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

const CartArticle: React.FC<ArticleProps> = ({ id, articleTitle }) => {
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
    <ArticleTr>
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
          <ArticleModalLink href={articleDetails.link} target="_blank">
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

      <TitleTd>
        <ArticleTitleButton onClick={() => handleModalOpen()}>
          <CartArticleTitle>
            {decodeHtmlEntities(articleTitle)}
          </CartArticleTitle>
        </ArticleTitleButton>
      </TitleTd>
      <InteractionsTd>
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
      </InteractionsTd>
      <PriceTd>
        $
        {thisArticle !== undefined
          ? (thisArticle.inCartAmmount * id).toLocaleString()
          : "0"}
      </PriceTd>
    </ArticleTr>
  );
};
const CartArticleTitle = styled.h2`
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
  padding: 0;
  text-align: left;
`;
const ArticleTr = styled.tr`
  height: 3rem;
`;
const InteractionsTd = styled.td`
  ${tdStyle}
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: auto;
`;

const PriceTd = styled.td`
  ${tdStyle}
  text-align: center;
  width: 10rem;
`;

const TitleTd = styled.td`
  ${tdStyle}
  text-align: left;
`;

export default CartArticle;
