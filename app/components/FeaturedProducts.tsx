"use client";

import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    name: "NIVEA Rich Nourishing Body Lotion",
    size: "400ml",
    category: "Body Care",
    price: 79.99,
    image: "/images/nivea-rich-nourishing-body-lotion.jpg",
    description:
      "A rich moisturising body lotion designed to nourish dry to very dry skin and leave it feeling soft and cared for.",
  },
  {
    name: "Dove Original Beauty Bar",
    size: "90g",
    category: "Body Care",
    price: 29.99,
    image: "/images/dove-original-beauty-bar.jpg",
    description:
      "A gentle beauty bar with moisturising cream that cleanses the skin while helping it feel soft and smooth.",
  },
  {
    name: "Dr Teal's Citrus Radiant Body Lotion",
    size: "532ml",
    category: "Body Care",
    price: 129.99,
    image: "/images/dr-teals-citrus-radiant-body-lotion.jpg",
    description:
      "A nourishing body lotion with a refreshing citrus scent, designed to moisturise and leave skin feeling soft and radiant.",
  },
  {
    name: "Dove Go Fresh Cucumber & Green Tea Antiperspirant Spray",
    size: "150ml",
    category: "Body Care",
    price: 49.99,
    image: "/images/dove-go-fresh-cucumber-green-tea.jpg",
    description:
      "A fresh cucumber and green tea antiperspirant spray created to keep you feeling fresh and confident throughout the day.",
  },
  {
    name: "Olay Dark Spot Correcting Body Lotion",
    size: "502ml",
    category: "Body Care",
    price: 249.99,
    image: "/images/olay-dark-spot-correcting-body-lotion.jpg",
    description:
      "A targeted body lotion formulated with AHA, vitamin C and niacinamide to help improve the appearance of uneven tone and dark spots.",
  },
  {
    name: "NIVEA Q10 Firming Body Lotion",
    size: "250ml",
    category: "Body Care",
    price: 99.99,
    image: "/images/nivea-q10-firming-body-lotion.jpg",
    description:
      "A moisturising body lotion enriched with Q10 and vitamin C, designed to leave skin feeling firmer, smoother and hydrated.",
  },
  {
    name: "NIVEA Radiant & Beauty Advanced Care Lotion",
    size: "400ml",
    category: "Body Care",
    price: 89.99,
    image: "/images/nivea-radiant-beauty-advanced-care.jpg",
    description:
      "A deeply nourishing body lotion created to provide long-lasting moisture while helping skin look smoother and more radiant.",
  },
  {
    name: "Dove Deeply Nourishing Shower Gel",
    size: "500ml",
    category: "Body Care",
    price: 89.99,
    image: "/images/dove-deeply-nourishing-shower-gel.jpg",
    description:
      "A nourishing shower gel with Dove's moisturising care, leaving the skin feeling clean, soft and comfortably hydrated.",
  },
  {
    name: "Palmer's Skin Success Fade Milk Lotion",
    size: "250ml",
    category: "Body Care",
    price: 159.99,
    image: "/images/palmers-skin-success-fade-milk.jpg",
    description:
      "A tone-correcting body lotion with vitamin E, niacinamide, retinol and vitamin C designed to improve the appearance of uneven skin tone and dark spots.",
  },
  {
    name: "Palmer's Cocoa Butter Body Oil",
    size: "250ml",
    category: "Body Care",
    price: 79.99,
    image: "/images/palmers-cocoa-butter-body-oil.jpg",
    description:
      "A nourishing cocoa butter body oil enriched with vitamin E to moisturise, soften and replenish dry skin.",
  },
  {
    name: "Irish Spring Moisture Blast Face & Body Wash",
    size: "591ml",
    category: "Skincare",
    price: 89.99,
    image: "/images/irish-spring-moisture-blast.jpg",
    description:
      "A refreshing moisturising wash designed for both face and body, helping leave skin feeling clean, fresh and hydrated.",
  },
  {
    name: "Dr Teal's Glow & Radiance Body Wash",
    size: "710ml",
    category: "Skincare",
    price: 129.99,
    image: "/images/dr-teals-glow-radiance-body-wash.jpg",
    description:
      "A refreshing body wash with vitamin C and citrus essential oils, created to cleanse the skin while supporting a fresh, radiant feel.",
  },
  {
    name: "Palmer's Cocoa Butter Jar",
    size: "100g",
    category: "Body Care",
    price: 139.99,
    image: "/images/palmers-cocoa-butter-jar.jpg",
    description:
      "A classic cocoa butter moisturiser with vitamin E designed to help soften, smooth and deeply moisturise dry skin.",
  },
  {
    name: "Vaseline Cocoa Radiant Body Oil",
    size: "200ml",
    category: "Body Care",
    price: 119.99,
    image: "/images/vaseline-cocoa-radiant-body-oil.jpg",
    description:
      "A lightweight cocoa-infused body oil that helps moisturise the skin and leave it looking smooth and radiant.",
  },
];

export default function FeaturedProducts() {
  return (
    <section
      id="products"
      className="bg-[#f8eee9] px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-7xl">

        {/* SECTION HEADING */}
        <div className="mb-14 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#9a5559]">
            Our Collection
          </p>

          <h2 className="mt-3 font-serif text-4xl text-[#61252b] md:text-5xl">
            Beauty Essentials
          </h2>

          <div className="mx-auto mt-5 h-px w-12 bg-[#b98b84]" />

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#806365]">
            Carefully selected beauty essentials from trusted brands,
            chosen to help you care for your skin and feel your best.
          </p>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">

          {products.map((product, index) => (
            <motion.article
              key={product.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.6,
                delay: (index % 4) * 0.08,
              }}
              className="group"
            >
              {/* PRODUCT IMAGE */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[#ead9d2]">

                <img
                  src={product.image}
                  alt={`${product.name} ${product.size}`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* WISHLIST */}
                <button
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f8eee9]/90 text-[#70272d] shadow-sm backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-white"
                >
                  <Heart
                    size={17}
                    strokeWidth={1.5}
                  />
                </button>

                {/* ADD TO BAG */}
                <button
                  type="button"
                  className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 bg-[#69262c] py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white opacity-0 transition duration-500 group-hover:opacity-100"
                >
                  <Plus
                    size={14}
                    strokeWidth={1.5}
                  />

                  Add to Bag
                </button>
              </div>

              {/* PRODUCT INFORMATION */}
              <div className="pt-5 text-center">

                <p className="text-[9px] uppercase tracking-[0.3em] text-[#a36b6d]">
                  {product.category}
                </p>

                <h3 className="mt-2 font-serif text-lg leading-6 text-[#61252b]">
                  {product.name}
                </h3>

                <p className="mt-1 text-xs text-[#a36b6d]">
                  {product.size}
                </p>

                <p className="mt-3 text-sm font-medium text-[#61252b]">
                  GHC {product.price.toFixed(2)}
                </p>

                <p className="mx-auto mt-3 max-w-[260px] text-xs leading-5 text-[#806365]">
                  {product.description}
                </p>

              </div>
            </motion.article>
          ))}

        </div>

        {/* VIEW ALL PRODUCTS */}
        <div className="mt-16 text-center">
          <button
            type="button"
            className="border border-[#7d3037] px-9 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#70272d] transition duration-300 hover:bg-[#70272d] hover:text-white"
          >
            View All Products
          </button>
        </div>

      </div>
    </section>
  );
}