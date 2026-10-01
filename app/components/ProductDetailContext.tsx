"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

export type ProductDetailOption = {
  label: string;
  price: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  option?: string;
  options?: ProductDetailOption[];
};

type ProductDetailContextType = {
  selectedProduct: ProductDetail | null;
  productDetailOpen: boolean;
  openProductDetail: (
    product: ProductDetail
  ) => void;
  closeProductDetail: () => void;
};

const ProductDetailContext =
  createContext<
    ProductDetailContextType | undefined
  >(undefined);

export function ProductDetailProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDetail | null>(null);

  const [
    productDetailOpen,
    setProductDetailOpen,
  ] = useState(false);

  const openProductDetail = (
    product: ProductDetail
  ) => {
    setSelectedProduct(product);
    setProductDetailOpen(true);
  };

  const closeProductDetail = () => {
    setProductDetailOpen(false);

    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  return (
    <ProductDetailContext.Provider
      value={{
        selectedProduct,
        productDetailOpen,
        openProductDetail,
        closeProductDetail,
      }}
    >
      {children}
    </ProductDetailContext.Provider>
  );
}

export function useProductDetail() {
  const context = useContext(
    ProductDetailContext
  );

  if (!context) {
    throw new Error(
      "useProductDetail must be used inside ProductDetailProvider"
    );
  }

  return context;
}