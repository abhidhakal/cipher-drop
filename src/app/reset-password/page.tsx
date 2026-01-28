"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import NextLink from "next/link";
import { useToast } from "@/components/Toast";
import { getCsrfToken } from "@/lib/csrf";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength logic (reused simplified version)
  const strength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isStrong = Object.values(strength).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return showToast("Invalid token", "error");
    if (password !== confirmPassword) return showToast("Passwords do not match", "error");
    if (!isStrong) return showToast("Password does not meet requirements", "error");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken() || ""
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        showToast("Password reset successfully", "success");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        showToast(data.error || "Reset failed", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-red-500 font-bold">
        Invalid or missing reset token. Please request a new link.
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex p-6 bg-emerald-500/10 rounded-full text-emerald-500 mb-6 scale-125">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-black mb-2">Password Reset!</h2>
        <p className="text-muted-foreground mb-6">Your password has been successfully updated.</p>
        <p className="text-sm text-primary animate-pulse">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-bold opacity-70 block mb-2">New Password</label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background/50 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 pl-10 outline-none transition-all"
            required
          />
          <Lock className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
        </div>
        {/* Simple Strength Meter */}
        <div className="flex gap-1 mt-2 h-1">
          <div className={`flex-1 rounded-full transition-colors ${strength.length ? "bg-emerald-500" : "bg-white/10"}`} />
          <div className={`flex-1 rounded-full transition-colors ${strength.upper ? "bg-emerald-500" : "bg-white/10"}`} />
          <div className={`flex-1 rounded-full transition-colors ${strength.lower ? "bg-emerald-500" : "bg-white/10"}`} />
          <div className={`flex-1 rounded-full transition-colors ${strength.number ? "bg-emerald-500" : "bg-white/10"}`} />
          <div className={`flex-1 rounded-full transition-colors ${strength.special ? "bg-emerald-500" : "bg-white/10"}`} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Min 8 chars, Uppercase, Lowercase, Number, Special.
        </p>
      </div>

      <div>
        <label className="text-sm font-bold opacity-70 block mb-2">Confirm New Password</label>
        <div className="relative">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-background/50 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 pl-10 outline-none transition-all"
            required
          />
          <Lock className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !isStrong}
        className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  // Wrap in Suspense as useSearchParams is used
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <div className="max-w-md w-full bg-card border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <NextLink href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </NextLink>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Secure Reset</h1>
          <p className="text-muted-foreground">Create a new strong password.</p>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
