"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "../../../lib/supabase";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  category_id: number | null;
  category: string | null;
  image_url: string | null;
  image: string | null;
  options: unknown;
  sku: string | null;
  status: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  featured: boolean | null;
  stock: number | null;
  display_order: number | null;
};

type ProductForm = {
  name: string;
  description: string;
  short_description: string;
  price: string;
  category_id: string;
  image_url: string;
  sku: string;
  stock: string;
  is_active: boolean;
  is_featured: boolean;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  short_description: "",
  price: "",
  category_id: "",
  image_url: "",
  sku: "",
  stock: "",
  is_active: true,
  is_featured: false,
};

export default function AdminProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/admin";
      return;
    }

    await Promise.all([
      loadProducts(),
      loadCategories(),
    ]);
  };

  const loadProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
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
        stock,
        display_order
        `
      )
      .order("display_order", {
        ascending: true,
        nullsFirst: false,
      });

    if (error) {
      console.error("Unable to load products:", error);
      setErrorMessage(error.message);
    } else {
      setProducts((data as Product[]) ?? []);
    }

    setLoading(false);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Unable to load categories:", error);
      return;
    }

    setCategories((data as Category[]) ?? []);
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category_id?.toString() === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setErrorMessage("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      short_description: product.short_description ?? "",
      price:
        product.price !== null && product.price !== undefined
          ? String(product.price)
          : "",
      category_id:
        product.category_id !== null &&
        product.category_id !== undefined
          ? String(product.category_id)
          : "",
      image_url:
        product.image_url ??
        product.image ??
        "",
      sku: product.sku ?? "",
      stock:
        product.stock !== null &&
        product.stock !== undefined
          ? String(product.stock)
          : "",
      is_active: product.is_active !== false,
      is_featured:
        product.is_featured === true ||
        product.featured === true,
    });

    setMessage("");
    setErrorMessage("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setErrorMessage("");
  };

  const updateForm = (
    field: keyof ProductForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setMessage("");
    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Please enter a product name.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setErrorMessage("Please enter a valid price.");
      return;
    }

    if (!form.category_id) {
      setErrorMessage("Please select a category.");
      return;
    }

    setSaving(true);

    const selectedCategory = categories.find(
      (category) =>
        category.id.toString() === form.category_id
    );

    const price = Number(form.price);

    const stockValue =
      form.stock.trim() === ""
        ? null
        : Number(form.stock);

    if (
      stockValue !== null &&
      (!Number.isInteger(stockValue) || stockValue < 0)
    ) {
      setErrorMessage(
        "Stock must be a whole number of 0 or more."
      );
      setSaving(false);
      return;
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      short_description:
        form.short_description.trim() || null,
      price,
      category_id: Number(form.category_id),
      category: selectedCategory?.name ?? null,
      image_url: form.image_url.trim() || null,
      image: form.image_url.trim() || null,
      sku: form.sku.trim() || null,
      stock: stockValue,
      quantity: stockValue,
      is_active: form.is_active,
      is_featured: form.is_featured,
      featured: form.is_featured,
      status: form.is_active ? "active" : "inactive",
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        console.error("Unable to update product:", error);
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Product updated successfully.");
    } else {
      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) {
        console.error("Unable to create product:", error);
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Product added successfully.");
    }

    await loadProducts();

    setTimeout(() => {
      setModalOpen(false);
      setEditingProduct(null);
      setForm(EMPTY_FORM);
      setMessage("");
    }, 700);

    setSaving(false);
  };

  const toggleActive = async (product: Product) => {
    const newActiveState = !product.is_active;

    const { error } = await supabase
      .from("products")
      .update({
        is_active: newActiveState,
        status: newActiveState
          ? "active"
          : "inactive",
      })
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              is_active: newActiveState,
              status: newActiveState
                ? "active"
                : "inactive",
            }
          : item
      )
    );
  };

  const toggleFeatured = async (product: Product) => {
    const newFeaturedState =
      !(
        product.is_featured === true ||
        product.featured === true
      );

    const { error } = await supabase
      .from("products")
      .update({
        is_featured: newFeaturedState,
        featured: newFeaturedState,
      })
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              is_featured: newFeaturedState,
              featured: newFeaturedState,
            }
          : item
      )
    );
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setProducts((current) =>
      current.filter((item) => item.id !== product.id)
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  return (
    <main className="min-h-screen bg-[#f8f1ed] text-[#321d25]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#eadbd7]/80 bg-[#fffaf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9a6870]">
              Ayosa Beauty
            </p>

            <h1 className="mt-1 font-serif text-2xl sm:text-3xl">
              Products
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin/dashboard"
              className="hidden rounded-full border border-[#decac7] bg-white px-4 py-2.5 text-xs font-semibold text-[#713b4a] transition hover:bg-[#f8eeeb] sm:block"
            >
              Dashboard
            </a>

            <button
              onClick={handleLogout}
              className="rounded-full border border-[#decac7] bg-white px-4 py-2.5 text-xs font-semibold text-[#713b4a] transition hover:bg-[#f8eeeb]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* Page intro */}
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a6870]">
              Store management
            </p>

            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Product catalogue
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#80676d]">
              Add, edit and manage the products displayed across the
              Ayosa Beauty storefront.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#713b4a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(113,59,74,0.2)] transition hover:-translate-y-0.5 hover:bg-[#60303e]"
          >
            <Plus size={18} />
            Add product
          </button>
        </section>

        {/* Messages */}
        {errorMessage && !modalOpen && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{errorMessage}</span>

            <button
              onClick={() => setErrorMessage("")}
              className="shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <section className="mb-6 rounded-[1.5rem] border border-[#e7d8d4] bg-white/80 p-4 shadow-[0_12px_35px_rgba(70,35,45,0.05)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a18489]"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search products, SKU or category..."
                className="h-12 w-full rounded-xl border border-[#e5d6d2] bg-[#fffafa] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b29a9e] focus:border-[#b08289] focus:ring-4 focus:ring-[#b98289]/10"
              />
            </div>

            <div className="relative lg:w-64">
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="h-12 w-full appearance-none rounded-xl border border-[#e5d6d2] bg-[#fffafa] px-4 pr-10 text-sm text-[#594047] outline-none focus:border-[#b08289]"
              >
                <option value="all">
                  All categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98777e]"
              />
            </div>
          </div>
        </section>

        {/* Product table */}
        <section className="overflow-hidden rounded-[1.75rem] border border-[#e7d8d4] bg-white/80 shadow-[0_15px_45px_rgba(70,35,45,0.06)] backdrop-blur-xl">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-[#713b4a]"
                />

                <p className="mt-4 font-serif text-xl">
                  Loading products...
                </p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5e7e4] text-[#713b4a]">
                <Package size={27} strokeWidth={1.5} />
              </div>

              <h3 className="mt-5 font-serif text-2xl">
                No products found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#80676d]">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search or category filter."
                  : "Your catalogue is empty. Add your first product to get started."}
              </p>

              {!searchQuery &&
                categoryFilter === "all" && (
                  <button
                    onClick={openAddModal}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#713b4a] px-5 py-3 text-xs font-semibold text-white"
                  >
                    <Plus size={16} />
                    Add product
                  </button>
                )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-[#eadbd7] bg-[#fffaf8]">
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96777d]">
                        Product
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96777d]">
                        Category
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96777d]">
                        Price
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96777d]">
                        Status
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96777d]">
                        Featured
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#96777d]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => {
                      const active =
                        product.is_active !== false;

                      const featured =
                        product.is_featured === true ||
                        product.featured === true;

                      const image =
                        product.image_url ??
                        product.image;

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-[#eee2df] last:border-0"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#eadbd7] bg-[#f8f1ed]">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[#aa8b91]">
                                    <Package
                                      size={20}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="line-clamp-2 font-serif text-base text-[#321d25]">
                                  {product.name}
                                </p>

                                {product.sku && (
                                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#a1878c]">
                                    SKU: {product.sku}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-[#f5e9e6] px-3 py-1.5 text-xs text-[#713b4a]">
                              {product.category ??
                                "Uncategorized"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold text-[#4a2d36]">
                              GHC{" "}
                              {Number(
                                product.price
                              ).toFixed(2)}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              onClick={() =>
                                toggleActive(product)
                              }
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  active
                                    ? "bg-emerald-500"
                                    : "bg-gray-400"
                                }`}
                              />

                              {active
                                ? "Active"
                                : "Inactive"}
                            </button>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              onClick={() =>
                                toggleFeatured(product)
                              }
                              aria-label={
                                featured
                                  ? "Remove from featured"
                                  : "Mark as featured"
                              }
                              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                featured
                                  ? "border-[#d8b1b2] bg-[#f5e3e2] text-[#713b4a]"
                                  : "border-[#e4d7d4] text-[#b39a9f] hover:border-[#c9a7aa] hover:text-[#713b4a]"
                              }`}
                            >
                              <Star
                                size={16}
                                fill={
                                  featured
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View storefront"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4d7d4] text-[#8c7077] transition hover:border-[#c7a5a9] hover:bg-[#f8eeeb] hover:text-[#713b4a]"
                              >
                                <Eye size={16} />
                              </a>

                              <button
                                onClick={() =>
                                  openEditModal(
                                    product
                                  )
                                }
                                aria-label="Edit product"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4d7d4] text-[#8c7077] transition hover:border-[#c7a5a9] hover:bg-[#f8eeeb] hover:text-[#713b4a]"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  deleteProduct(
                                    product
                                  )
                                }
                                aria-label="Delete product"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ead8d5] text-[#ad777f] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile/tablet cards */}
              <div className="divide-y divide-[#eee2df] lg:hidden">
                {filteredProducts.map((product) => {
                  const active =
                    product.is_active !== false;

                  const featured =
                    product.is_featured === true ||
                    product.featured === true;

                  const image =
                    product.image_url ??
                    product.image;

                  return (
                    <div
                      key={product.id}
                      className="p-5 sm:p-6"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#eadbd7] bg-[#f8f1ed]">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#aa8b91]">
                              <Package size={22} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-serif text-lg leading-6">
                                {product.name}
                              </h3>

                              <p className="mt-1 text-xs text-[#80676d]">
                                {product.category ??
                                  "Uncategorized"}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                toggleFeatured(
                                  product
                                )
                              }
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                                featured
                                  ? "border-[#d8b1b2] bg-[#f5e3e2] text-[#713b4a]"
                                  : "border-[#e4d7d4] text-[#b39a9f]"
                              }`}
                            >
                              <Star
                                size={16}
                                fill={
                                  featured
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </div>

                          <p className="mt-3 font-semibold text-[#4a2d36]">
                            GHC{" "}
                            {Number(
                              product.price
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            toggleActive(product)
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              active
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          />

                          {active
                            ? "Active"
                            : "Inactive"}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openEditModal(product)
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-[#e4d7d4] px-4 py-2 text-xs font-semibold text-[#713b4a]"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteProduct(product)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ead8d5] text-[#ad777f]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <div className="mt-5 text-center text-xs text-[#9c8086]">
          Showing {filteredProducts.length} of{" "}
          {products.length} products
        </div>
      </div>

      {/* Product modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#321d25]/35 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-white/80 bg-[#fffaf8] shadow-[0_30px_100px_rgba(50,25,35,0.25)] sm:rounded-[2rem]">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#eadbd7] px-6 py-5 sm:px-7">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9a6870]">
                  Ayosa Beauty
                </p>

                <h2 className="mt-1 font-serif text-2xl">
                  {editingProduct
                    ? "Edit product"
                    : "Add product"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4d7d4] text-[#80676d] transition hover:bg-[#f7ebe8]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-6 py-6 sm:px-7">
              <div className="space-y-5">
                {/* Product name */}
                <Field label="Product name">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. NIVEA Rich Nourishing Body Lotion"
                    className={inputClass}
                  />
                </Field>

                {/* Short description */}
                <Field label="Short description">
                  <input
                    type="text"
                    value={form.short_description}
                    onChange={(event) =>
                      updateForm(
                        "short_description",
                        event.target.value
                      )
                    }
                    placeholder="A concise product summary"
                    className={inputClass}
                  />
                </Field>

                {/* Description */}
                <Field label="Professional description">
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Write a professional description for the product..."
                    className={`${inputClass} h-auto resize-none py-3`}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Price */}
                  <Field label="Price (GHC)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateForm(
                          "price",
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </Field>

                  {/* Category */}
                  <Field label="Category">
                    <div className="relative">
                      <select
                        value={form.category_id}
                        onChange={(event) =>
                          updateForm(
                            "category_id",
                            event.target.value
                          )
                        }
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        <option value="">
                          Select category
                        </option>

                        {categories.map(
                          (category) => (
                            <option
                              key={category.id}
                              value={category.id}
                            >
                              {category.name}
                            </option>
                          )
                        )}
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98777e]"
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* SKU */}
                  <Field label="SKU">
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(event) =>
                        updateForm(
                          "sku",
                          event.target.value
                        )
                      }
                      placeholder="e.g. AY-BODY-001"
                      className={inputClass}
                    />
                  </Field>

                  {/* Stock */}
                  <Field
                    label="Stock"
                    optional
                  >
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(event) =>
                        updateForm(
                          "stock",
                          event.target.value
                        )
                      }
                      placeholder="Leave blank if not provided"
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Image */}
                <Field label="Product image URL">
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(event) =>
                      updateForm(
                        "image_url",
                        event.target.value
                      )
                    }
                    placeholder="/images/product-name.png"
                    className={inputClass}
                  />

                  <p className="mt-2 text-[11px] leading-5 text-[#9b7e84]">
                    Use the product image path already stored in
                    your website, such as /images/product.png.
                  </p>
                </Field>

                {/* Preview */}
                {form.image_url.trim() && (
                  <div className="overflow-hidden rounded-2xl border border-[#e6d8d4] bg-[#f8f1ed]">
                    <div className="flex items-center gap-4 p-4">
                      <div className="h-20 w-20 overflow-hidden rounded-xl bg-white">
                        <img
                          src={form.image_url}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6870]">
                          Image preview
                        </p>

                        <p className="mt-1 text-xs text-[#80676d]">
                          The image will be used on the
                          storefront.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Toggles */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle
                    label="Active product"
                    description="Show this product on the storefront."
                    checked={form.is_active}
                    onChange={(checked) =>
                      updateForm(
                        "is_active",
                        checked
                      )
                    }
                  />

                  <Toggle
                    label="Featured product"
                    description="Highlight this product as featured."
                    checked={form.is_featured}
                    onChange={(checked) =>
                      updateForm(
                        "is_featured",
                        checked
                      )
                    }
                  />
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* Success */}
                {message && (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <Check size={17} />
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#eadbd7] bg-[#fffaf8] px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-full border border-[#decac7] px-6 py-3 text-sm font-semibold text-[#713b4a] transition hover:bg-[#f8eeeb] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#713b4a] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(113,59,74,0.18)] transition hover:bg-[#60303e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Saving..."
                  : editingProduct
                    ? "Save changes"
                    : "Add product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-[#e5d6d2] bg-[#fffafa] px-4 text-sm text-[#321d25] outline-none transition placeholder:text-[#b29a9e] focus:border-[#b08289] focus:ring-4 focus:ring-[#b98289]/10";

function Field({
  label,
  optional = false,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#654850]">
        {label}

        {optional && (
          <span className="ml-1 font-normal normal-case tracking-normal text-[#a58b90]">
            (optional)
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-2xl border border-[#e5d7d3] bg-[#fffafa] p-4 text-left transition hover:border-[#cbaeb0]"
    >
      <div>
        <p className="text-sm font-semibold text-[#4b3038]">
          {label}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-[#92777d]">
          {description}
        </p>
      </div>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#713b4a]"
            : "bg-[#d9cdca]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </button>
  );
}