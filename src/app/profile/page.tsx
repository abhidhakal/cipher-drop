"use client";

import { useState, useEffect } from "react";
import { User, Shield, Key, Save, Lock, CheckCircle2, AlertCircle, Wallet, Plus, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", email: "", mfaEnabled: false, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);

  // MFA Setup State
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");

  // Password Change State
  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfile(data);
    setLoading(false);
  };

  const handleTopup = async () => {
    setAddingFunds(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50.00 }) // Flat $50 for demo
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start payment: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Payment initiation failed");
    } finally {
      setAddingFunds(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name }) // Only save name, MFA is handled separately
    });
    setSaving(false);
    router.refresh();
  };

  // Start MFA Setup - Get secret and QR code
  const startMfaSetup = async () => {
    setMfaLoading(true);
    setMfaError("");
    setMfaSuccess("");
    try {
      const res = await fetch("/api/auth/mfa/setup");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start MFA setup");

      if (data.mfaEnabled) {
        setMfaError("MFA is already enabled");
      } else {
        setMfaSetup({ secret: data.secret, otpauthUri: data.otpauthUri });
      }
    } catch (err: any) {
      setMfaError(err.message);
    } finally {
      setMfaLoading(false);
    }
  };

  // Verify code and enable MFA
  const enableMfa = async () => {
    if (mfaCode.length !== 6) {
      setMfaError("Please enter a 6-digit code");
      return;
    }

    setMfaLoading(true);
    setMfaError("");
    try {
      const res = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: mfaCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      setMfaSuccess("MFA enabled successfully!");
      setProfile({ ...profile, mfaEnabled: true });
      setMfaSetup(null);
      setMfaCode("");
    } catch (err: any) {
      setMfaError(err.message);
    } finally {
      setMfaLoading(false);
    }
  };

  // Disable MFA
  const disableMfa = async () => {
    if (mfaCode.length !== 6) {
      setMfaError("Please enter your current 2FA code to disable");
      return;
    }

    setMfaLoading(true);
    setMfaError("");
    try {
      const res = await fetch("/api/auth/mfa/setup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: mfaCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable MFA");

      setMfaSuccess("MFA disabled");
      setProfile({ ...profile, mfaEnabled: false });
      setMfaCode("");
    } catch (err: any) {
      setMfaError(err.message);
    } finally {
      setMfaLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (pwData.newPassword !== pwData.confirmNewPassword) {
      setPwError("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setPwSuccess(true);
      setPwData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      setPwError(err.message);
    }
  };

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = getStrength(pwData.newPassword);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Vault Identity...</div>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Security Command Center</h1>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        {/* Ledger Balance Card */}
        <div className="mb-8 bg-linear-to-r from-primary/20 to-blue-500/10 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
              <Wallet size={32} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-black text-primary mb-1">Vault Ledger Balance</p>
              <h2 className="text-4xl font-black">${profile.balance.toFixed(2)}</h2>
            </div>
          </div>
          <button
            onClick={handleTopup}
            disabled={addingFunds}
            className="relative z-10 flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus size={18} />
            {addingFunds ? "Redirecting..." : "Add $50 via Stripe"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Profile & Settings */}
          <div className="space-y-8">
            <div className="bg-card border border-white/10 rounded-2xl p-8 space-y-8 shadow-xl">
              <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--color-primary),0.2)]">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold truncate max-w-[200px]">{profile.email}</h2>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px]">Secure Identity</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <User size={18} className="text-muted-foreground" />
                  Personal Details
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-1.5 opacity-70">Display Name</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="font-semibold flex items-center gap-2 text-emerald-400">
                  <Shield size={18} />
                  Access Protections
                </h3>

                {/* MFA Status Messages */}
                {mfaError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} /> {mfaError}
                  </div>
                )}
                {mfaSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={14} /> {mfaSuccess}
                  </div>
                )}

                <div className="p-4 bg-background/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold">Multi-Factor (MFA)</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Use Google Authenticator or Authy for 2FA.
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${profile.mfaEnabled ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                      {profile.mfaEnabled ? "ENABLED" : "DISABLED"}
                    </div>
                  </div>

                  {/* MFA Not Enabled Yet */}
                  {!profile.mfaEnabled && !mfaSetup && (
                    <button
                      onClick={startMfaSetup}
                      disabled={mfaLoading}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 border border-emerald-500/20"
                    >
                      {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                      {mfaLoading ? "Loading..." : "Setup 2FA Now"}
                    </button>
                  )}

                  {/* MFA Setup Flow - Show QR Code */}
                  {!profile.mfaEnabled && mfaSetup && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-28 h-28 bg-white p-2 rounded-lg shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaSetup.otpauthUri)}`}
                            alt="MFA QR Code"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Step 1: Scan QR Code</p>
                          <p className="text-xs text-muted-foreground">
                            Scan this QR code with Google Authenticator, Authy, or similar app.
                          </p>
                          <p className="text-[10px] text-muted-foreground">Or enter manually:</p>
                          <code className="block text-xs font-mono bg-background p-2 rounded border border-white/10 break-all select-all">
                            {mfaSetup.secret}
                          </code>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Step 2: Verify Code</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                            className="flex-1 bg-background border border-white/10 rounded-lg px-4 py-2 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-primary outline-none"
                          />
                          <button
                            onClick={enableMfa}
                            disabled={mfaLoading || mfaCode.length !== 6}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Enable
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => { setMfaSetup(null); setMfaCode(""); setMfaError(""); }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel Setup
                      </button>
                    </motion.div>
                  )}

                  {/* MFA Enabled - Show Disable Option */}
                  {profile.mfaEnabled && (
                    <motion.div
                      initial={{ opacity: 0. }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <p className="text-xs text-emerald-500 flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        2FA is active. Your account is protected.
                      </p>

                      <div className="pt-3 border-t border-white/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Disable MFA</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter current 2FA code"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                            className="flex-1 bg-background border border-white/10 rounded-lg px-4 py-2 text-center font-mono tracking-widest focus:ring-2 focus:ring-red-500 outline-none"
                          />
                          <button
                            onClick={disableMfa}
                            disabled={mfaLoading || mfaCode.length !== 6}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50 border border-red-500/20"
                          >
                            {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : "Disable"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Save size={18} />
                {saving ? "Updating..." : "Update Security Prefs"}
              </button>
            </div>
          </div>

          {/* Right Column: Password Management (Mandatory Policy) */}
          <div className="space-y-8">
            <div className="bg-card border border-white/10 rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Lock size={20} className="text-primary" />
                Change Password
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                {pwError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} /> {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={14} /> Password updated successfully!
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5 opacity-70">Current Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-background border border-white/5 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={pwData.currentPassword}
                    onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 opacity-70">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-background border border-white/5 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={pwData.newPassword}
                    onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                  />

                  {/* Real-time Strength Meter */}
                  {pwData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 rounded-full transition-all ${strength >= step ?
                              (strength <= 2 ? "bg-red-500" : strength === 3 ? "bg-yellow-500" : "bg-emerald-500")
                              : "bg-white/5"}`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Policy: 8+ chars, uppercase, digit, symbol.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 opacity-70">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-background border border-white/5 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={pwData.confirmNewPassword}
                    onChange={(e) => setPwData({ ...pwData, confirmNewPassword: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/5"
                >
                  <Key size={18} />
                  Change Secure Key
                </button>
              </form>

              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-2">Policy Highlights</p>
                <ul className="text-xs space-y-1.5 text-foreground/70">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-primary" /> No reuse of last 3 passwords.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-primary" /> Mandatory change every 90 days.
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
