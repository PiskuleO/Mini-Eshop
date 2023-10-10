import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ReactComponent as FavoriteArcitles } from "../HeaderFavorites.svg";
import { ReactComponent as ShoppingCart } from "../Cart.svg";
import { ReactComponent as Home } from "../Home.svg";
import { InCartArticle, favoriteArticlesContext } from "../Context";
import { shoppingCartContext } from "../Context";
import ReactModal from "react-modal";

import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { ClassNames } from "@emotion/react";
import { BlackParagraph, MainTitle } from "./Articles";
import { ButtonParagraph, DisplayInRow, SmallSpacer } from "./Article";
import { NoArticlesMenu } from "./FavoriteArticles";
import { mediumButtonStyles } from "../styles";
import CartArticle from "./CartArticle";

type InCartFetchedArticle = {
  id: number;
  title: {
    rendered: string;
  };
  inCartAmmount: number;
};
const Header: React.FC = () => {
  const favoriteArticles = useContext(favoriteArticlesContext);
  const inCartItems = useContext(shoppingCartContext);
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const [fetchedCart, setFetchedCart] = useState<InCartFetchedArticle[]>([]);
  const StyledModal = (props: ReactModal.Props) => (
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
            width: 80%;
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
            z-index: 1;
          `}
        ></ReactModal>
      )}
    </ClassNames>
  );
  const sendCartItems = async (cartItems: InCartArticle[]) => {
    console.log("would send these: ", cartItems);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleLoad = useCallback(() => {
    let cartIDs: number[] = [];
    if (inCartItems.shoppingCartItems.length > 0) {
      cartIDs = inCartItems.shoppingCartItems.map((article) => article.id);
      (async () => {
        const url = `https://techcrunch.com/wp-json/wp/v2/posts?include=${cartIDs}&per_page=${cartIDs.length}`;
        const articlesData = await (await fetch(url)).json();
        const articles: InCartFetchedArticle[] = articlesData.map(
          (article: InCartFetchedArticle) => {
            return {
              id: article.id,
              title: article.title,
            };
          }
        );

        setFetchedCart(articles);
      })();
    } else {
      setFetchedCart([]);
    }
  }, [inCartItems.shoppingCartItems]);

  useEffect(() => {
    handleLoad();
  }, [inCartItems.shoppingCartItems, handleLoad]);

  const inCartAmmount = useMemo(() => {
    let totalAmmount = 0;
    inCartItems.shoppingCartItems.map((article) => {
      return (totalAmmount += article.inCartAmmount);
    });
    return totalAmmount;
  }, [inCartItems.shoppingCartItems]);

  const inCartPrice = useMemo(() => {
    let totalPrice = 0;
    inCartItems.shoppingCartItems.map((article) => {
      return (totalPrice += article.id * article.inCartAmmount);
    });
    return totalPrice;
  }, [inCartItems.shoppingCartItems]);

  return (
    <HeaderWrapper>
      <StyledModal
        isOpen={isModalOpened}
        onRequestClose={() => {
          setIsModalOpened(false);
        }}
      >
        <MainTitle>Your Cart</MainTitle>
        {inCartItems.shoppingCartItems.length > 0 ? (
          <TableWrapper>
            <CartTable>
              <CartTableHead>
                <CartTableTr>
                  <NameTh>Name</NameTh>
                  <CartTh>Ammount</CartTh>
                  <CartTh>Price</CartTh>
                </CartTableTr>
              </CartTableHead>
              <CartTBody>
                {fetchedCart.map((article) => {
                  return (
                    <CartArticle
                      articleTitle={article.title.rendered}
                      id={article.id}
                      key={article.id + "Cart"}
                    />
                  );
                })}
              </CartTBody>
            </CartTable>
          </TableWrapper>
        ) : (
          <NoArticlesMenu>
            <BlackParagraph>
              You have no arcitles in cart, let's change it!
            </BlackParagraph>
            <SmallSpacer></SmallSpacer>
          </NoArticlesMenu>
        )}
        <SmallSpacer></SmallSpacer>
        <DisplayInRow>
          <p>Total</p>
          <TotalPrice>${inCartPrice.toLocaleString()}</TotalPrice>
        </DisplayInRow>
        <DisplayInRow>
          {inCartItems.shoppingCartItems.length > 0 ? (
            <BuyButton
              onClick={() => {
                sendCartItems(inCartItems.shoppingCartItems);
              }}
            >
              <ButtonParagraph>Buy</ButtonParagraph>
            </BuyButton>
          ) : null}
          <SmallSpacer></SmallSpacer>
          <ModalCloseButton
            onClick={() => {
              setIsModalOpened(false);
            }}
          >
            <BlackParagraph>Close cart</BlackParagraph>
          </ModalCloseButton>
        </DisplayInRow>
      </StyledModal>

      <MenuItem>
        <Link to={"/"}>
          <Home></Home>
        </Link>
      </MenuItem>

      <RightItems>
        <MenuItem>
          <Link to={"/favorites"}>
            <FavoriteArcitles></FavoriteArcitles>
            {favoriteArticles.favoriteArticles.length !== 0 ? (
              <AmmountDisplayer>
                {favoriteArticles.favoriteArticles.length}
              </AmmountDisplayer>
            ) : null}
          </Link>
        </MenuItem>

        <ShoppingCartButton
          onClick={() => {
            setIsModalOpened(true);
          }}
        >
          <MenuItem>
            <ShoppingCart></ShoppingCart>

            {inCartAmmount === 0 ? (
              <CartDisplayer>
                <TotalPrice></TotalPrice>
              </CartDisplayer>
            ) : (
              <CartDisplayer>
                <AmmountDisplayer>{inCartAmmount}</AmmountDisplayer>
                <TotalPrice>${inCartPrice.toLocaleString()}</TotalPrice>
              </CartDisplayer>
            )}
          </MenuItem>
        </ShoppingCartButton>
      </RightItems>
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 2rem 5rem 0 2rem;
`;

const MenuItem = styled.div`
  padding: 0 2rem 0 1rem;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightItems = styled.div`
  display: flex;
`;

const AmmountDisplayer = styled.span`
  position: absolute;
  left: 55px;
  top: -5px;
  align-items: center;
  background-color: #d91f29;
  border-radius: 1em;
  color: #fff;
  display: inline-flex;
  font-size: 12px;
  font-weight: 400;
  justify-content: center;
  line-height: 1;
  min-height: 20px;
  min-width: 20px;
  padding: 1px;
  z-index: 1;
`;

const TotalPrice = styled.p`
  margin: 0;
  padding: 1rem;
  font-weight: 700;
  width: 8rem;
  :hover {
    text-decoration: underline;
  }
`;

const CartDisplayer = styled.div``;

const ShoppingCartButton = styled.button`
  background: none;
  border: 0;
  font-family: Montserrat;
`;

const ModalCloseButton = styled.button`
  ${mediumButtonStyles}
`;

const BuyButton = styled.button`
  ${mediumButtonStyles}
  background-color: red;
`;

const CartTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;
const CartTableHead = styled.thead`
  text-align: center;
`;
const CartTBody = styled.tbody`
  max-height: 20rem;
  overflow-y: auto;
`;
const CartTh = styled.th``;
const NameTh = styled.th`
  text-align: left;
`;
const CartTableTr = styled.tr`
  position: relative;
  ::after {
    content: " ";
    background: linear-gradient(180deg, #7476fd 0%, #48e5da 100%);
    height: 1px;
    width: calc(100%);
    position: absolute;
    bottom: 0;
    left: 0;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  max-height: 20rem;
  overflow: auto;
`;
export default Header;
