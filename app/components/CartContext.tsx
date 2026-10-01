"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  option?: string;
  quantity: number;
};

type AddToCartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  option?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartLoaded: boolean;
  addToCart: (item: AddToCartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (
    id: string,
    quantity: number
  ) => void;
  clearCart: () => void;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const STORAGE_KEY = "ayosa_cart";

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [cartLoaded, setCartLoaded] =
    useState(false);

  /*
   * Load the customer's cart from localStorage.
   */
  useEffect(() => {
    try {
      const savedCart =
        window.localStorage.getItem(STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const validItems: CartItem[] =
            parsedCart.filter(
              (item): item is CartItem =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.image === "string" &&
                typeof item.price === "number" &&
                typeof item.quantity === "number" &&
                item.quantity > 0
            );

          setCartItems(validItems);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load Ayosa cart:",
        error
      );

      try {
        window.localStorage.removeItem(
          STORAGE_KEY
        );
      } catch {
        // Ignore localStorage cleanup errors.
      }
    } finally {
      setCartLoaded(true);
    }
  }, []);

  /*
   * Save the cart after the initial localStorage
   * load has completed.
   */
  useEffect(() => {
    if (!cartLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Unable to save Ayosa cart:",
        error
      );
    }
  }, [cartItems, cartLoaded]);

  /*
   * Add product to cart.
   */
  const addToCart = (
    item: AddToCartItem
  ) => {
    setCartItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (cartItem) =>
            cartItem.id === item.id
        );

      if (existingItem) {
        return currentItems.map(
          (cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  /*
   * Remove product completely.
   */
  const removeFromCart = (
    id: string
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  };

  /*
   * Update product quantity.
   */
  const updateQuantity = (
    id: string,
    quantity: number
  ) => {
    const safeQuantity = Math.floor(quantity);

    if (safeQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item
      )
    );
  };

  /*
   * Empty the cart.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /*
   * Total physical quantity.
   */
  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cartItems]);

  /*
   * Cart subtotal.
   */
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        cartLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}