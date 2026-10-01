"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ShoppingBag,
  ChevronDown,
  Check,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "./CartContext";
import { useSearch } from "./SearchContext";
import { useWishlist } from "./WishlistContext";
import { useProductDetail } from "./ProductDetailContext";
import { createClient } from "../../lib/supabase";

type ProductOption = {
  label: string;
  price: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  options?: ProductOption[];
  badge?: string;
  category: string;
  sku?: string;
};

type DatabaseProduct = {
  id: number;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number | string | null;
  category_id: number | null;
  category: string | null;
  image_url: string | null;
  image: string | null;
  options: ProductOption[] | null;
  sku: string | null;
  status: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  featured: boolean | null;
  display_order: number | null;
};

type Section = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
};

function getProductBadge(product: DatabaseProduct): string | undefined {
  const name = product.name.toLowerCase();

  if (name.includes("shampoo") && name.includes("conditioner")) {
    return "Bundle";
  }

  if (name.includes("salicylic acid")) {
    return "Bestseller";
  }

  if (name.includes("got2b glued")) {
    return "Strong Hold";
  }

  return undefined;
}

function normalizeOptions(
  options: ProductOption[] | null
): ProductOption[] | undefined {
  if (!Array.isArray(options) || options.length === 0) {
    return undefined;
  }

  return options.filter(
    (option) =>
      option &&
      typeof option.label === "string" &&
      typeof option.price === "number"
  );
}

function normalizeProduct(
  product: DatabaseProduct
): Product | null {
  const image =
    product.image_url?.trim() ||
    product.image?.trim() ||
    "";

  if (!product.name || !image) {
    return null;
  }

  const category = product.category?.trim() || "";

  const description =
    product.description?.trim() ||
    product.short_description?.trim() ||
    "";

  const options = normalizeOptions(product.options);

  const numericPrice =
    product.price === null
      ? undefined
      : Number(product.price);

  return {
    id: String(product.id),
    name: product.name,
    description,
    image,
    price:
      numericPrice !== undefined &&
      Number.isFinite(numericPrice)
        ? numericPrice
        : undefined,
    options,
    badge: getProductBadge(product),
    category,
    sku: product.sku ?? undefined,
  };
}

function buildSections(
  products: Product[]
): Section[] {
  const skincareProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === "skincare"
  );

  const haircareProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === "haircare"
  );

  const bodyProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === "body"
  );

  return [
    {
      id: "skincare",
      eyebrow: "01 · Skincare Collection",
      title: "Skincare Products",
      description:
        "Thoughtfully selected essentials for cleansing, nourishing and caring for your skin.",
      products: skincareProducts,
    },
    {
      id: "haircare",
      eyebrow: "02 · Haircare Collection",
      title: "Haircare Products",
      description:
        "Trusted styling and hair-care essentials selected to help you care for, define and finish every look.",
      products: haircareProducts,
    },
    {
      id: "body",
      eyebrow: "03 · Body Collection",
      title: "Body Products",
      description:
        "Everyday body-care favourites chosen to make your self-care routine feel effortless and luxurious.",
      products: bodyProducts,
    },
  ];
}

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  const {
    isWishlisted,
    toggleWishlist,
  } = useWishlist();

  const { openProductDetail } =
    useProductDetail();

  const [selectedOption, setSelectedOption] =
    useState<ProductOption | null>(
      product.options?.[0] ?? null
    );

  const [added, setAdded] =
    useState(false);

  const currentPrice =
    selectedOption?.price ??
    product.price ??
    0;

  const productId = `${product.id}-${selectedOption?.label ?? "default"}`;

  const wishlisted =
    isWishlisted(productId);

  const handleOpenProductDetail = () => {
    openProductDetail({
      id: productId,
      name: product.name,
      description: product.description,
      image: product.image,
      price: currentPrice,
      option: selectedOption?.label,
      options: product.options,
    });
  };

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      name: product.name,
      image: product.image,
      price: currentPrice,
      option: selectedOption?.label,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: productId,
      name: product.name,
      image: product.image,
      price: currentPrice,
      option: selectedOption?.label,
    });
  };

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.55,
        ease: "easeOut",
      }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#ead8d2] bg-[#fffaf7] shadow-[0_5px_25px_rgba(84,37,42,0.035)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(84,37,42,0.10)]"
    >
      <div className="relative h-[350px] overflow-hidden bg-[#f3e9e4]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85),rgba(243,233,228,0)_72%)]" />

        <button
          type="button"
          onClick={handleOpenProductDetail}
          aria-label={`View details for ${product.name}`}
          className="absolute inset-0 z-10 cursor-pointer"
        >
          <span className="sr-only">
            View {product.name}
          </span>
        </button>

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="relative h-full w-full object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f3e9e4]/30 to-transparent" />

        {product.badge && (
          <div className="absolute left-5 top-5 rounded-full bg-[#651f25] px-4 py-2 text-[8px] font-medium uppercase tracking-[0.18em] text-[#fff8f4] shadow-sm">
            {product.badge}
          </div>
        )}

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          onClick={handleWishlist}
          className={`absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
            wishlisted
              ? "border-[#651f25] bg-[#651f25] text-white"
              : "border-[#e3d3ce] bg-[#fffaf7]/90 text-[#651f25] hover:bg-white"
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

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <button
          type="button"
          onClick={handleOpenProductDetail}
          className="text-left"
        >
          <h3 className="font-serif text-[21px] leading-[1.18] text-[#54252a] transition-colors duration-300 hover:text-[#8d4b50]">
            {product.name}
          </h3>
        </button>

        <p className="mt-4 text-[13px] leading-6 text-[#80696a]">
          {product.description}
        </p>

        {product.options && (
          <div className="mt-5">
            <label className="mb-2 block text-[8px] font-medium uppercase tracking-[0.2em] text-[#967879]">
              Select size
            </label>

            <div className="relative">
              <select
                value={
                  selectedOption?.label ?? ""
                }
                onChange={(event) => {
                  const option =
                    product.options?.find(
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
                className="relative z-20 w-full appearance-none rounded-xl border border-[#dfc8c1] bg-[#fffaf7] px-4 py-3 pr-10 text-xs text-[#54252a] outline-none transition focus:border-[#8d4b50] focus:ring-2 focus:ring-[#8d4b50]/10"
              >
                {product.options.map(
                  (option) => (
                    <option
                      key={option.label}
                      value={option.label}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.4}
                className="pointer-events-none absolute right-4 top-1/2 z-30 -translate-y-1/2 text-[#8d4b50]"
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#9a7c7d]">
              Price
            </p>

            <p className="mt-1 font-serif text-[25px] leading-none text-[#651f25]">
              GHC{" "}
              {currentPrice.toFixed(2)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`relative z-20 flex h-11 items-center gap-2 rounded-full px-5 text-[9px] font-medium uppercase tracking-[0.15em] text-white transition-all duration-300 active:scale-95 ${
              added
                ? "bg-[#8d4b50]"
                : "bg-[#651f25] hover:bg-[#7c3037] hover:shadow-[0_10px_25px_rgba(101,31,37,0.22)]"
            }`}
          >
            {added ? (
              <>
                <Check
                  size={14}
                  strokeWidth={1.7}
                />
                Added
              </>
            ) : (
              <>
                <ShoppingBag
                  size={14}
                  strokeWidth={1.4}
                />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function LoadingState() {
  return (
    <section className="bg-[#f8eee9] px-5 py-24 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <div className="h-3 w-32 animate-pulse rounded-full bg-[#ead8d2]" />

          <div className="mt-5 h-12 w-80 max-w-full animate-pulse rounded-xl bg-[#ead8d2]" />

          <div className="mt-5 h-5 w-full max-w-xl animate-pulse rounded-full bg-[#ead8d2]" />
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[1.75rem] border border-[#ead8d2] bg-[#fffaf7]"
              >
                <div className="h-[350px] animate-pulse bg-[#f0e3de]" />

                <div className="space-y-4 p-7">
                  <div className="h-6 w-4/5 animate-pulse rounded-lg bg-[#ead8d2]" />

                  <div className="h-4 w-full animate-pulse rounded-lg bg-[#ead8d2]" />

                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-[#ead8d2]" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <section className="bg-[#f8eee9] px-5 py-24 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#ead8d2] bg-[#fffaf7] px-6 py-16 text-center shadow-[0_10px_40px_rgba(84,37,42,0.05)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#ead8d2] bg-[#f4e8e2]">
          <Search
            size={23}
            strokeWidth={1.3}
            className="text-[#8d4b50]"
          />
        </div>

        <p className="mt-6 text-[9px] font-medium uppercase tracking-[0.3em] text-[#8d4b50]">
          Product Collection
        </p>

        <h2 className="mt-4 font-serif text-3xl text-[#54252a] md:text-4xl">
          We&apos;re preparing the collection
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#80696a]">
          We&apos;re unable to load the products
          right now. Please refresh the page and
          try again.
        </p>

        {message && (
          <p className="mx-auto mt-5 max-w-xl text-xs leading-6 text-[#9a7c7d]">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

export default function ProductSections() {
  const { searchQuery } = useSearch();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { data, error: fetchError } =
          await supabase
            .from("products")
            .select(
              `
                id,
                name,
                description,
                short_description,
                price,
                category_id,
                category,
                image_url,
                image,
                options,
                sku,
                status,
                is_active,
                is_featured,
                featured,
                display_order
              `
            )
            .eq("is_active", true)
            .order(
              "display_order",
              {
                ascending: true,
                nullsFirst: false,
              }
            );

        if (fetchError) {
          throw fetchError;
        }

        if (!mounted) {
          return;
        }

        const normalizedProducts =
          (data as DatabaseProduct[])
            .map(normalizeProduct)
            .filter(
              (
                product
              ): product is Product =>
                product !== null
            );

        setProducts(
          normalizedProducts
        );
      } catch (loadError) {
        console.error(
          "Unable to load Ayosa products:",
          loadError
        );

        if (!mounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load products."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const sections = useMemo(() => {
    return buildSections(products);
  }, [products]);

  const normalizedQuery =
    searchQuery.trim().toLowerCase();

  const allProducts = useMemo(() => {
    return sections.flatMap(
      (section) =>
        section.products.map(
          (product) => ({
            ...product,
            sectionId:
              section.id,
            sectionTitle:
              section.title,
          })
        )
    );
  }, [sections]);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return allProducts.filter(
      (product) => {
        const searchableText =
          `${product.name} ${product.description} ${product.category} ${product.sectionTitle}`.toLowerCase();

        return searchableText.includes(
          normalizedQuery
        );
      }
    );
  }, [
    allProducts,
    normalizedQuery,
  ]);

  const isSearching =
    normalizedQuery.length > 0;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
      />
    );
  }

  return (
    <section className="bg-[#f8eee9]">
      {isSearching ? (
        <div
          id="search-results"
          className="scroll-mt-24 px-5 py-24 md:px-10 md:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#8d4b50]">
                Search Results
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight text-[#54252a] md:text-5xl">
                Results for{" "}
                <span className="italic text-[#8d4b50]">
                  &quot;
                  {searchQuery}
                  &quot;
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#80696a] md:text-base">
                {searchResults.length ===
                0
                  ? "We couldn't find a product matching your search."
                  : `${searchResults.length} ${
                      searchResults.length ===
                      1
                        ? "product"
                        : "products"
                    } found across our collections.`}
              </p>
            </div>

            {searchResults.length >
            0 ? (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchResults.map(
                  (product) => (
                    <ProductCard
                      key={`${product.id}-${product.sectionId}`}
                      product={product}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="mt-14 rounded-[2rem] border border-[#ead8d2] bg-[#fffaf7] px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#ead8d2] bg-[#f4e8e2]">
                  <Search
                    size={23}
                    strokeWidth={1.3}
                    className="text-[#8d4b50]"
                  />
                </div>

                <h3 className="mt-6 font-serif text-2xl text-[#54252a]">
                  No products found
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#80696a]">
                  Try searching for a
                  brand, product name or
                  collection such as
                  skincare, haircare or
                  body care.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        sections.map(
          (
            section,
            sectionIndex
          ) => (
            <div
              key={section.id}
              id={section.id}
              className={`scroll-mt-24 px-5 py-24 md:px-10 md:py-28 ${
                sectionIndex !==
                sections.length - 1
                  ? "border-b border-[#dfc8c1]"
                  : ""
              }`}
            >
              <div className="mx-auto max-w-7xl">
                <div className="max-w-2xl">
                  <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#8d4b50]">
                    {section.eyebrow}
                  </p>

                  <h2 className="mt-4 font-serif text-4xl leading-tight text-[#54252a] md:text-5xl">
                    {section.title}
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-[#80696a] md:text-base">
                    {section.description}
                  </p>
                </div>

                {section.products.length >
                0 ? (
                  <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {section.products.map(
                      (product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-14 rounded-[2rem] border border-[#ead8d2] bg-[#fffaf7] px-6 py-16 text-center">
                    <h3 className="font-serif text-2xl text-[#54252a]">
                      Coming soon
                    </h3>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#80696a]">
                      This collection is
                      being prepared for
                      Ayosa Beauty.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        )
      )}
    </section>
  );
}