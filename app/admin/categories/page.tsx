"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "../../../lib/supabase";

type Category = {
  id: number;
  created_at?: string;
  name: string;
  slug: string;
  description: string | null;
};

type Product = {
  id: number;
  category_id: number | null;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  );

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.replace("/admin");
      return;
    }

    await loadData();
  }

  async function loadData() {
    setLoading(true);
    setError("");

    const [categoryResult, productResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, created_at, name, slug, description")
        .order("id", { ascending: true }),

      supabase.from("products").select("id, category_id"),
    ]);

    if (categoryResult.error) {
      setError(categoryResult.error.message);
      setLoading(false);
      return;
    }

    if (productResult.error) {
      setError(productResult.error.message);
      setLoading(false);
      return;
    }

    setCategories(categoryResult.data || []);
    setProducts(productResult.data || []);
    setLoading(false);
  }

  function openAddModal() {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setError("");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!editingCategory) {
      setSlug(createSlug(value));
    }
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanSlug = createSlug(slug || name);
    const cleanDescription = description.trim();

    if (!cleanName) {
      setError("Please enter a category name.");
      return;
    }

    if (!cleanSlug) {
      setError("Please enter a valid category slug.");
      return;
    }

    setSaving(true);

    if (editingCategory) {
      const { data, error: updateError } = await supabase
        .from("categories")
        .update({
          name: cleanName,
          slug: cleanSlug,
          description: cleanDescription || null,
        })
        .eq("id", editingCategory.id)
        .select("id, created_at, name, slug, description")
        .single();

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategory.id ? data : category
        )
      );

      setSuccess("Category updated successfully.");
    } else {
      const { data, error: insertError } = await supabase
        .from("categories")
        .insert({
          name: cleanName,
          slug: cleanSlug,
          description: cleanDescription || null,
        })
        .select("id, created_at, name, slug, description")
        .single();

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setCategories((current) => [...current, data]);

      setSuccess("Category created successfully.");
    }

    setSaving(false);

    setTimeout(() => {
      setShowModal(false);
      setEditingCategory(null);
      setName("");
      setSlug("");
      setDescription("");
      setSuccess("");
    }, 700);
  }

  async function handleDelete(category: Category) {
    const productCount = products.filter(
      (product) => product.category_id === category.id
    ).length;

    if (productCount > 0) {
      setError(
        `You cannot delete "${category.name}" because ${productCount} product${
          productCount === 1 ? "" : "s"
        } ${
          productCount === 1 ? "is" : "are"
        } assigned to this category. Move the product${
          productCount === 1 ? "" : "s"
        } first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    );

    setSuccess(`"${category.name}" was deleted.`);

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description || "").toLowerCase().includes(query)
    );
  }, [categories, search]);

  function getProductCount(categoryId: number) {
    return products.filter((product) => product.category_id === categoryId)
      .length;
  }

  return (
    <main className="min-h-screen bg-[#faf7f5] text-[#241b1d]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#eadedb] bg-[#faf7f5]/95 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5d8d5] bg-white text-[#6d565a] transition hover:border-[#b88791] hover:text-[#8f5966]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p className="font-serif text-xl tracking-tight text-[#3b292d]">
                Ayosa Beauty
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#a18388]">
                Category Management
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="hidden items-center gap-2 text-sm font-medium text-[#765e63] transition hover:text-[#9a626e] md:flex"
          >
            View Storefront
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Heading */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[#a16d78]">
                <Sparkles size={16} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                  Store Organization
                </span>
              </div>

              <h1 className="font-serif text-4xl tracking-tight text-[#352529] md:text-5xl">
                Categories
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#806b70]">
                Organize your beauty collection and keep your storefront
                beautifully structured.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8f5966] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(143,89,102,0.18)] transition hover:-translate-y-0.5 hover:bg-[#7d4c59] active:translate-y-0"
            >
              <Plus size={17} />
              Add Category
            </button>
          </div>
        </section>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[#e8c7cb] bg-[#fff5f6] px-5 py-4 text-sm text-[#8c4653]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-[#d9c8ca] bg-white px-5 py-4 text-sm text-[#76545b]">
            {success}
          </div>
        )}

        {/* Search */}
        <section className="mb-6 rounded-3xl border border-[#eadedb] bg-white p-4 shadow-[0_10px_35px_rgba(80,45,52,0.04)]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ad969a]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-2xl border border-[#eadedb] bg-[#fcfaf9] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b5a3a6] focus:border-[#c59aa3] focus:bg-white"
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#eadedb] bg-white p-5 shadow-[0_10px_35px_rgba(80,45,52,0.04)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5e8ea] text-[#98636e]">
              <FolderOpen size={19} />
            </div>

            <p className="text-xs uppercase tracking-[0.18em] text-[#aa9296]">
              Total Categories
            </p>

            <p className="mt-1 font-serif text-3xl text-[#38272b]">
              {categories.length}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadedb] bg-white p-5 shadow-[0_10px_35px_rgba(80,45,52,0.04)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5e8ea] text-[#98636e]">
              <Sparkles size={19} />
            </div>

            <p className="text-xs uppercase tracking-[0.18em] text-[#aa9296]">
              Products Organized
            </p>

            <p className="mt-1 font-serif text-3xl text-[#38272b]">
              {products.length}
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="overflow-hidden rounded-3xl border border-[#eadedb] bg-white shadow-[0_15px_50px_rgba(80,45,52,0.05)]">
          <div className="border-b border-[#eee3e0] px-5 py-5 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#3a292d]">
                  Your Categories
                </h2>
                <p className="mt-1 text-xs text-[#9a8388]">
                  {filteredCategories.length}{" "}
                  {filteredCategories.length === 1 ? "category" : "categories"}{" "}
                  shown
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#90777c]">
                <Loader2 size={19} className="animate-spin" />
                Loading categories...
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f7ebed] text-[#a06a76]">
                <FolderOpen size={24} />
              </div>

              <h3 className="font-serif text-xl text-[#443237]">
                No categories found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#927c81]">
                {search
                  ? "Try another search term."
                  : "Create your first category to start organizing the store."}
              </p>

              {!search && (
                <button
                  onClick={openAddModal}
                  className="mt-5 rounded-full bg-[#8f5966] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7d4c59]"
                >
                  Create Category
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-[#eee3e0] bg-[#fcfaf9] text-left">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                        Category
                      </th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                        Products
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map((category) => {
                      const productCount = getProductCount(category.id);

                      return (
                        <tr
                          key={category.id}
                          className="border-b border-[#f1e9e7] last:border-0 transition hover:bg-[#fdfafa]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6e9eb] text-[#98636e]">
                                <FolderOpen size={19} />
                              </div>

                              <div>
                                <p className="font-serif text-lg text-[#3d2b30]">
                                  {category.name}
                                </p>

                                <p className="mt-0.5 max-w-md text-xs text-[#9b8589]">
                                  {category.description ||
                                    "No description added."}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-[#f9f3f2] px-3 py-1.5 font-mono text-xs text-[#806a70]">
                              {category.slug}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-medium text-[#5f484e]">
                              {productCount}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(category)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadedb] text-[#7e646a] transition hover:border-[#cda4ab] hover:bg-[#fbf1f3] hover:text-[#915c68]"
                                aria-label={`Edit ${category.name}`}
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                onClick={() => handleDelete(category)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadedb] text-[#9a777d] transition hover:border-[#e1b9be] hover:bg-[#fff5f6] hover:text-[#a84d5a]"
                                aria-label={`Delete ${category.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-[#f1e9e7] md:hidden">
                {filteredCategories.map((category) => {
                  const productCount = getProductCount(category.id);

                  return (
                    <div key={category.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f6e9eb] text-[#98636e]">
                            <FolderOpen size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-serif text-lg text-[#3d2b30]">
                              {category.name}
                            </p>

                            <p className="mt-1 truncate font-mono text-[11px] text-[#9a8388]">
                              {category.slug}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadedb] text-[#7e646a]"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(category)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadedb] text-[#9a777d]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-[#8e797e]">
                        {category.description ||
                          "No description added for this category."}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-[#f2e9e7] pt-4">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a58d92]">
                          Products
                        </span>

                        <span className="font-serif text-lg text-[#60484e]">
                          {productCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281c20]/35 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-[#eadedb] bg-[#fffdfc] shadow-[0_30px_100px_rgba(45,27,33,0.2)]">
            <div className="flex items-center justify-between border-b border-[#eee3e0] px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a06a76]">
                  {editingCategory ? "Edit Category" : "New Category"}
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#38272b]">
                  {editingCategory
                    ? "Refine your category"
                    : "Create a category"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadedb] text-[#806b70] transition hover:bg-[#f9f1f1]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              {error && (
                <div className="rounded-2xl border border-[#e8c7cb] bg-[#fff5f6] px-4 py-3 text-sm text-[#8c4653]">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-[#d9c8ca] bg-white px-4 py-3 text-sm text-[#76545b]">
                  {success}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
                  Category Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="e.g. Skincare"
                  className="w-full rounded-2xl border border-[#e6d9d6] bg-white px-4 py-3.5 text-sm text-[#3c2b30] outline-none transition placeholder:text-[#b3a0a4] focus:border-[#bd8c97]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
                  Slug
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(createSlug(event.target.value))}
                  placeholder="skincare"
                  className="w-full rounded-2xl border border-[#e6d9d6] bg-white px-4 py-3.5 font-mono text-sm text-[#3c2b30] outline-none transition placeholder:text-[#b3a0a4] focus:border-[#bd8c97]"
                />

                <p className="mt-2 text-xs text-[#a18b90]">
                  Used internally to identify this category.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="A short description of this category..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-[#e6d9d6] bg-white px-4 py-3.5 text-sm leading-6 text-[#3c2b30] outline-none transition placeholder:text-[#b3a0a4] focus:border-[#bd8c97]"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#eee3e0] bg-[#fcfaf9] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-full border border-[#dfd1ce] px-6 py-3 text-sm font-semibold text-[#70595f] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8f5966] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7d4c59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {editingCategory ? "Save Changes" : "Create Category"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}