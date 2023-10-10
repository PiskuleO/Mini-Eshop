import styled from "@emotion/styled";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ReactComponent as SearchIcon } from "../Search.svg";
import { smallButtonStyles } from "../styles";
import Article, { DisplayInRow, SmallSpacer } from "./Article";
import debounce from "lodash/debounce";

export type FetchedArticle = {
  id: number;
  title: {
    rendered: string;
  };
};

const Articles: React.FC = () => {
  const initialFetchDone = useRef<boolean>(false);
  const [fetchedArticles, setFetchedArticles] = useState<FetchedArticle[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchPaging, setSearchPaging] = useState<number>(1);
  const [userSearchInput, setUserSearchInput] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [orderBy, setOrderBy] = useState<string>("desc");
  const unsubmitedSeenIDs = useRef<number[]>([]);

  const handleNextLoad = useCallback(
    (
      searchValue: string,
      orderValue: string,
      sortValue: string,
      pageValue: number
    ) => {
      setCurrentPage(pageValue + 1);
      let url = `https://techcrunch.com/wp-json/wp/v2/posts?per_page=9&page=${pageValue}&orderby=${sortValue}&order=${orderValue}`;
      if (searchValue.length > 0) {
        url = `https://techcrunch.com/wp-json/wp/v2/posts?per_page=9&page=${pageValue}&search=${searchValue}&search_columns=post_title&orderby=${sortValue}&order=${orderValue}`;
      }

      (async () => {
        const articlesData = await (await fetch(url)).json();
        const articles: FetchedArticle[] = articlesData.map(
          (article: FetchedArticle) => {
            return {
              id: article.id,
              title: article.title,
            };
          }
        );
        setFetchedArticles((prevData) => [...prevData, ...articles]);
      })();
    },
    []
  );

  const delayedSearch = useRef(debounce(handleNextLoad, 2500));
  const handleUserInputChange = (
    userInputValue: string,
    sortValue: string,
    orderValue: string
  ) => {
    setOrderBy(orderValue);
    setSortBy(sortValue);
    setUserSearchInput(userInputValue);
    setSearchPaging(searchPaging + 1);
    if (userInputValue.length >= 3 || userInputValue.length === 0) {
      setFetchedArticles([]);
      delayedSearch.current(
        userInputValue,
        orderValue,
        sortValue,
        searchPaging
      );
    }
  };

  const sendSeenIDs = async () => {
    const IDs = unsubmitedSeenIDs.current;
    unsubmitedSeenIDs.current = [];
    console.log("would send these: " + IDs);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const delayedAPICall = useMemo(() => {
    return debounce(sendSeenIDs, 500);
  }, []);

  const articleViewed = useCallback(
    (id: number) => {
      unsubmitedSeenIDs.current.push(id);
      delayedAPICall();
    },
    [delayedAPICall]
  );

  useEffect(() => {
    if (!initialFetchDone.current) {
      handleNextLoad("", orderBy, sortBy, 1);
    }
    initialFetchDone.current = true;
  }, [handleNextLoad, sortBy, orderBy]);

  useEffect(() => {
    setSearchPaging(1);
  }, [searchPaging]);

  return (
    <DisplayColumn>
      <MainTitle>CzechCrunch articles shop</MainTitle>
      <DisplayInRow>
        <SearchBar>
          <SearchIcon></SearchIcon>
          <SearchSpacer></SearchSpacer>
          <SearchInput
            value={userSearchInput}
            onChange={(e) => {
              handleUserInputChange(e.target.value, sortBy, orderBy);
            }}
            type="text"
            placeholder="Type a phrase to search"
          ></SearchInput>
        </SearchBar>

        <FormLabel>
          Sort by
          <SmallSpacer></SmallSpacer>
          <FormSelect
            name="articlesSort"
            onChange={(e) =>
              handleUserInputChange(userSearchInput, e.target.value, orderBy)
            }
            value={sortBy}
          >
            <FormOption value="date">Date</FormOption>
            <FormOption value="title">Title</FormOption>
            <FormOption value="author">Author</FormOption>
          </FormSelect>
        </FormLabel>
        <FormLabel>
          Order
          <SmallSpacer></SmallSpacer>
          <FormSelect
            name="articlesSort"
            onChange={(e) =>
              handleUserInputChange(userSearchInput, sortBy, e.target.value)
            }
            value={orderBy}
          >
            <FormOption value="desc">Descending</FormOption>
            <FormOption value="asc">Ascending</FormOption>
          </FormSelect>
        </FormLabel>
      </DisplayInRow>
      <ArticlesWrapper>
        {fetchedArticles.map((article) => {
          return (
            <Article
              id={article.id}
              articleTitle={article.title.rendered}
              key={article.id + "MainArticles"}
              submitSeen={articleViewed}
            ></Article>
          );
        })}
      </ArticlesWrapper>
      <FooterNavButtons>
        <LoadNextButton
          onClick={() => {
            handleNextLoad(userSearchInput, orderBy, sortBy, currentPage);
          }}
        >
          <BlackParagraph>Load next 9...</BlackParagraph>
        </LoadNextButton>
      </FooterNavButtons>
    </DisplayColumn>
  );
};
export const DisplayColumn = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const MainTitle = styled.h1`
  font-family: "Montserrat";
  text-align: center;
  font-weight: 400;
  font-size: calc(1.5rem + 3vw);
  color: black;
`;

export const ArticlesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  max-width: 80%;
`;

const FooterNavButtons = styled.div`
  padding: 1rem 0 1rem 0;
  display: flex;
`;

const LoadNextButton = styled.button`
  ${smallButtonStyles}
  :hover {
    background: #c9c9c9;
  }
`;

export const BlackParagraph = styled.p`
  font-family: Montserrat;
  font-weight: 500;
  margin: 0;
  color: black;
`;

const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 1rem;
`;

const SearchInput = styled.input`
  font-family: Montserrat;
  border: 0;
  font-size: 15px;
  border-bottom: 1px solid black;
  outline: none;
`;

export const SearchSpacer = styled.div`
  padding: 0.2rem;
`;

const FormSelect = styled.select`
  border: 0;
  border-bottom: 1px solid black;
  outline: none;
  font-family: Montserrat;
  cursor: pointer;
  font-size: 1rem;
`;
const FormOption = styled.option`
  font-size: 1rem;
`;
const FormLabel = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;
`;
export default Articles;
