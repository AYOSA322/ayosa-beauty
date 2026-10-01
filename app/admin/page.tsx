"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "../../lib/supabase";

export default function AdminLoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "The email or password is incorrect."
          : error.message
      );
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard";
  };

  return (
    <main className="min-h-screen bg-[#f7eee9] text-[#321d25]">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#d8a6a6]/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#8e4658]/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" />
        </div>

        <section className="relative w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#b98289]/30 bg-white/70 shadow-[0_15px_45px_rgba(80,35,45,0.10)] backdrop-blur">
              <ShieldCheck
                size={29}
                strokeWidth={1.5}
                className="text-[#8e4658]"
              />
            </div>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#9a6870]">
              Ayosa Beauty
            </p>

            <h1 className="font-serif text-4xl font-medium tracking-tight text-[#321d25]">
              Admin Portal
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#765c63]">
              Secure access to your Ayosa Beauty store management dashboard.
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_25px_80px_rgba(70,35,45,0.12)] backdrop-blur-xl sm:p-9">
            <div className="mb-7">
              <h2 className="font-serif text-2xl text-[#321d25]">
                Welcome back
              </h2>

              <p className="mt-1.5 text-sm text-[#876d73]">
                Sign in to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#654850]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={1.7}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a27a82]"
                  />

                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    className="h-13 w-full rounded-2xl border border-[#e7d6d3] bg-[#fffafa] pl-11 pr-4 text-sm text-[#321d25] outline-none transition placeholder:text-[#b69da1] focus:border-[#a96d79] focus:ring-4 focus:ring-[#b98289]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#654850]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.7}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a27a82]"
                  />

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-13 w-full rounded-2xl border border-[#e7d6d3] bg-[#fffafa] pl-11 pr-12 text-sm text-[#321d25] outline-none transition placeholder:text-[#b69da1] focus:border-[#a96d79] focus:ring-4 focus:ring-[#b98289]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#9b777e] transition hover:bg-[#f4e7e4] hover:text-[#713b4a]"
                  >
                    {showPassword ? (
                      <EyeOff size={17} strokeWidth={1.7} />
                    ) : (
                      <Eye size={17} strokeWidth={1.7} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex h-13 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#713b4a] px-6 text-sm font-semibold tracking-wide text-white shadow-[0_12px_30px_rgba(113,59,74,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#60303e] hover:shadow-[0_16px_35px_rgba(113,59,74,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative">
                  {loading ? "Signing in..." : "Sign in to dashboard"}
                </span>
              </button>
            </form>

            <div className="mt-7 border-t border-[#eadbd8] pt-5 text-center">
              <p className="text-[11px] leading-5 text-[#9a7d83]">
                Authorized Ayosa Beauty administrators only.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-7 text-center text-[10px] uppercase tracking-[0.25em] text-[#a2868b]">
            Driven by quality • Chosen by those who know the difference.
          </p>
        </section>
      </div>
    </main>
  );
}