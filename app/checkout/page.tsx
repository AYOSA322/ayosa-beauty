"use client";

import {
  FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "../components/CartContext";
import { createClient } from "../../lib/supabase";

const PLATFORM_FEE = 3;

const PAYMENT_BUCKET = "payment-proofs";

const BUSINESS = {
  name: "AYOSA BEAUTY",
  network: "MTN Mobile Money",
  momoNumber: "0545473865",
  momoName: "Yaa Amoatemaa Osei Sarhene",
  bank: "Ecobank",
  bankName: "Yaa Amoatemaa Osei Sarhene",
  bankAccount: "1441004878729",
};

type PaymentMethod = "MTN Mobile Money" | "Ecobank";

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  address: string;
  notes: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartLoaded,
  } = useCart();

  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    deliveryMethod: "Campus Pickup",
    address: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("MTN Mobile Money");

  const [paymentFile, setPaymentFile] =
    useState<File | null>(null);

  const [paymentPreview, setPaymentPreview] =
    useState<string | null>(null);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [orderId, setOrderId] =
    useState<string | number | null>(null);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [cartItems]);

  const total =
    subtotal + PLATFORM_FEE;

  function formatCurrency(value: number) {
    return `GHC ${value.toFixed(2)}`;
  }

  function updateForm(
    field: keyof CheckoutForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePaymentFile(
    file: File | undefined
  ) {
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please upload a payment screenshot as an image."
      );
      return;
    }

    const maxSize =
      8 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Payment screenshots must be smaller than 8MB."
      );
      return;
    }

    setPaymentFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPaymentPreview(previewUrl);
  }

  function removePaymentFile() {
    if (paymentPreview) {
      URL.revokeObjectURL(
        paymentPreview
      );
    }

    setPaymentFile(null);
    setPaymentPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function getOrderId(
    data: unknown
  ): string {
    if (
      typeof data === "string" ||
      typeof data === "number"
    ) {
      return String(data);
    }

    if (
      data &&
      typeof data === "object"
    ) {
      const record =
        data as Record<
          string,
          unknown
        >;

      if (
        record.order_id !== undefined
      ) {
        return String(
          record.order_id
        );
      }

      if (
        record.id !== undefined
      ) {
        return String(record.id);
      }
    }

    return String(data ?? "");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (cartItems.length === 0) {
      setError(
        "Your bag is empty. Add a product before checking out."
      );
      return;
    }

    if (!form.name.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!form.email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (
      form.deliveryMethod ===
        "Seller Delivery" &&
      !form.address.trim()
    ) {
      setError(
        "Please enter your delivery address."
      );
      return;
    }

    if (!paymentFile) {
      setError(
        "Please upload your payment screenshot before placing the order."
      );
      return;
    }

    setPlacingOrder(true);

    try {
      /*
       * STEP 1
       * Upload the payment screenshot.
       */
      const fileExtension =
        paymentFile.name.includes(".")
          ? paymentFile.name
              .split(".")
              .pop()
          : "jpg";

      const safeEmail =
        form.email
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          );

      const filePath =
        `orders/${Date.now()}-${safeEmail}.${fileExtension}`;

      const {
        data: uploadData,
        error: uploadError,
      } =
        await supabase.storage
          .from(PAYMENT_BUCKET)
          .upload(
            filePath,
            paymentFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                paymentFile.type,
            }
          );

      if (uploadError) {
        console.error(
          "Payment screenshot upload error:",
          uploadError
        );

        throw new Error(
          "We couldn't upload your payment screenshot. Please try again."
        );
      }

      /*
       * STEP 2
       * Prepare the order items.
       */
      const orderItems =
        cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity:
            Number(item.quantity),
          option:
            item.option ?? null,
        }));

      /*
       * STEP 3
       * Create the actual order.
       */
      const {
        data,
        error: orderError,
      } =
        await supabase.rpc(
          "create_customer_order",
          {
            p_customer_name:
              form.name.trim(),

            p_customer_email:
              form.email.trim(),

            p_customer_phone:
              form.phone.trim(),

            p_subtotal:
              subtotal,

            p_delivery_fee: 0,

            p_total:
              total,

            p_delivery_method:
              form.deliveryMethod,

            p_delivery_address:
              form.address.trim() ||
              null,

            p_delivery_notes:
              form.notes.trim() ||
              null,

            p_items:
              orderItems,
          }
        );

      if (orderError) {
        console.error(
          "Order creation error:",
          orderError
        );

        throw new Error(
          "We couldn't place your order right now. Please try again."
        );
      }

      const createdOrderId =
        getOrderId(data);

      if (!createdOrderId) {
        console.error(
          "Unexpected order ID returned:",
          data
        );

        throw new Error(
          "Your order was created, but we couldn't identify the order number."
        );
      }

      /*
       * STEP 4
       * Link the payment screenshot
       * to the newly-created order.
       */
      const {
        error: proofRecordError,
      } =
        await supabase
          .from(
            "order_payment_proofs"
          )
          .insert({
            order_id:
              createdOrderId,

            payment_method:
              paymentMethod,

            file_path:
              uploadData?.path ??
              filePath,

            file_name:
              paymentFile.name,

            customer_email:
              form.email.trim(),
          });

      if (proofRecordError) {
        console.error(
          "Payment proof record error:",
          proofRecordError
        );

        throw new Error(
          "Your order was created, but we couldn't attach the payment proof. Please contact AYOSA BEAUTY."
        );
      }

      /*
       * STEP 5
       * Create a temporary signed URL for the payment proof.
       * The Supabase bucket can remain private.
       * Formspree will receive this temporary link so the
       * AYOSA BEAUTY notification email can open the proof.
       */
      let paymentProofUrl = "";

      const {
        data: signedUrlData,
        error: signedUrlError,
      } = await supabase.storage
        .from(PAYMENT_BUCKET)
        .createSignedUrl(
          uploadData?.path ?? filePath,
          60 * 60 * 24 * 7
        );

      if (signedUrlError) {
        console.warn(
          "Payment proof signed URL error:",
          signedUrlError
        );
      } else {
        paymentProofUrl =
          signedUrlData?.signedUrl ?? "";
      }

      /*
       * STEP 6
       * Send the order notification through Formspree.
       *
       * Formspree handles the email notification for the form.
       * We intentionally do NOT fail the customer's order if
       * the notification service has a temporary problem.
       */
      try {
        const formspreeResponse =
          await fetch(
            "https://formspree.io/f/xyezldbq",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              body: JSON.stringify({
                subject:
                  `New AYOSA BEAUTY Order #${createdOrderId}`,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                fulfillment_method:
                  form.deliveryMethod,
                delivery_address:
                  form.address.trim() ||
                  "Not provided",
                notes:
                  form.notes.trim() ||
                  "None",
                payment_method:
                  paymentMethod,
                order_id: String(
                  createdOrderId
                ),
                subtotal:
                  `GHC ${subtotal.toFixed(2)}`,
                service_fee:
                  `GHC ${PLATFORM_FEE.toFixed(2)}`,
                total:
                  `GHC ${total.toFixed(2)}`,
                items: orderItems
                  .map(
                    (item) =>
                      `${item.name} | Qty: ${item.quantity} | Price: GHC ${Number(item.price).toFixed(2)}${item.option ? ` | Option: ${item.option}` : ""}`
                  )
                  .join("\n"),
                payment_proof:
                  paymentProofUrl ||
                  "Payment proof uploaded to Supabase; signed link unavailable.",
                message:
                  "A new AYOSA BEAUTY order has been placed. Please verify the payment proof before processing the order.",
              }),
            }
          );

        if (!formspreeResponse.ok) {
          const formspreeResult =
            await formspreeResponse
              .json()
              .catch(() => null);

          console.warn(
            "AYOSA BEAUTY Formspree notification failed:",
            formspreeResult
          );
        }
      } catch (emailError) {
        console.warn(
          "AYOSA BEAUTY Formspree request failed:",
          emailError
        );
      }

      /*
       * STEP 7
       * The order and payment proof have already been saved.
       * Complete the customer's checkout regardless of whether
       * the notification service is temporarily unavailable.
       */
      setOrderId(
        createdOrderId
      );

      clearCart();

      setSuccess(true);

      setPlacingOrder(false);
    } catch (submitError) {
      console.error(
        "Checkout error:",
        submitError
      );

      setError(
        submitError instanceof
          Error
          ? submitError.message
          : "Something went wrong while placing your order."
      );

      setPlacingOrder(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#faf7f5] px-5 py-10 text-[#241b1d] md:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <section className="w-full rounded-[32px] border border-[#eadedb] bg-white p-8 text-center shadow-[0_25px_80px_rgba(80,45,52,0.08)] md:p-14">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#e8f7ed] text-[#2f9b57]">
              <Check
                size={48}
                strokeWidth={2.5}
              />
            </div>

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#4a9a63]">
              Order Successfully Placed
            </p>

            <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#39282c] md:text-5xl">
              Thank you for your order.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#806b70]">
              Your order has been successfully
              submitted to AYOSA BEAUTY. Your
              payment screenshot has also been
              received for verification.
            </p>

            {orderId && (
              <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-[#eadedb] bg-[#fcfaf9] px-5 py-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#a08a8e]">
                  Order
                </span>

                <span className="font-mono text-sm font-medium text-[#60484e]">
                  #{orderId}
                </span>
              </div>
            )}

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#d9eadf] bg-[#f5fbf7] p-5">
              <p className="text-sm font-medium text-[#39704b]">
                Payment proof received
              </p>

              <p className="mt-1 text-xs leading-5 text-[#6d8174]">
                AYOSA BEAUTY will verify your
                payment and process your order.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#eadedb] bg-[#fffaf8] p-5">
              <p className="font-serif text-lg italic text-[#60484e]">
                “Driven by quality, chosen by
                those who know the difference.”
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="mt-8 rounded-full bg-[#8f5966] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7d4c59]"
            >
              Continue Shopping
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f5] text-[#241b1d]">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#eadedb] bg-[#faf7f5]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="flex items-center gap-3 text-[#705960] transition hover:text-[#8f5966]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5d8d5] bg-white">
              <ArrowLeft size={17} />
            </div>

            <span className="hidden text-sm font-medium sm:block">
              Continue Shopping
            </span>
          </button>

          <div className="text-center">
            <p className="font-serif text-xl tracking-tight text-[#3b292d]">
              Ayosa Beauty
            </p>

            <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#a18388]">
              Secure Checkout
            </p>
          </div>

          <div className="flex items-center gap-2 text-[#806b70]">
            <ShieldCheck size={18} />

            <span className="hidden text-xs sm:block">
              Secure
            </span>
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">

        {/* HEADING */}
        <section className="mb-9">
          <div className="mb-3 flex items-center gap-2 text-[#a16d78]">
            <Sparkles size={15} />

            <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
              Complete Your Order
            </span>
          </div>

          <h1 className="font-serif text-4xl tracking-tight text-[#352529] md:text-5xl">
            Checkout
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#806b70]">
            Complete your purchase securely
            and upload your payment confirmation.
          </p>
        </section>

        {error && (
          <div className="mb-7 rounded-2xl border border-[#e8c7cb] bg-[#fff5f6] px-5 py-4 text-sm leading-6 text-[#8c4653]">
            {error}
          </div>
        )}

        {!cartLoaded ? (
          <section className="rounded-[32px] border border-[#eadedb] bg-white px-6 py-16 text-center shadow-[0_15px_50px_rgba(80,45,52,0.05)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f5e8ea] text-[#98636e]">
              <Loader2 size={25} className="animate-spin" />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#3a292d]">
              Loading your bag...
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#927c81]">
              Please wait while we restore the items in your bag.
            </p>
          </section>
        ) : cartItems.length === 0 ? (
          <section className="rounded-[32px] border border-[#eadedb] bg-white px-6 py-16 text-center shadow-[0_15px_50px_rgba(80,45,52,0.05)]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f5e8ea] text-[#98636e]">
              <ShoppingBag size={25} />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#3a292d]">
              Your bag is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#927c81]">
              Add something beautiful to your
              bag before continuing to checkout.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="mt-6 rounded-full bg-[#8f5966] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7d4c59]"
            >
              Browse Products
            </button>

          </section>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-7 lg:grid-cols-[1fr_410px]">

              {/* LEFT SIDE */}
              <div className="space-y-7">

                {/* CUSTOMER DETAILS */}
                <section className="rounded-[28px] border border-[#eadedb] bg-white p-6 shadow-[0_15px_50px_rgba(80,45,52,0.04)] md:p-7">

                  <div className="mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a06a76]">
                      01
                    </p>

                    <h2 className="mt-1 font-serif text-2xl text-[#3a292d]">
                      Your Details
                    </h2>

                    <p className="mt-1 text-xs text-[#9a8388]">
                      Tell us where to reach you.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <InputField
                      label="Full Name"
                      value={form.name}
                      placeholder="Your full name"
                      onChange={(value) =>
                        updateForm(
                          "name",
                          value
                        )
                      }
                    />

                    <InputField
                      label="Email Address"
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      onChange={(value) =>
                        updateForm(
                          "email",
                          value
                        )
                      }
                    />

                    <InputField
                      label="Phone Number"
                      type="tel"
                      value={form.phone}
                      placeholder="e.g. 024 000 0000"
                      onChange={(value) =>
                        updateForm(
                          "phone",
                          value
                        )
                      }
                    />

                  </div>
                </section>

                {/* FULFILLMENT */}
                <section className="rounded-[28px] border border-[#eadedb] bg-white p-6 shadow-[0_15px_50px_rgba(80,45,52,0.04)] md:p-7">

                  <div className="mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a06a76]">
                      02
                    </p>

                    <h2 className="mt-1 font-serif text-2xl text-[#3a292d]">
                      Fulfillment
                    </h2>

                    <p className="mt-1 text-xs text-[#9a8388]">
                      Choose how you would like to receive your order.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">

                    <DeliveryOption
                      selected={
                        form.deliveryMethod ===
                        "Campus Pickup"
                      }
                      title="Campus Pickup"
                      description="Arrange a convenient pickup point."
                      icon={
                        <MapPin size={18} />
                      }
                      onClick={() =>
                        updateForm(
                          "deliveryMethod",
                          "Campus Pickup"
                        )
                      }
                    />

                    <DeliveryOption
                      selected={
                        form.deliveryMethod ===
                        "Seller Delivery"
                      }
                      title="Seller Delivery"
                      description="Have the seller arrange delivery."
                      icon={
                        <Truck size={18} />
                      }
                      onClick={() =>
                        updateForm(
                          "deliveryMethod",
                          "Seller Delivery"
                        )
                      }
                    />

                  </div>

                  {form.deliveryMethod ===
                    "Seller Delivery" && (
                    <div className="mt-5">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
                        Delivery Address
                      </label>

                      <textarea
                        value={
                          form.address
                        }
                        onChange={(event) =>
                          updateForm(
                            "address",
                            event.target.value
                          )
                        }
                        rows={3}
                        placeholder="Enter your delivery address..."
                        className="w-full resize-none rounded-2xl border border-[#e6d9d6] bg-white px-4 py-3.5 text-sm leading-6 text-[#3c2b30] outline-none transition placeholder:text-[#b3a0a4] focus:border-[#bd8c97]"
                      />
                    </div>
                  )}

                  <div className="mt-5">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
                      Order Notes
                      <span className="ml-1 font-normal normal-case tracking-normal text-[#b09da1]">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      value={
                        form.notes
                      }
                      onChange={(event) =>
                        updateForm(
                          "notes",
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="Anything we should know about your order?"
                      className="w-full resize-none rounded-2xl border border-[#e6d9d6] bg-white px-4 py-3.5 text-sm leading-6 text-[#3c2b30] outline-none transition placeholder:text-[#b3a0a4] focus:border-[#bd8c97]"
                    />
                  </div>

                </section>

                {/* PAYMENT */}
                <section className="rounded-[28px] border border-[#eadedb] bg-white p-6 shadow-[0_15px_50px_rgba(80,45,52,0.04)] md:p-7">

                  <div className="mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a06a76]">
                      03
                    </p>

                    <h2 className="mt-1 font-serif text-2xl text-[#3a292d]">
                      Payment
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#9a8388]">
                      Send your payment using one of the
                      options below, then upload the
                      screenshot of the successful payment.
                    </p>
                  </div>

                  {/* BUSINESS PAYMENT DETAILS */}
                  <div className="rounded-2xl border border-[#eadedb] bg-[#fffaf8] p-5">

                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a06a76]">
                        Pay to
                      </p>

                      <h3 className="mt-1 font-serif text-xl text-[#3a292d]">
                        {BUSINESS.name}
                      </h3>
                    </div>

                    {/* MOMO */}
                    <div className="rounded-2xl border border-[#eadedb] bg-white p-4">

                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0898d]">
                            Mobile Money
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#4b363c]">
                            {BUSINESS.network}
                          </p>
                        </div>

                        <span className="rounded-full bg-[#f6e9eb] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8f5966]">
                          MTN
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">

                        <PaymentDetail
                          label="Number"
                          value={
                            BUSINESS.momoNumber
                          }
                        />

                        <PaymentDetail
                          label="Account Name"
                          value={
                            BUSINESS.momoName
                          }
                        />

                      </div>
                    </div>

                    {/* BANK */}
                    <div className="mt-3 rounded-2xl border border-[#eadedb] bg-white p-4">

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0898d]">
                          Bank Transfer
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#4b363c]">
                          {BUSINESS.bank}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">

                        <PaymentDetail
                          label="Account Number"
                          value={
                            BUSINESS.bankAccount
                          }
                        />

                        <PaymentDetail
                          label="Account Name"
                          value={
                            BUSINESS.bankName
                          }
                        />

                      </div>
                    </div>

                  </div>

                  {/* PAYMENT METHOD */}
                  <div className="mt-6">

                    <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
                      Payment Method
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">

                      <PaymentMethodOption
                        selected={
                          paymentMethod ===
                          "MTN Mobile Money"
                        }
                        title="MTN Mobile Money"
                        subtitle="0545473865"
                        onClick={() =>
                          setPaymentMethod(
                            "MTN Mobile Money"
                          )
                        }
                      />

                      <PaymentMethodOption
                        selected={
                          paymentMethod ===
                          "Ecobank"
                        }
                        title="Ecobank"
                        subtitle="1441004878729"
                        onClick={() =>
                          setPaymentMethod(
                            "Ecobank"
                          )
                        }
                      />

                    </div>
                  </div>

                  {/* UPLOAD */}
                  <div className="mt-6">

                    <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
                      Payment Screenshot
                    </label>

                    {!paymentFile ? (
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dfcccf] bg-[#fffaf8] px-5 py-9 text-center transition hover:border-[#bd8c97] hover:bg-[#fdf4f5]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5e8ea] text-[#98636e]">
                          <ImagePlus size={22} />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[#4b363c]">
                          Upload payment screenshot
                        </p>

                        <p className="mt-1 text-xs text-[#9a8388]">
                          JPG, PNG or WEBP · Max 8MB
                        </p>
                      </button>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-[#eadedb] bg-[#fffaf8]">

                        <div className="relative">

                          {paymentPreview && (
                            <img
                              src={
                                paymentPreview
                              }
                              alt="Payment screenshot preview"
                              className="max-h-[420px] w-full object-contain bg-[#f5f0ee] p-3"
                            />
                          )}

                          <button
                            type="button"
                            onClick={
                              removePaymentFile
                            }
                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#765d63] shadow-md transition hover:text-[#a84d5a]"
                            aria-label="Remove payment screenshot"
                          >
                            <X size={17} />
                          </button>

                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-[#eadedb] px-4 py-3">

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-[#4b363c]">
                              {
                                paymentFile.name
                              }
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#9a8388]">
                              Payment screenshot ready
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            className="shrink-0 text-xs font-semibold text-[#8f5966] hover:underline"
                          >
                            Change
                          </button>

                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) =>
                        handlePaymentFile(
                          event.target
                            .files?.[0]
                        )
                      }
                    />

                    <p className="mt-3 text-[10px] leading-5 text-[#9a8388]">
                      After sending the money, upload
                      the screenshot showing the successful
                      transaction. Your payment proof will
                      be attached to this order.
                    </p>

                  </div>

                </section>

              </div>

              {/* RIGHT SIDE */}
              <aside className="h-fit lg:sticky lg:top-28">

                <section className="overflow-hidden rounded-[28px] border border-[#eadedb] bg-white shadow-[0_20px_60px_rgba(80,45,52,0.07)]">

                  <div className="border-b border-[#eee3e0] px-6 py-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a06a76]">
                          Your Selection
                        </p>

                        <h2 className="mt-1 font-serif text-2xl text-[#3a292d]">
                          Order Summary
                        </h2>
                      </div>

                      <span className="rounded-full bg-[#f6e9eb] px-3 py-1.5 text-[10px] font-semibold text-[#8f5966]">
                        {cartItems.length}{" "}
                        {cartItems.length ===
                        1
                          ? "item"
                          : "items"}
                      </span>

                    </div>
                  </div>

                  <div className="max-h-[430px] divide-y divide-[#f0e7e5] overflow-y-auto">

                    {cartItems.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="p-5"
                        >
                          <div className="flex gap-4">

                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f3e9e4]">
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                                className="h-full w-full object-contain p-2"
                              />
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-3">

                                <div>
                                  <h3 className="font-serif text-[15px] leading-5 text-[#4b363c]">
                                    {
                                      item.name
                                    }
                                  </h3>

                                  {item.option && (
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#a0898d]">
                                      {
                                        item.option
                                      }
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(
                                      item.id
                                    )
                                  }
                                  className="shrink-0 text-[#a58d92] transition hover:text-[#a84d5a]"
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <Trash2
                                    size={15}
                                  />
                                </button>

                              </div>

                              <div className="mt-3 flex items-center justify-between">

                                <div className="flex items-center rounded-full border border-[#e5d8d5] bg-[#fcfaf9]">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        item.quantity -
                                          1
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center text-[#806b70] transition hover:text-[#8f5966]"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus
                                      size={13}
                                    />
                                  </button>

                                  <span className="w-7 text-center text-xs font-semibold text-[#60484e]">
                                    {
                                      item.quantity
                                    }
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
                                    className="flex h-8 w-8 items-center justify-center text-[#806b70] transition hover:text-[#8f5966]"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus
                                      size={13}
                                    />
                                  </button>

                                </div>

                                <p className="text-sm font-semibold text-[#60484e]">
                                  {formatCurrency(
                                    item.price *
                                      item.quantity
                                  )}
                                </p>

                              </div>

                            </div>
                          </div>
                        </div>
                      )
                    )}

                  </div>

                  {/* TOTALS */}
                  <div className="border-t border-[#eee3e0] bg-[#fcfaf9] px-6 py-5">

                    <div className="space-y-3 text-sm">

                      <div className="flex justify-between text-[#806b70]">
                        <span>
                          Subtotal
                        </span>

                        <span>
                          {formatCurrency(
                            subtotal
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-[#806b70]">
                        <span>
                          Delivery
                        </span>

                        <span className="text-right text-xs">
                          Arranged with seller
                        </span>
                      </div>

                      <div className="flex justify-between text-[#806b70]">
                        <span>
                          Ayosa service fee
                        </span>

                        <span>
                          {formatCurrency(
                            PLATFORM_FEE
                          )}
                        </span>
                      </div>

                    </div>

                    <div className="my-5 h-px bg-[#e7dcda]" />

                    <div className="flex items-end justify-between">

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a18a8e]">
                          Total
                        </p>

                        <p className="mt-1 font-serif text-3xl text-[#54252a]">
                          {formatCurrency(
                            total
                          )}
                        </p>
                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={
                        placingOrder
                      }
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8f5966] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(143,89,102,0.18)] transition hover:-translate-y-0.5 hover:bg-[#7d4c59] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {placingOrder ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingBag
                            size={17}
                          />
                          Place Order
                        </>
                      )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] leading-5 text-[#9a8388]">
                      <ShieldCheck
                        size={14}
                      />

                      <span>
                        Your order and payment
                        proof are securely submitted
                        to Ayosa Beauty.
                      </span>
                    </div>

                  </div>

                </section>
              </aside>

            </div>
          </form>
        )}

      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-[#846d72]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#e6d9d6] bg-white px-4 py-3.5 text-sm text-[#3c2b30] outline-none transition placeholder:text-[#b3a0a4] focus:border-[#bd8c97]"
      />
    </div>
  );
}

function PaymentDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#fcfaf9] p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a0898d]">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-[#4b363c]">
        {value}
      </p>
    </div>
  );
}

function PaymentMethodOption({
  selected,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-[#bd8c97] bg-[#fcf3f4] shadow-[0_8px_25px_rgba(143,89,102,0.07)]"
          : "border-[#eadedb] bg-white hover:border-[#d6b9be]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">

        <div>
          <p className="text-sm font-semibold text-[#4c373d]">
            {title}
          </p>

          <p className="mt-1 text-xs text-[#917b80]">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            selected
              ? "border-[#8f5966] bg-[#8f5966]"
              : "border-[#d8c8c8] bg-white"
          }`}
        >
          {selected && (
            <Check
              size={12}
              className="text-white"
            />
          )}
        </div>

      </div>
    </button>
  );
}

function DeliveryOption({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-[#bd8c97] bg-[#fcf3f4] shadow-[0_8px_25px_rgba(143,89,102,0.07)]"
          : "border-[#eadedb] bg-white hover:border-[#d6b9be]"
      }`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-[#8f5966] text-white"
            : "bg-[#f5e8ea] text-[#98636e]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#4c373d]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#917b80]">
          {description}
        </p>
      </div>
    </button>
  );
}