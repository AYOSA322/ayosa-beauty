"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import {
  useProductDetail,
  type ProductDetailOption,
} from "./ProductDetailContext";

export default function ProductDetailModal() {
  const {
    selectedProduct,
    productDetailOpen,
    closeProductDetail,
  } = useProductDetail();

  const { addToCart } = useCart();

  const {
    isWishlisted,
    toggleWishlist,
  } = useWishlist();

  const [selectedOption, setSelectedOption] =
    useState<ProductDetailOption | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!selectedProduct) return;

    const initialOption =
      selectedProduct.options?.find(
        (option) =>
          option.label === selectedProduct.option
      ) ??
      selectedProduct.options?.[0] ??
      null;

    setSelectedOption(initialOption);
    setQuantity(1);
    setAdded(false);
  }, [selectedProduct]);

  useEffect(() => {
    if (!productDetailOpen) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeProductDetail();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [
    productDetailOpen,
    closeProductDetail,
  ]);

  if (!selectedProduct) {
    return null;
  }

  const currentPrice =
    selectedOption?.price ??
    selectedProduct.price;

  const totalPrice =
    currentPrice * quantity;

  const productId = `${selectedProduct.name}-${
    selectedOption?.label ?? "default"
  }`;

  const wishlisted =
    isWishlisted(productId);

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      name: selectedProduct.name,
      image: selectedProduct.image,
      price: currentPrice,
      option: selectedOption?.label,
    });

    if (quantity > 1) {
      for (
        let index = 1;
        index < quantity;
        index += 1
      ) {
        addToCart({
          id: productId,
          name: selectedProduct.name,
          image: selectedProduct.image,
          price: currentPrice,
          option: selectedOption?.label,
        });
      }
    }

    setAdded(true);
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: productId,
      name: selectedProduct.name,
      image: selectedProduct.image,
      price: currentPrice,
      option: selectedOption?.label,
    });
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
    setAdded(false);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );

    setAdded(false);
  };

  return (
    <AnimatePresence>
      {productDetailOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeProductDetail}
            className="fixed inset-0 z-[80] bg-[#321719]/45 backdrop-blur-[5px]"
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 35,
              scale: 0.985,
            }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed inset-x-3 bottom-3 top-3 z-[90] overflow-hidden rounded-[2rem] border border-[#ead8d2] bg-[#fffaf7] shadow-[0_30px_100px_rgba(50,23,25,0.25)] sm:inset-x-6 sm:bottom-6 sm:top-6 lg:left-auto lg:right-6 lg:w-[min(1050px,calc(100vw-48px))]"
          >
            <div className="flex h-full flex-col">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#ead8d2] px-5 sm:px-7">
                <div>
                  <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-[#8d4b50]">
                    Ayosa Beauty
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#a28787]">
                    Product Details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeProductDetail}
                  aria-label="Close product details"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4d2cc] bg-[#fffaf7] text-[#651f25] transition-all duration-300 hover:border-[#651f25] hover:bg-[#651f25] hover:text-white active:scale-95"
                >
                  <X
                    size={17}
                    strokeWidth={1.4}
                  />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid min-h-full lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-[#f3e9e4] lg:min-h-full">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9),rgba(243,233,228,0)_70%)]" />

                    <div className="pointer-events-none absolute left-8 top-8 h-32 w-32 rounded-full border border-[#d8bcb5]/50" />

                    <div className="pointer-events-none absolute bottom-8 right-8 h-48 w-48 rounded-full border border-[#d8bcb5]/35" />

                    <motion.img
                      key={selectedProduct.image}
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.45,
                      }}
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="relative z-10 max-h-[460px] w-full object-contain p-8 sm:p-12 lg:max-h-[620px] lg:p-16"
                    />

                    <div className="absolute bottom-5 left-5 rounded-full border border-[#dfc8c1] bg-[#fffaf7]/85 px-4 py-2 backdrop-blur-sm">
                      <span className="text-[8px] uppercase tracking-[0.2em] text-[#80696a]">
                        Authentic Beauty
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#8d4b50]">
                        Curated for you
                      </p>

                      <h2 className="mt-4 font-serif text-3xl leading-[1.08] text-[#54252a] sm:text-4xl lg:text-[42px]">
                        {selectedProduct.name}
                      </h2>

                      <div className="mt-5 h-px w-14 bg-[#b98689]" />

                      <p className="mt-6 text-sm leading-7 text-[#80696a]">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {selectedProduct.options &&
                      selectedProduct.options.length >
                        0 && (
                        <div className="mt-8">
                          <label className="mb-2 block text-[8px] font-medium uppercase tracking-[0.2em] text-[#967879]">
                            Select size
                          </label>

                          <div className="relative">
                            <select
                              value={
                                selectedOption?.label ??
                                ""
                              }
                              onChange={(event) => {
                                const option =
                                  selectedProduct.options?.find(
                                    (item) =>
                                      item.label ===
                                      event.target.value
                                  );

                                if (option) {
                                  setSelectedOption(
                                    option
                                  );
                                  setAdded(false);
                                }
                              }}
                              className="w-full appearance-none rounded-xl border border-[#dfc8c1] bg-[#fffaf7] px-4 py-3.5 pr-11 text-xs text-[#54252a] outline-none transition focus:border-[#8d4b50] focus:ring-2 focus:ring-[#8d4b50]/10"
                            >
                              {selectedProduct.options.map(
                                (option) => (
                                  <option
                                    key={option.label}
                                    value={option.label}
                                  >
                                    {option.label} · GHC{" "}
                                    {option.price.toFixed(2)}
                                  </option>
                                )
                              )}
                            </select>

                            <ChevronDown
                              size={15}
                              strokeWidth={1.4}
                              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8d4b50]"
                            />
                          </div>
                        </div>
                      )}

                    <div className="mt-8 flex items-end justify-between border-y border-[#ead8d2] py-6">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-[#9a7c7d]">
                          Price
                        </p>

                        <p className="mt-2 font-serif text-3xl text-[#651f25]">
                          GHC{" "}
                          {currentPrice.toFixed(2)}
                        </p>

                        {quantity > 1 && (
                          <p className="mt-2 text-[10px] text-[#967879]">
                            {quantity} × GHC{" "}
                            {currentPrice.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleWishlist}
                        aria-label={
                          wishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        aria-pressed={wishlisted}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 ${
                          wishlisted
                            ? "border-[#651f25] bg-[#651f25] text-white"
                            : "border-[#dfc8c1] bg-[#fffaf7] text-[#651f25] hover:border-[#651f25]"
                        }`}
                      >
                        <Heart
                          size={17}
                          strokeWidth={1.4}
                          fill={
                            wishlisted
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    <div className="mt-7">
                      <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-[#967879]">
                        Quantity
                      </p>

                      <div className="mt-3 flex h-12 w-fit items-center rounded-full border border-[#dfc8c1] bg-[#fffaf7]">
                        <button
                          type="button"
                          onClick={decreaseQuantity}
                          disabled={quantity === 1}
                          aria-label="Decrease quantity"
                          className="flex h-full w-12 items-center justify-center text-[#651f25] transition hover:bg-[#f3e9e4] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Minus
                            size={14}
                            strokeWidth={1.5}
                          />
                        </button>

                        <span className="flex w-10 justify-center font-serif text-lg text-[#54252a]">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={increaseQuantity}
                          aria-label="Increase quantity"
                          className="flex h-full w-12 items-center justify-center text-[#651f25] transition hover:bg-[#f3e9e4]"
                        >
                          <Plus
                            size={14}
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-7">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-[#967879]">
                          Total
                        </span>

                        <span className="font-serif text-xl text-[#651f25]">
                          GHC{" "}
                          {totalPrice.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`flex h-14 w-full items-center justify-center gap-3 rounded-full px-6 text-[9px] font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 active:scale-[0.98] ${
                          added
                            ? "bg-[#8d4b50]"
                            : "bg-[#651f25] hover:bg-[#7c3037] hover:shadow-[0_15px_35px_rgba(101,31,37,0.22)]"
                        }`}
                      >
                        {added ? (
                          <>
                            <Check
                              size={15}
                              strokeWidth={1.7}
                            />
                            Added to Bag
                          </>
                        ) : (
                          <>
                            <ShoppingBag
                              size={15}
                              strokeWidth={1.4}
                            />
                            Add to Bag
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-[#ead8d2] bg-[#f8eee9] px-4 py-4">
                        <p className="text-[8px] uppercase tracking-[0.18em] text-[#967879]">
                          Quality
                        </p>

                        <p className="mt-2 font-serif text-sm text-[#54252a]">
                          Carefully selected
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#ead8d2] bg-[#f8eee9] px-4 py-4">
                        <p className="text-[8px] uppercase tracking-[0.18em] text-[#967879]">
                          Shopping
                        </p>

                        <p className="mt-2 font-serif text-sm text-[#54252a]">
                          Premium experience
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 border-t border-[#ead8d2] pt-7">
                      <p className="font-serif text-lg italic text-[#651f25]">
                        Driven by quality.
                      </p>

                      <p className="mt-2 text-[11px] leading-5 text-[#967879]">
                        Chosen by those who know
                        the difference.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}