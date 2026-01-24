"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { Lock, Mail, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [tempUserId, setTempUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mfaRequired) {
        // Handle MFA Verification
        const res = await fetch("/api/auth/mfa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: tempUserId, code: mfaCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid MFA code");
        router.push("/dashboard");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.mfaRequired) {
        setMfaRequired(true);
        setTempUserId(data.tempUserId);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-primary/10 rounded-xl text-primary">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold">{mfaRequired ? "Verification Required" : "Welcome Back"}</h1>
          <p className="text-muted-foreground mt-2">
            {mfaRequired ? "Enter your 2FA security code" : "Access your encrypted vault"}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-center gap-2"
          >
            <AlertTriangle size={16} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!mfaRequired ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium">Password</label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5">2FA Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-center font-bold text-xl tracking-widest"
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Decrypting..." : (mfaRequired ? "Verify & Unlock" : "Access Vault")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <NextLink href="/register" className="text-primary hover:underline font-medium">
            Create Secure ID
          </NextLink>
        </p>
      </motion.div>
    </div>
  );
}
