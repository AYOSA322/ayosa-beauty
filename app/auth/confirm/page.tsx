"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase";

export default function ConfirmEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `code-${index + 1}`
      ) as HTMLInputElement | null;

      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      const previousInput = document.getElementById(
        `code-${index - 1}`
      ) as HTMLInputElement | null;

      previousInput?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newCode = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      newCode[index] = digit;
    });

    setCode(newCode);

    const nextEmptyIndex = Math.min(pasted.length, 5);

    const nextInput = document.getElementById(
      `code-${nextEmptyIndex}`
    ) as HTMLInputElement | null;

    nextInput?.focus();
  };

  const verifyCode = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("We couldn't find the email address for this account.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "signup",
      });

      if (verifyError) {
        console.error("Verification error:", verifyError);
        setError(
          "That code is incorrect or has expired. Please check your email and try again."
        );
        setLoading(false);
        return;
      }

      setMessage("Your email has been verified successfully!");

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!email) {
      setError("We couldn't find your email address.");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (resendError) {
        console.error("Resend error:", resendError);
        setError("We couldn't resend the code. Please try again.");
      } else {
        setMessage("A new verification code has been sent to your email.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while resending the code.");
    }

    setResending(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top left, #ffe5ef 0%, transparent 35%), linear-gradient(135deg, #fff8fb 0%, #fdebf3 50%, #f8d7e5 100%)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "470px",
          background: "rgba(255,255,255,0.96)",
          borderRadius: "32px",
          padding: "42px 30px",
          textAlign: "center",
          boxShadow: "0 25px 70px rgba(126, 51, 82, 0.18)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        {/* Ayosa Logo */}
        <div
          style={{
            width: "76px",
            height: "76px",
            margin: "0 auto 22px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #d98aaa 0%, #bd668b 100%)",
            color: "#fff",
            fontSize: "27px",
            fontWeight: 700,
            boxShadow: "0 12px 30px rgba(189,102,139,0.28)",
          }}
        >
          AY
        </div>

        <h1
          style={{
            margin: "0",
            color: "#54243d",
            fontSize: "29px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          Verify your email
        </h1>

        <p
          style={{
            margin: "12px auto 0",
            maxWidth: "360px",
            color: "#81616f",
            fontSize: "15px",
            lineHeight: 1.7,
          }}
        >
          We've sent a 6-digit verification code to
        </p>

        <p
          style={{
            margin: "5px 0 28px",
            color: "#54243d",
            fontSize: "14px",
            fontWeight: 700,
            wordBreak: "break-word",
          }}
        >
          {email || "your email address"}
        </p>

        {/* Code Inputs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "9px",
            marginBottom: "26px",
          }}
          onPaste={handlePaste}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) =>
                handleChange(event.target.value, index)
              }
              onKeyDown={(event) => handleKeyDown(event, index)}
              style={{
                width: "50px",
                height: "58px",
                borderRadius: "15px",
                border: digit
                  ? "2px solid #c96d93"
                  : "1px solid #e8c7d5",
                background: digit ? "#fff7fa" : "#ffffff",
                color: "#54243d",
                textAlign: "center",
                fontSize: "24px",
                fontWeight: 700,
                outline: "none",
                boxShadow: digit
                  ? "0 6px 18px rgba(201,109,147,0.12)"
                  : "none",
              }}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 15px",
              borderRadius: "12px",
              background: "#fff0f3",
              color: "#a33d61",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 15px",
              borderRadius: "12px",
              background: "#f2fbf6",
              color: "#397455",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={verifyCode}
          disabled={loading}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "16px",
            padding: "16px",
            background:
              "linear-gradient(135deg, #d17b9d 0%, #b95f84 100%)",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 12px 28px rgba(185,95,132,0.25)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Verifying..." : "Verify my email"}
        </button>

        <div style={{ marginTop: "22px" }}>
          <p
            style={{
              margin: "0 0 8px",
              color: "#967582",
              fontSize: "13px",
            }}
          >
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={resendCode}
            disabled={resending}
            style={{
              border: "none",
              background: "transparent",
              color: "#b85f84",
              fontSize: "14px",
              fontWeight: 700,
              cursor: resending ? "not-allowed" : "pointer",
            }}
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>

        <div
          style={{
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid #f2dce5",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#b08b9b",
              fontSize: "12px",
            }}
          >
            Ayosa Beauty
          </p>

          <p
            style={{
              margin: "5px 0 0",
              color: "#c19daa",
              fontSize: "11px",
            }}
          >
            Driven by quality, chosen by those who know the difference.
          </p>
        </div>
      </div>
    </main>
  );
}