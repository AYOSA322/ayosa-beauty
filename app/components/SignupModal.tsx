"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SignupStep = "signup" | "verify" | "success";

export default function SignupModal({
  isOpen,
  onClose,
}: SignupModalProps) {
  const supabase = createClient();

  const [step, setStep] = useState<SignupStep>("signup");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [countdown, setCountdown] = useState(0);

  /*
   * Countdown for resend button
   */
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  /*
   * Reset everything when modal closes
   */
  const resetModal = () => {
    setStep("signup");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setLoading(false);
    setError("");
    setMessage("");
    setCountdown(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  /*
   * CREATE ACCOUNT
   */
  const handleSignup = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

      if (signupError) {
        console.error("Signup error:", signupError);
        setError(signupError.message);
        return;
      }

      if (!data.user) {
        setError(
          "We couldn't create your account. Please try again."
        );
        return;
      }

      /*
       * Move to the OTP screen.
       *
       * Supabase sends the confirmation email automatically
       * when email confirmation is enabled.
       */
      setStep("verify");
      setOtp("");
      setCountdown(60);

      setMessage(
        `We've sent a 6-digit verification code to ${cleanEmail}.`
      );
    } catch (err) {
      console.error("Unexpected signup error:", err);

      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * VERIFY 6-DIGIT CODE
   */
  const handleVerify = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanOtp = otp.replace(/\D/g, "");

    if (cleanOtp.length !== 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } =
        await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: cleanOtp,
          type: "email",
        });

      if (verifyError) {
        console.error("Verification error:", verifyError);

        setError(
          "That verification code is incorrect or has expired. Please request a new code."
        );

        return;
      }

      /*
       * Verification succeeded.
       */
      setError("");
      setMessage("");
      setStep("success");
    } catch (err) {
      console.error("Unexpected verification error:", err);

      setError(
        "We couldn't verify your email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * RESEND CODE
   */
  const handleResendCode = async () => {
    if (countdown > 0 || loading) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resendError } =
        await supabase.auth.resend({
          type: "signup",
          email: email.trim().toLowerCase(),
        });

      if (resendError) {
        console.error("Resend error:", resendError);
        setError(resendError.message);
        return;
      }

      setOtp("");
      setCountdown(60);

      setMessage(
        "We've sent you a new 6-digit verification code."
      );
    } catch (err) {
      console.error("Unexpected resend error:", err);

      setError(
        "We couldn't resend the verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * OTP input
   *
   * Only numbers.
   * Maximum of exactly 6 digits.
   */
  const handleOtpChange = (value: string) => {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(digitsOnly);

    if (error) {
      setError("");
    }
  };

  /*
   * Don't render anything if the modal isn't open.
   */
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(65, 27, 45, 0.52), rgba(211, 130, 162, 0.38))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Decorative background glow */}
      <div
        className="pointer-events-none absolute left-[8%] top-[12%] h-48 w-48 rounded-full blur-3xl"
        style={{
          background: "rgba(236, 166, 194, 0.35)",
        }}
      />

      <div
        className="pointer-events-none absolute bottom-[8%] right-[5%] h-64 w-64 rounded-full blur-3xl"
        style={{
          background: "rgba(216, 137, 165, 0.28)",
        }}
      />

      {/* Main modal */}
      <div
        className="relative my-auto w-full max-w-[470px] overflow-hidden rounded-[34px]"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,246,250,0.98))",
          border:
            "1px solid rgba(255,255,255,0.92)",
          boxShadow:
            "0 35px 100px rgba(76, 31, 52, 0.30)",
        }}
      >
        {/* Top decorative strip */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, #e8a8c0, #c96e94, #e8a8c0)",
          }}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close signup"
          className="absolute right-5 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full text-xl transition duration-200 hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.82)",
            color: "#704054",
            border: "1px solid rgba(216,137,165,0.18)",
          }}
        >
          ×
        </button>

        <div className="relative px-6 pb-9 pt-9 sm:px-9">
          {/* ================================================== */}
          {/* SIGNUP SCREEN                                      */}
          {/* ================================================== */}

          {step === "signup" && (
            <>
              {/* Ayosa logo */}
              <div className="mb-6 flex justify-center">
                <div
                  className="overflow-hidden rounded-[22px]"
                  style={{
                    width: "190px",
                    height: "105px",
                    background: "#f9e5ed",
                    border:
                      "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 14px 35px rgba(184,93,130,0.16)",
                  }}
                >
                  <img
                    src="/images/ayosa-logo.jpeg"
                    alt="Ayosa Beauty"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="mb-7 text-center">
                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em]"
                  style={{
                    color: "#c16d91",
                  }}
                >
                  WELCOME TO AYOSA
                </p>

                <h1
                  className="text-[30px] font-bold leading-tight"
                  style={{
                    color: "#492637",
                  }}
                >
                  Create your account
                </h1>

                <p
                  className="mx-auto mt-3 max-w-[350px] text-sm leading-6"
                  style={{
                    color: "#866372",
                  }}
                >
                  Create your Ayosa Beauty account and
                  discover quality chosen with care.
                </p>
              </div>

              <form
                onSubmit={handleSignup}
                className="space-y-4"
              >
                {/* Full name */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: "#62404e",
                    }}
                  >
                    Full name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full rounded-2xl px-4 py-4 text-sm outline-none transition duration-200"
                    style={{
                      background: "#fff",
                      border:
                        "1px solid #efd4df",
                      color: "#492637",
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: "#62404e",
                    }}
                  >
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-2xl px-4 py-4 text-sm outline-none transition duration-200"
                    style={{
                      background: "#fff",
                      border:
                        "1px solid #efd4df",
                      color: "#492637",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: "#62404e",
                    }}
                  >
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl px-4 py-4 text-sm outline-none transition duration-200"
                    style={{
                      background: "#fff",
                      border:
                        "1px solid #efd4df",
                      color: "#492637",
                    }}
                  />
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{
                      color: "#62404e",
                    }}
                  >
                    Confirm password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    className="w-full rounded-2xl px-4 py-4 text-sm outline-none transition duration-200"
                    style={{
                      background: "#fff",
                      border:
                        "1px solid #efd4df",
                      color: "#492637",
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="rounded-2xl px-4 py-3 text-sm leading-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #fff0f4, #ffe7ef)",
                      color: "#a33d65",
                      border:
                        "1px solid #f4cbd9",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Create account */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-2xl py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, #d889a5, #b85d82)",
                    boxShadow:
                      "0 14px 30px rgba(184,93,130,0.25)",
                  }}
                >
                  {loading
                    ? "Creating your account..."
                    : "Create My Account"}
                </button>

                <p
                  className="pt-1 text-center text-xs leading-5"
                  style={{
                    color: "#a17b8a",
                  }}
                >
                  By creating an account, you agree to
                  Ayosa Beauty's terms and privacy policy.
                </p>
              </form>
            </>
          )}

          {/* ================================================== */}
          {/* VERIFICATION SCREEN                               */}
          {/* ================================================== */}

          {step === "verify" && (
            <>
              {/* Ayosa logo */}
              <div className="mb-6 flex justify-center">
                <div
                  className="overflow-hidden rounded-[22px]"
                  style={{
                    width: "180px",
                    height: "100px",
                    background: "#f9e5ed",
                    border:
                      "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 14px 35px rgba(184,93,130,0.16)",
                  }}
                >
                  <img
                    src="/images/ayosa-logo.jpeg"
                    alt="Ayosa Beauty"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="text-center">
                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em]"
                  style={{
                    color: "#c16d91",
                  }}
                >
                  ONE LAST STEP
                </p>

                <h1
                  className="text-[30px] font-bold leading-tight"
                  style={{
                    color: "#492637",
                  }}
                >
                  Verify your email
                </h1>

                <p
                  className="mx-auto mt-3 max-w-[350px] text-sm leading-6"
                  style={{
                    color: "#866372",
                  }}
                >
                  We've sent a 6-digit verification code
                  to
                </p>

                <p
                  className="mt-1 break-all text-sm font-semibold"
                  style={{
                    color: "#a64f73",
                  }}
                >
                  {email}
                </p>
              </div>

              <form
                onSubmit={handleVerify}
                className="mt-7"
              >
                <label
                  className="mb-3 block text-center text-sm font-medium"
                  style={{
                    color: "#62404e",
                  }}
                >
                  Enter your 6-digit code
                </label>

                {/* OTP field */}
                <div
                  className="rounded-[24px] p-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #fff, #fff4f8)",
                    border:
                      "1px solid #efd1dd",
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      handleOtpChange(
                        event.target.value
                      )
                    }
                    placeholder="000000"
                    aria-label="6-digit verification code"
                    className="w-full rounded-[18px] bg-transparent px-4 py-5 text-center text-[30px] font-bold tracking-[0.38em] outline-none"
                    style={{
                      color: "#4d2939",
                    }}
                  />
                </div>

                <p
                  className="mt-3 text-center text-xs"
                  style={{
                    color: "#a17b8a",
                  }}
                >
                  Enter exactly the 6 digits from your
                  Ayosa Beauty email.
                </p>

                {/* Error */}
                {error && (
                  <div
                    className="mt-4 rounded-2xl px-4 py-3 text-center text-sm leading-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #fff0f4, #ffe7ef)",
                      color: "#a33d65",
                      border:
                        "1px solid #f4cbd9",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Message */}
                {message && !error && (
                  <div
                    className="mt-4 rounded-2xl px-4 py-3 text-center text-sm leading-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #fff6f9, #fceaf1)",
                      color: "#89536b",
                      border:
                        "1px solid #f0d2df",
                    }}
                  >
                    {message}
                  </div>
                )}

                {/* Verify */}
                <button
                  type="submit"
                  disabled={
                    loading || otp.length !== 6
                  }
                  className="mt-5 w-full rounded-2xl py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, #d889a5, #b85d82)",
                    boxShadow:
                      "0 14px 30px rgba(184,93,130,0.25)",
                  }}
                >
                  {loading
                    ? "Verifying your email..."
                    : "Verify My Email"}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={
                    countdown > 0 || loading
                  }
                  className="text-sm font-semibold transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    color: "#b85d82",
                  }}
                >
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : "Didn't receive the code? Resend"}
                </button>
              </div>

              <div
                className="mt-7 rounded-2xl px-4 py-3 text-center"
                style={{
                  background:
                    "rgba(249,229,237,0.65)",
                }}
              >
                <p
                  className="text-xs leading-5"
                  style={{
                    color: "#987180",
                  }}
                >
                  Your verification code is private.
                  Never share it with anyone.
                </p>
              </div>
            </>
          )}

          {/* ================================================== */}
          {/* SUCCESS SCREEN                                    */}
          {/* ================================================== */}

          {step === "success" && (
            <div className="py-7 text-center">
              {/* Logo */}
              <div className="mb-7 flex justify-center">
                <div
                  className="overflow-hidden rounded-[22px]"
                  style={{
                    width: "190px",
                    height: "105px",
                    background: "#f9e5ed",
                    border:
                      "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 14px 35px rgba(184,93,130,0.16)",
                  }}
                >
                  <img
                    src="/images/ayosa-logo.jpeg"
                    alt="Ayosa Beauty"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Success icon */}
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #d889a5, #b85d82)",
                  boxShadow:
                    "0 15px 35px rgba(184,93,130,0.25)",
                }}
              >
                <span
                  className="text-4xl font-semibold text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>

              <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{
                  color: "#c16d91",
                }}
              >
                WELCOME TO AYOSA
              </p>

              <h1
                className="text-[30px] font-bold leading-tight"
                style={{
                  color: "#492637",
                }}
              >
                You're officially in
              </h1>

              <p
                className="mx-auto mt-3 max-w-[350px] text-sm leading-6"
                style={{
                  color: "#866372",
                }}
              >
                Your email has been verified successfully.
                Welcome to Ayosa Beauty, {fullName}.
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="mt-7 w-full rounded-2xl py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #d889a5, #b85d82)",
                  boxShadow:
                    "0 14px 30px rgba(184,93,130,0.25)",
                }}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}