import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Benefits from "./components/Benefits";
import Categories from "./components/Categories";
import BrandStory from "./components/BrandStory";
import ProductSections from "./components/ProductSections";
import AboutFooter from "./components/AboutFooter";
import ProductDetailModal from "./components/ProductDetailModal";
import { SearchProvider } from "./components/SearchContext";
import { CartProvider } from "./components/CartContext";
import { WishlistProvider } from "./components/WishlistContext";
import { ProductDetailProvider } from "./components/ProductDetailContext";

export default function Home() {
  return (
    <CartProvider>
      <WishlistProvider>
        <ProductDetailProvider>
          <SearchProvider>
            <main id="top">
              <AnnouncementBar />
              <Navbar />
              <Hero />
              <Benefits />
              <Categories />
              <BrandStory />
              <ProductSections />
              <AboutFooter />

              <ProductDetailModal />
            </main>
          </SearchProvider>
        </ProductDetailProvider>
      </WishlistProvider>
    </CartProvider>
  );
}