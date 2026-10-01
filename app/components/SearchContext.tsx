"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

type SearchContextType = {
  searchOpen: boolean;
  searchQuery: string;
  openSearch: () => void;
  closeSearch: (clearQuery?: boolean) => void;
  setSearchQuery: (query: string) => void;
};

const SearchContext = createContext<
  SearchContextType | undefined
>(undefined);

export function SearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] =
    useState("");

  const openSearch = () => {
    setSearchOpen(true);
  };

  const closeSearch = (
    clearQuery = true
  ) => {
    setSearchOpen(false);

    if (clearQuery) {
      setSearchQuery("");
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchOpen,
        searchQuery,
        openSearch,
        closeSearch,
        setSearchQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error(
      "useSearch must be used inside SearchProvider"
    );
  }

  return context;
}