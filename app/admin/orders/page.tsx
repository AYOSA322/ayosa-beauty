"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { createClient } from "../../../lib/supabase";

type Order = {
  id: string | number;
  created_at?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  total?: number | null;
  status?: string | null;
};

const statusOptions = [
  "All",
  "Pending Payment",
  "Paid",
  "Preparing Order",
  "Order Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.replace("/admin");
      return;
    }

    await loadOrders();
  }

  async function loadOrders() {
    setLoading(true);
    setError("");
    setTableMissing(false);

    const { data, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, created_at, customer_name, customer_email, total, status"
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      if (
        ordersError.message.toLowerCase().includes("could not find the table") ||
        ordersError.message.toLowerCase().includes("relation") ||
        ordersError.code === "42P01"
      ) {
        setTableMissing(true);
      } else {
        setError(ordersError.message);
      }

      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders((data || []) as Order[]);
    setLoading(false);
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(order.id).toLowerCase().includes(query) ||
        (order.customer_name || "").toLowerCase().includes(query) ||
        (order.customer_email || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        (order.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending Payment" ||
      order.status === "Paid" ||
      order.status === "Preparing Order"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(value);
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getStatusStyle(status?: string | null) {
    switch (status) {
      case "Delivered":
        return "bg-[#edf7f0] text-[#4e765a] border-[#d4e8d9]";

      case "Out for Delivery":
        return "bg-[#f2f0fa] text-[#685d91] border-[#ddd8ee]";

      case "Order Ready":
        return "bg-[#f5eef8] text-[#795b83] border-[#e4d7e8]";

      case "Preparing Order":
        return "bg-[#fff6e9] text-[#96713f] border-[#f0dfc0]";

      case "Paid":
        return "bg-[#eef7f5] text-[#52786e] border-[#d7e9e4]";

      case "Pending Payment":
        return "bg-[#fff7ee] text-[#9b714b] border-[#f0dfcc]";

      case "Cancelled":
        return "bg-[#fff2f3] text-[#9b555f] border-[#eccfd3]";

      case "Returned":
        return "bg-[#f8f1f0] text-[#85696a] border-[#e5d8d5]";

      default:
        return "bg-[#f7f2f1] text-[#79676b] border-[#e7dcda]";
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f5] text-[#241b1d]">
      {/* Header */}
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
                Order Management
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="hidden items-center gap-2 text-sm font-medium text-[#765e63] transition hover:text-[#9a626e] md:flex"
          >
            View Storefront
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Heading */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-[#a16d78]">
            <Sparkles size={16} />

            <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
              Commerce
            </span>
          </div>

          <h1 className="font-serif text-4xl tracking-tight text-[#352529] md:text-5xl">
            Orders
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#806b70]">
            Monitor customer orders, payment status, fulfillment progress, and
            completed purchases.
          </p>
        </section>

        {/* Missing table message */}
        {tableMissing && (
          <section className="mb-8 overflow-hidden rounded-3xl border border-[#eadedb] bg-white shadow-[0_15px_50px_rgba(80,45,52,0.05)]">
            <div className="border-b border-[#eee3e0] bg-[#fcfaf9] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6e9eb] text-[#98636e]">
                  <ClipboardList size={20} />
                </div>

                <div>
                  <h2 className="font-serif text-2xl text-[#3a292d]">
                    Orders are ready to be connected
                  </h2>

                  <p className="mt-1 text-xs text-[#9a8388]">
                    Your order management interface is ready.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-7">
              <p className="max-w-2xl text-sm leading-7 text-[#806b70]">
                There is currently no{" "}
                <span className="font-semibold text-[#5f484e]">
                  orders
                </span>{" "}
                table in Supabase. Once we create the order database structure,
                this page will automatically display real customer orders
                here.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Customer details",
                  "Order items",
                  "Payment status",
                  "Fulfillment status",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#eee3e0] bg-[#fcfaf9] px-4 py-4"
                  >
                    <p className="text-xs font-medium text-[#806b70]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[#e8c7cb] bg-[#fff5f6] px-5 py-4 text-sm text-[#8c4653]">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ShoppingBag size={19} />}
            label="Total Orders"
            value={orders.length.toString()}
          />

          <StatCard
            icon={<Package size={19} />}
            label="Pending / Active"
            value={pendingOrders.toString()}
          />

          <StatCard
            icon={<ClipboardList size={19} />}
            label="Delivered"
            value={deliveredOrders.toString()}
          />

          <StatCard
            icon={<Sparkles size={19} />}
            label="Revenue"
            value={formatCurrency(totalRevenue)}
          />
        </section>

        {/* Filters */}
        {!tableMissing && (
          <section className="mb-6 rounded-3xl border border-[#eadedb] bg-white p-4 shadow-[0_10px_35px_rgba(80,45,52,0.04)]">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ad969a]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order ID, customer name or email..."
                  className="w-full rounded-2xl border border-[#eadedb] bg-[#fcfaf9] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b5a3a6] focus:border-[#c59aa3] focus:bg-white"
                />
              </div>

              <div className="relative">
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9f888c]"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#eadedb] bg-[#fcfaf9] px-4 py-3.5 text-sm text-[#60484e] outline-none transition focus:border-[#c59aa3]"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Orders Table */}
        {!tableMissing && (
          <section className="overflow-hidden rounded-3xl border border-[#eadedb] bg-white shadow-[0_15px_50px_rgba(80,45,52,0.05)]">
            <div className="border-b border-[#eee3e0] px-5 py-5 md:px-6">
              <h2 className="font-serif text-2xl text-[#3a292d]">
                Customer Orders
              </h2>

              <p className="mt-1 text-xs text-[#9a8388]">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"} shown
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-[#90777c]">
                  <Loader2 size={19} className="animate-spin" />
                  Loading orders...
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f7ebed] text-[#a06a76]">
                  <ShoppingBag size={24} />
                </div>

                <h3 className="font-serif text-xl text-[#443237]">
                  No orders yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#927c81]">
                  Customer orders will appear here once your checkout system
                  begins creating orders.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-[#eee3e0] bg-[#fcfaf9] text-left">
                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                          Order
                        </th>

                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                          Date
                        </th>

                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                          Total
                        </th>

                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d878b]">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-[#f1e9e7] last:border-0 transition hover:bg-[#fdfafa]"
                        >
                          <td className="px-6 py-5">
                            <span className="font-mono text-xs text-[#705960]">
                              #{order.id}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm font-medium text-[#4b373c]">
                              {order.customer_name || "Customer"}
                            </p>

                            <p className="mt-1 text-xs text-[#9b8589]">
                              {order.customer_email || "No email"}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-xs text-[#806b70]">
                            {formatDate(order.created_at)}
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-[#4d383e]">
                            {formatCurrency(Number(order.total || 0))}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-medium ${getStatusStyle(
                                order.status
                              )}`}
                            >
                              {order.status || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-[#f1e9e7] md:hidden">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs text-[#806b70]">
                            #{order.id}
                          </p>

                          <p className="mt-2 font-serif text-lg text-[#3d2b30]">
                            {order.customer_name || "Customer"}
                          </p>

                          <p className="mt-1 text-xs text-[#9b8589]">
                            {order.customer_email || "No email"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-medium ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status || "Unknown"}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between border-t border-[#f2e9e7] pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a58d92]">
                            Date
                          </p>

                          <p className="mt-1 text-xs text-[#806b70]">
                            {formatDate(order.created_at)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a58d92]">
                            Total
                          </p>

                          <p className="mt-1 font-serif text-lg text-[#60484e]">
                            {formatCurrency(Number(order.total || 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-[#eadedb] bg-white p-5 shadow-[0_10px_35px_rgba(80,45,52,0.04)]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5e8ea] text-[#98636e]">
        {icon}
      </div>

      <p className="text-xs uppercase tracking-[0.18em] text-[#aa9296]">
        {label}
      </p>

      <p className="mt-1 font-serif text-2xl text-[#38272b]">{value}</p>
    </div>
  );
}