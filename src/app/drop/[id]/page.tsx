"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, Lock, CreditCard, Unlock, FileText, Download, Wallet, ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DropPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [decryptedContent, setDecryptedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    // 1. Fetch drop metadata
    fetch(`/api/transfers/${id}/meta`)
      .then((res) => res.json())
      .then((meta) => setData(meta))
      .catch(console.error)
      .finally(() => setLoading(false));

    // 2. Fetch user balance for the UI
    fetch("/api/profile")
      .then((res) => res.json())
      .then((u: { balance: number }) => setUserBalance(u.balance))
      .catch(() => setUserBalance(null));
  }, [id]);

  const handleUnlock = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/transfers/${id}/unlock`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        setDecryptedContent(json.content);
        setData({ ...data, status: "PAID" });
        // Update local balance display
        if (userBalance !== null) setUserBalance(prev => (prev || 0) - (data.price || 0));
      } else {
        alert(json.error || "Unlock failed");
      }
    } catch (e) {
      alert("Encryption error or network failure");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono opacity-50">INITIATING DECRYPTION SEQUENCE...</div>;
  if (!data || data.error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <Lock size={48} className="text-red-500 mb-4 opacity-50" />
      <h1 className="text-xl font-bold mb-2">Drop Invalid or Expired</h1>
      <p className="text-muted-foreground mb-6">The assets you are looking for are no longer on the network.</p>
      <Link href="/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-card border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Progress Bar Header */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <motion.div
            className={`h-full ${decryptedContent ? "bg-emerald-500" : "bg-primary"}`}
            initial={{ width: "30%" }}
            animate={{ width: decryptedContent ? "100%" : "60%" }}
          />
        </div>

        <div className="flex justify-between items-start mb-8 mt-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary">
            <ShieldCheck size={12} />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <div className={`inline-block p-6 rounded-3xl mb-6 transition-all duration-500 ${decryptedContent ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--color-primary),0.2)]"}`}>
            {decryptedContent ? <Unlock size={64} /> : <Lock size={64} />}
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">{data.title}</h1>
          <p className="text-muted-foreground text-sm">
            FROM: <span className="text-foreground font-bold">{data.sender?.email || "ANONYMOUS"}</span>
          </p>
        </div>

        {!decryptedContent ? (
          <div className="space-y-6">
            <div className="bg-background/50 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
              {data.price > 0 && data.status !== "PAID" ? (
                <>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Escrow Requirement</p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-4xl font-black tracking-tighter">${data.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground self-end mb-1">USD</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleUnlock}
                      disabled={paying}
                      className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50 group"
                    >
                      {paying ? "AUTHORIZING..." : (
                        <>
                          <Wallet size={20} className="group-hover:rotate-12 transition-transform" />
                          Authorize Secure Payment
                        </>
                      )}
                    </button>

                    {userBalance !== null && (
                      <p className={`text-[10px] font-bold ${userBalance < data.price ? "text-red-500" : "text-muted-foreground opacity-50"}`}>
                        Your Vault Balance: ${userBalance.toFixed(2)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Asset Authenticated • Ready to Decrypt</p>
                  <button
                    onClick={handleUnlock}
                    disabled={paying}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {paying ? "DECRYPTING..." : (
                      <>
                        <ShieldCheck size={20} /> Access Protected Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-center text-muted-foreground italic px-8 leading-relaxed">
              By clicking unlock, you verify the identity of the sender and agree to the secure transfer of encrypted assets via the CipherDrop Escrow system.
            </p>
          </div>
        ) : (
          <div className="bg-black/40 rounded-3xl p-8 border border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs uppercase tracking-widest text-emerald-500 font-black">Decrypted Asset</h3>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">RAW DATA</span>
            </div>

            {decryptedContent.startsWith("data:") ? (
              <div className="text-center py-6">
                <div className="bg-white/5 inline-flex p-6 rounded-full mb-6 border border-white/5">
                  <FileText size={48} className="text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-6 font-mono truncate px-4">{data.title}</h4>
                <a
                  href={decryptedContent}
                  download={data.title || "secure-download"}
                  className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-black transition-all shadow-2xl hover:bg-white/90 active:scale-95"
                >
                  <Download size={20} /> DOWNLOAD NOW
                </a>
              </div>
            ) : (
              <div className="bg-background/80 p-6 rounded-2xl border border-white/5 font-mono text-xs leading-relaxed break-all max-h-[350px] overflow-auto whitespace-pre-wrap selection:bg-primary selection:text-white">
                {decryptedContent}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-tight">
                <ShieldCheck size={14} />
                <span>AES-256 GCM INTEGRITY VERIFIED</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Footer Branding */}
      <footer className="mt-12 opacity-30 flex items-center gap-2 grayscale brightness-200">
        <Shield size={16} />
        <span className="text-xs font-black tracking-[0.5em] uppercase">CipherDrop v2.0</span>
      </footer>
    </div>
  );
}
