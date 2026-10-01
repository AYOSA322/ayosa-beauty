"use client";

import {
  BarChart3,
  Boxes,
  ChevronRight,
  DollarSign,
  LogOut,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Sparkles,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";

type DashboardStats = {
  products: number;
  categories: number;
  activeProducts: number;
};

const navigationItems = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    categories: 0,
    activeProducts: 0,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/admin";
        return;
      }

      await loadDashboard();
    };

    checkAdmin();
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        productsResponse,
        categoriesResponse,
        activeProductsResponse,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("categories")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      setStats({
        products: productsResponse.count ?? 0,
        categories: categoriesResponse.count ?? 0,
        activeProducts: activeProductsResponse.count ?? 0,
      });
    } catch (error) {
      console.error("Unable to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7eee9]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#d8b4b5] border-t-[#713b4a]" />

          <p className="font-serif text-xl text-[#321d25]">
            Ayosa Beauty
          </p>

          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#9a747c]">
            Loading dashboard
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f1ed] text-[#321d25]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-[#eadbd7] bg-[#fffaf8] lg:flex lg:flex-col">
          {/* Brand */}
          <div className="border-b border-[#eadbd7] px-7 py-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#9a6870]">
              Ayosa Beauty
            </p>

            <h1 className="mt-1 font-serif text-3xl text-[#321d25]">
              Admin
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.label}
                href={item.href}
                icon={<item.icon size={18} />}
                label={item.label}
                active={item.label === "Overview"}
              />
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-[#eadbd7] p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#765c63] transition hover:bg-[#f7ebe8] hover:text-[#713b4a]"
            >
              <LogOut size={18} strokeWidth={1.7} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-[#eadbd7]/80 bg-[#f8f1ed]/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a6870]">
                  Ayosa Beauty
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#321d25] sm:text-3xl">
                  Store Overview
                </h2>
              </div>

              <button
                onClick={handleLogout}
                className="flex h-10 items-center gap-2 rounded-full border border-[#dfccca] bg-white/70 px-4 text-xs font-semibold text-[#713b4a] transition hover:border-[#bd9a9d] hover:bg-white lg:hidden"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </header>

          <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
            {/* Welcome banner */}
            <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-[#e7d7d3] bg-[#713b4a] p-7 text-white shadow-[0_20px_55px_rgba(80,40,50,0.15)] sm:p-9">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#d8a6a6]/15 blur-3xl" />

              <div className="relative max-w-2xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10">
                  <Sparkles size={19} strokeWidth={1.5} />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/65">
                  Welcome to your dashboard
                </p>

                <h3 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
                  Manage Ayosa Beauty beautifully.
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                  Manage products, categories and your growing beauty
                  storefront from one elegant workspace.
                </p>
              </div>
            </section>

            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Total Products"
                value={stats.products}
                icon={<Package size={20} />}
                description="Products in your catalog"
              />

              <StatCard
                title="Active Products"
                value={stats.activeProducts}
                icon={<TrendingUp size={20} />}
                description="Currently visible in store"
              />

              <StatCard
                title="Categories"
                value={stats.categories}
                icon={<Tags size={20} />}
                description="Available store categories"
              />
            </section>

            {/* Quick actions */}
            <section className="mt-10">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a6870]">
                  Store management
                </p>

                <h3 className="mt-1 font-serif text-2xl text-[#321d25]">
                  Quick actions
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ActionCard
                  href="/admin/products"
                  icon={<Plus size={21} strokeWidth={1.7} />}
                  title="Add Product"
                  description="Create a new product listing for the store."
                />

                <ActionCard
                  href="/admin/products"
                  icon={<Boxes size={21} strokeWidth={1.7} />}
                  title="Manage Products"
                  description="Edit, deactivate or organize your products."
                />

                <ActionCard
                  href="/admin/categories"
                  icon={<Tags size={21} strokeWidth={1.7} />}
                  title="Manage Categories"
                  description="Organize your beauty catalog categories."
                />
              </div>
            </section>

            {/* Store status */}
            <section className="mt-10 rounded-[2rem] border border-[#e8d9d5] bg-white/75 p-6 shadow-[0_15px_45px_rgba(70,35,45,0.06)] backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a6870]">
                    Store status
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]" />

                    <h3 className="font-serif text-xl text-[#321d25]">
                      Store is live
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-[#80676d]">
                    Your active products are currently being displayed on
                    the Ayosa Beauty website.
                  </p>
                </div>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9c3c1] bg-[#fffaf8] px-5 py-3 text-xs font-semibold text-[#713b4a] transition hover:-translate-y-0.5 hover:border-[#b98b91] hover:bg-white"
                >
                  View storefront
                  <ChevronRight size={15} />
                </a>
              </div>
            </section>

            {/* Coming next */}
            <section className="mt-10 pb-5">
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a6870]">
                  Coming next
                </p>

                <h3 className="mt-1 font-serif text-2xl text-[#321d25]">
                  More management tools
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ComingSoonCard
                  href="/admin/orders"
                  icon={<ShoppingBag size={18} />}
                  title="Orders"
                />

                <ComingSoonCard
                  href="/admin/customers"
                  icon={<Users size={18} />}
                  title="Customers"
                />

                <ComingSoonCard
                  href="/admin/sales"
                  icon={<DollarSign size={18} />}
                  title="Sales"
                />

                <ComingSoonCard
                  href="/admin/settings"
                  icon={<Settings size={18} />}
                  title="Settings"
                />
              </div>
            </section>

            {/* Motto */}
            <footer className="border-t border-[#eadbd7] pt-7 text-center">
              <p className="font-serif text-lg italic text-[#76545d]">
                “Driven by quality, chosen by those who know the difference.”
              </p>

              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#aa8d92]">
                Ayosa Beauty Admin
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-[#f3e3e1] font-semibold text-[#713b4a]"
          : "text-[#806970] hover:bg-[#faf0ee] hover:text-[#713b4a]"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="group rounded-[1.5rem] border border-[#e7d8d4] bg-white/80 p-6 shadow-[0_12px_35px_rgba(70,35,45,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(70,35,45,0.09)]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5e7e4] text-[#713b4a] transition group-hover:bg-[#713b4a] group-hover:text-white">
          {icon}
        </div>

        <span className="rounded-full bg-[#f7f0ed] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9b777e]">
          Live
        </span>
      </div>

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#96777d]">
        {title}
      </p>

      <p className="mt-1 font-serif text-4xl text-[#321d25]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#8d747a]">
        {description}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group block rounded-[1.5rem] border border-[#e7d8d4] bg-white/80 p-6 shadow-[0_12px_35px_rgba(70,35,45,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#cdaeb0] hover:bg-white hover:shadow-[0_18px_45px_rgba(70,35,45,0.10)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e7e4] text-[#713b4a] transition duration-300 group-hover:bg-[#713b4a] group-hover:text-white">
          {icon}
        </div>

        <ChevronRight
          size={18}
          className="text-[#b08e94] transition duration-300 group-hover:translate-x-1 group-hover:text-[#713b4a]"
        />
      </div>

      <h4 className="mt-6 font-serif text-xl text-[#321d25]">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-[#80676d]">
        {description}
      </p>
    </a>
  );
}

function ComingSoonCard({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-dashed border-[#dbc7c4] bg-white/50 p-5 transition hover:-translate-y-0.5 hover:border-[#c6a5a8] hover:bg-white"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5e9e6] text-[#8d6971]">
        {icon}
      </div>

      <div>
        <p className="font-serif text-lg text-[#4c3038]">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[#aa8e93]">
          Coming soon
        </p>
      </div>
    </a>
  );
}