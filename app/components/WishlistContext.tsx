"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type WishlistItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  option?: string;
};

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
};

const WishlistContext =
  createContext<WishlistContextType | undefined>(
    undefined
  );

const STORAGE_KEY = "ayosa_wishlist";

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        STORAGE_KEY
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setWishlistItems(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems, loaded]);

  const isWishlisted = (id: string) => {
    return wishlistItems.some(
      (item) => item.id === id
    );
  };

  const toggleWishlist = (
    item: WishlistItem
  ) => {
    setWishlistItems((current) => {
      const exists = current.some(
        (savedItem) =>
          savedItem.id === item.id
      );

      if (exists) {
        return current.filter(
          (savedItem) =>
            savedItem.id !== item.id
        );
      }

      return [...current, item];
    });
  };

  const removeFromWishlist = (
    id: string
  ) => {
    setWishlistItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}