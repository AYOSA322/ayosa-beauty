"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  UserRound,
  X,
  ArrowRight,
  LogOut,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import { useCart } from "./CartContext";
import { useSearch } from "./SearchContext";
import { useWishlist } from "./WishlistContext";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default function Navbar() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
  } = useWishlist();

  const {
    searchOpen,
    searchQuery,
    openSearch,
    closeSearch,
    setSearchQuery,
  } = useSearch();

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [cartOpen, setCartOpen] =
    useState(false);

  const [wishlistOpen, setWishlistOpen] =
    useState(false);

  const [mode, setMode] = useState<
    "signin" | "create"
  >("signin");

  const [userEmail, setUserEmail] =
    useState<string | null>(null);

  const [customerName, setCustomerName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [authMessage, setAuthMessage] =
    useState("");

  const [authError, setAuthError] =
    useState("");

  const [verificationStep, setVerificationStep] =
    useState(false);

  const [verificationCode, setVerificationCode] =
    useState("");

  const [resendCooldown, setResendCooldown] =
    useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? null);

        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "";

        setCustomerName(name);
        setEmail(user.email ?? "");
      }
    };

    loadUser();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          const user = session?.user;

          setUserEmail(
            user?.email ?? null
          );

          setEmail(user?.email ?? "");

          const name =
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            "";

          setCustomerName(name);
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (
      !searchOpen &&
      !accountOpen &&
      !cartOpen &&
      !wishlistOpen
    ) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    searchOpen,
    accountOpen,
    cartOpen,
    wishlistOpen,
  ]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const openAccount = (
    selectedMode: "signin" | "create"
  ) => {
    setMode(selectedMode);
    setAuthMessage("");
    setAuthError("");
    setPassword("");
    setVerificationStep(false);
    setVerificationCode("");
    setResendCooldown(0);
    setAccountOpen(true);
  };

  const handleAuthSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setAuthMessage("");
    setAuthError("");

    try {
      if (!email.trim() || !password) {
        setAuthError("Please enter your email and password.");
        return;
      }

      if (mode === "create") {
        if (!customerName.trim()) {
          setAuthError("Please enter your name.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: customerName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setVerificationStep(true);
          setVerificationCode("");
          setAuthMessage("");
          setPassword("");
          setResendCooldown(60);
        } else {
          setUserEmail(data.user?.email ?? null);
          setAuthMessage("Your Ayosa Beauty account has been created.");
          setPassword("");
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        setUserEmail(data.user?.email ?? null);
        setCustomerName(data.user?.user_metadata?.full_name || "");
        setAuthMessage("Welcome back to Ayosa Beauty.");
        setPassword("");
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const code = verificationCode.replace(/\D/g, "");

    if (code.length !== 6) {
      setAuthError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "signup",
      });

      if (error) throw error;

      setVerificationStep(false);
      setVerificationCode("");
      setUserEmail(data.user?.email ?? email.trim());
      setCustomerName(
        data.user?.user_metadata?.full_name || customerName
      );
      setAuthMessage("Your email has been verified. Welcome to Ayosa Beauty.");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "That code is incorrect or has expired. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email.trim()) return;

    setLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) throw error;

      setResendCooldown(60);
      setAuthMessage("A fresh verification code is on its way.");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "We could not resend the code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUserEmail(null);
    setCustomerName("");
    setEmail("");
    setPassword("");
    setVerificationStep(false);
    setVerificationCode("");
    setResendCooldown(0);
    setAccountOpen(false);
    setAuthMessage("");
    setAuthError("");
  };

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    closeSearch(false);

    window.setTimeout(() => {
      document
        .getElementById("search-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const handlePopularSearch = (
    term: string
  ) => {
    setSearchQuery(term);
  };

  return (
    <>
      {/* NAVBAR */}

      <header className="sticky top-0 z-40 border-b border-[#ead8d2]/80 bg-[#f8f0ec]/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 md:px-8">

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#shop"
              className="text-[11px] uppercase tracking-[0.18em] text-[#54252a] transition hover:text-[#8d4b50]"
            >
              Shop
            </a>

            <a
              href="#about"
              className="text-[11px] uppercase tracking-[0.18em] text-[#54252a] transition hover:text-[#8d4b50]"
            >
              About
            </a>

            <a
              href="#contact"
              className="text-[11px] uppercase tracking-[0.18em] text-[#54252a] transition hover:text-[#8d4b50]"
            >
              Contact
            </a>
          </div>

          <div className="w-20 md:hidden" />

          <a
            href="#top"
            className="absolute left-1/2 -translate-x-1/2 text-center"
          >
            <div className="font-serif text-[34px] leading-none text-[#70272d] md:text-4xl">
              AY
            </div>

            <div className="mt-1 text-[8px] tracking-[0.34em] text-[#70272d] md:text-[10px]">
              AYOSA BEAUTY
            </div>
          </a>

          <div className="flex items-center gap-1 text-[#54252a] md:gap-3">

            {/* SEARCH */}

            <button
              type="button"
              aria-label="Search"
              onClick={openSearch}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#ead8d2]/50 hover:text-[#8d4b50]"
            >
              <Search
                size={19}
                strokeWidth={1.4}
              />
            </button>

            {/* WISHLIST */}

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() =>
                setWishlistOpen(true)
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#ead8d2]/50 hover:text-[#8d4b50]"
            >
              <Heart
                size={19}
                strokeWidth={1.4}
              />

              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#651f25] px-1 text-[8px] font-medium text-white">
                  {wishlistCount > 99
                    ? "99+"
                    : wishlistCount}
                </span>
              )}
            </button>

            {/* ACCOUNT */}

            <button
              type="button"
              aria-label="Account"
              onClick={() =>
                openAccount(
                  userEmail
                    ? "signin"
                    : "signin"
                )
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#ead8d2]/50 hover:text-[#8d4b50]"
            >
              <UserRound
                size={19}
                strokeWidth={1.4}
              />
            </button>

            {/* CART */}

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={() =>
                setCartOpen(true)
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#ead8d2]/50 hover:text-[#8d4b50]"
            >
              <ShoppingBag
                size={19}
                strokeWidth={1.4}
              />

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#651f25] px-1 text-[8px] font-medium text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </button>

          </div>
        </nav>
      </header>

      {/* SEARCH MODAL */}

      {searchOpen && (
        <div
          className="fixed inset-0 z-[110] bg-[#351619]/35 px-4 pt-6 backdrop-blur-md md:pt-10"
          onClick={() => closeSearch()}
        >
          <div
            className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#ead8d2] bg-[#fbf5f1] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center gap-4 border-b border-[#ead8d2] px-6 py-5">
              <Search
                size={21}
                className="text-[#8d4b50]"
              />

              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-1"
              >
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search skincare, haircare, body care..."
                  className="w-full bg-transparent font-serif text-xl text-[#54252a] outline-none placeholder:text-[#b49b9a]"
                />
              </form>

              <button
                type="button"
                onClick={() =>
                  closeSearch()
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ead8d2]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-7">
              {searchQuery.trim() ? (
                <div>
                  <p className="text-sm text-[#80696a]">
                    Search for products by
                    name or description.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      closeSearch(false);

                      window.setTimeout(
                        () => {
                          document
                            .getElementById(
                              "search-results"
                            )
                            ?.scrollIntoView({
                              behavior:
                                "smooth",
                            });
                        },
                        100
                      );
                    }}
                    className="mt-5 flex items-center gap-2 rounded-full bg-[#651f25] px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white"
                  >
                    View Results
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#9a7c7d]">
                    Explore Collections
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Skincare",
                      "Haircare",
                      "Body Care",
                    ].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() =>
                          handlePopularSearch(
                            term
                          )
                        }
                        className="rounded-full border border-[#dfc8c1] bg-[#fffaf7] px-5 py-2.5 text-[9px] uppercase tracking-[0.14em] text-[#651f25]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WISHLIST */}

      {wishlistOpen && (
        <div
          className="fixed inset-0 z-[95] bg-[#351619]/30 backdrop-blur-sm"
          onClick={() =>
            setWishlistOpen(false)
          }
        >
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbf5f1] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-[#ead8d2] px-6 py-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#8d4b50]">
                  Ayosa Beauty
                </p>

                <h2 className="mt-2 font-serif text-3xl text-[#54252a]">
                  Wishlist
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setWishlistOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8d2]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {wishlistItems.length ===
              0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Heart
                    size={28}
                    className="text-[#8d4b50]"
                  />

                  <p className="mt-7 font-serif text-2xl text-[#54252a]">
                    Your wishlist is empty
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setWishlistOpen(false)
                    }
                    className="mt-7 rounded-full bg-[#651f25] px-7 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.5rem] border border-[#ead8d2] bg-[#fffaf7] p-4"
                      >
                        <div className="flex gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3e9e4]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain p-2"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-serif text-[17px] text-[#54252a]">
                                {item.name}
                              </h3>

                              <button
                                type="button"
                                onClick={() =>
                                  removeFromWishlist(
                                    item.id
                                  )
                                }
                                className="text-[#651f25]"
                              >
                                <Heart
                                  size={17}
                                  fill="currentColor"
                                />
                              </button>
                            </div>

                            {item.option && (
                              <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#9a7c7d]">
                                {item.option}
                              </p>
                            )}

                            <p className="mt-3 font-serif text-lg text-[#651f25]">
                              GHC{" "}
                              {item.price.toFixed(
                                2
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* SHOPPING BAG */}

      {cartOpen && (
        <div
          className="fixed inset-0 z-[90] bg-[#351619]/30 backdrop-blur-sm"
          onClick={() =>
            setCartOpen(false)
          }
        >
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbf5f1] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-[#ead8d2] px-6 py-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#8d4b50]">
                  Ayosa Beauty
                </p>

                <h2 className="mt-2 font-serif text-3xl text-[#54252a]">
                  Your Bag
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCartOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8d2]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag
                    size={28}
                    className="text-[#8d4b50]"
                  />

                  <p className="mt-7 font-serif text-2xl text-[#54252a]">
                    Your bag is empty
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setCartOpen(false)
                    }
                    className="mt-7 rounded-full bg-[#651f25] px-7 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cartItems.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.5rem] border border-[#ead8d2] bg-[#fffaf7] p-4"
                      >
                        <div className="flex gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3e9e4]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain p-2"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-serif text-[17px] text-[#54252a]">
                                {item.name}
                              </h3>

                              <button
                                type="button"
                                onClick={() =>
                                  removeFromCart(
                                    item.id
                                  )
                                }
                                className="text-[#651f25]"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {item.option && (
                              <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#9a7c7d]">
                                {item.option}
                              </p>
                            )}

                            <p className="mt-3 font-serif text-lg text-[#651f25]">
                              GHC{" "}
                              {(
                                item.price *
                                item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#ead8d2] pt-4">
                          <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7c7d]">
                            Quantity
                          </p>

                          <div className="flex items-center rounded-full border border-[#dfc8c1]">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity -
                                    1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="min-w-[30px] text-center text-xs">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity +
                                    1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-[#ead8d2] bg-[#f8eee9] px-6 py-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#80696a]">
                    Subtotal
                  </span>

                  <span className="font-serif text-2xl text-[#651f25]">
                    GHC{" "}
                    {cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    window.location.href =
                      "/checkout";
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#651f25] py-4 text-[9px] uppercase tracking-[0.18em] text-white"
                >
                  Proceed to Checkout
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ACCOUNT POPUP */}

      {accountOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#351619]/30 px-5 backdrop-blur-sm"
          onClick={() =>
            setAccountOpen(false)
          }
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#ead8d2] bg-[#fbf5f1] shadow-[0_30px_100px_rgba(84,37,42,0.22)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              aria-label="Close account"
              onClick={() =>
                setAccountOpen(false)
              }
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#ead8d2] bg-[#fffaf7] text-[#651f25]"
            >
              <X size={17} />
            </button>

            <div className="px-7 pb-8 pt-10 md:px-10">

              <div className="text-center">
                <div className="font-serif text-4xl text-[#70272d]">
                  AY
                </div>

                <p className="mt-4 text-[9px] uppercase tracking-[0.3em] text-[#8d4b50]">
                  Your Ayosa Account
                </p>

                <h2 className="mt-3 font-serif text-3xl text-[#54252a]">
                  {userEmail
                    ? `Welcome back`
                    : mode === "signin"
                    ? "Welcome back"
                    : "Create your account"}
                </h2>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#80696a]">
                  {userEmail
                    ? userEmail
                    : "Save your details and enjoy a smoother Ayosa Beauty shopping experience."}
                </p>
              </div>

              {verificationStep ? (
                <div className="mt-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f1c8d4] to-[#d98da8] text-white shadow-lg shadow-[#c9879f]/25">
                    <span className="text-2xl">✦</span>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-[9px] uppercase tracking-[0.28em] text-[#a66b7d]">
                      Almost there, beautiful
                    </p>
                    <h3 className="mt-3 font-serif text-3xl text-[#54252a]">
                      Check your inbox
                    </h3>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#80696a]">
                      We sent a 6-digit verification code to
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-[#651f25]">
                      {email}
                    </p>
                  </div>

                  {authError && (
                    <div className="mt-5 rounded-2xl border border-[#e8b7c4] bg-[#fff0f4] px-4 py-3 text-center text-sm leading-5 text-[#9a405d]">
                      {authError}
                    </div>
                  )}

                  {authMessage && (
                    <div className="mt-5 rounded-2xl border border-[#ead8d2] bg-[#fffaf7] px-4 py-3 text-center text-sm leading-5 text-[#7b5b61]">
                      {authMessage}
                    </div>
                  )}

                  <form onSubmit={handleVerifyCode} className="mt-7">
                    <label className="mb-3 block text-center text-[9px] uppercase tracking-[0.2em] text-[#8d6f70]">
                      Verification code
                    </label>

                    <input
                      autoFocus
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(event) =>
                        setVerificationCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      placeholder="000000"
                      className="w-full rounded-2xl border border-[#e5c7cf] bg-white px-4 py-5 text-center font-serif text-3xl tracking-[0.38em] text-[#651f25] outline-none shadow-[0_8px_30px_rgba(165,91,116,0.08)] placeholder:text-[#d7bdc5] focus:border-[#c9829b] focus:ring-4 focus:ring-[#f3dce4]"
                    />

                    <button
                      type="submit"
                      disabled={loading || verificationCode.length !== 6}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b96f88] to-[#8f4d65] py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white shadow-lg shadow-[#b96f88]/20 transition hover:from-[#a95f79] hover:to-[#7f4058] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify My Email"}
                      {!loading && <ArrowRight size={15} strokeWidth={1.5} />}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-xs text-[#9a7c7d]">
                      Didn't receive your code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading || resendCooldown > 0}
                      className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9a536c] transition hover:text-[#651f25] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend verification code"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setVerificationStep(false);
                      setVerificationCode("");
                      setAuthError("");
                      setAuthMessage("");
                    }}
                    className="mt-6 block w-full text-center text-[9px] uppercase tracking-[0.16em] text-[#9a7c7d] transition hover:text-[#651f25]"
                  >
                    Back to account details
                  </button>
                </div>
              ) : userEmail ? (
                <div className="mt-8">
                  <div className="rounded-2xl border border-[#ead8d2] bg-[#fffaf7] p-5">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7c7d]">
                      Account email
                    </p>
                    <p className="mt-2 text-sm text-[#54252a]">
                      {userEmail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#651f25] py-3.5 text-[10px] uppercase tracking-[0.18em] text-[#651f25] transition hover:bg-[#651f25] hover:text-white"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-8 flex rounded-full border border-[#ead8d2] bg-[#f4e8e2] p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setAuthError("");
                        setAuthMessage("");
                      }}
                      className={`flex-1 rounded-full py-2.5 text-[9px] uppercase tracking-[0.16em] transition ${
                        mode === "signin"
                          ? "bg-[#651f25] text-white"
                          : "text-[#80696a]"
                      }`}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("create");
                        setAuthError("");
                        setAuthMessage("");
                      }}
                      className={`flex-1 rounded-full py-2.5 text-[9px] uppercase tracking-[0.16em] transition ${
                        mode === "create"
                          ? "bg-[#651f25] text-white"
                          : "text-[#80696a]"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {authMessage && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-700">
                      {authMessage}
                    </div>
                  )}

                  {authError && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="mt-7">
                    {mode === "create" && (
                      <div className="mb-4">
                        <label className="mb-2 block text-[9px] uppercase tracking-[0.16em] text-[#8d6f70]">
                          Your name
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(event) => setCustomerName(event.target.value)}
                          placeholder="Enter your name"
                          className="w-full rounded-xl border border-[#dfc8c1] bg-[#fffaf7] px-4 py-3.5 text-sm text-[#54252a] outline-none placeholder:text-[#b39b9a] focus:border-[#8d4b50]"
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="mb-2 block text-[9px] uppercase tracking-[0.16em] text-[#8d6f70]">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl border border-[#dfc8c1] bg-[#fffaf7] px-4 py-3.5 text-sm text-[#54252a] outline-none placeholder:text-[#b39b9a] focus:border-[#8d4b50]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[9px] uppercase tracking-[0.16em] text-[#8d6f70]">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-[#dfc8c1] bg-[#fffaf7] px-4 py-3.5 text-sm text-[#54252a] outline-none placeholder:text-[#b39b9a] focus:border-[#8d4b50]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#651f25] py-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#7c3037] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                      {!loading && <ArrowRight size={15} strokeWidth={1.5} />}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}