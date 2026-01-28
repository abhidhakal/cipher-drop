"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, FileText, Upload, Check, Copy, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { getCsrfToken } from "@/lib/csrf";

export default function NewTransferPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "file">("text");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    price: "0",
    recipientEmail: "",
    oneTimeView: false
  });
  const [loading, setLoading] = useState(false);
  const [createdDropId, setCreatedDropId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({ ...formData, content: base64, title: formData.title || file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken() || "",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedDropId(data.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/drop/${createdDropId}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  if (createdDropId) {
    return (
      <div className="min-h-screen bg-background p-6 flex justify-center items-center">
        <div className="max-w-md w-full bg-card border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-cyan-500" />

          <div className="inline-block p-4 bg-emerald-500/10 rounded-full text-emerald-500 mb-4">
            <Check size={48} />
          </div>

          <h1 className="text-2xl font-bold mb-2">Drop Secured!</h1>
          <p className="text-muted-foreground mb-6">Your data has been encrypted and stored safely.</p>
          {formData.oneTimeView && (
            <p className="text-[10px] text-amber-500 font-bold uppercase mb-4 tracking-widest">⚠️ Self-Destruct Active: Will vanish after one view</p>
          )}

          <div className="bg-background/50 border border-white/10 rounded-lg p-3 flex items-center gap-2 mb-6 break-all text-sm font-mono text-left">
            <div className="flex-1 truncate opacity-70">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/drop/${createdDropId}`}
            </div>
            <button onClick={copyLink} className="p-2 hover:bg-white/10 rounded-md transition-colors text-primary" title="Copy Link">
              <Copy size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard" className="block w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all text-center">
              Return to Dashboard
            </Link>
            <button
              onClick={() => {
                setCreatedDropId(null);
                setFormData({ title: "", content: "", price: "0", recipientEmail: "", oneTimeView: false });
              }}
              className="block w-full py-3 bg-white/5 hover:bg-white/10 text-foreground font-semibold rounded-lg transition-all"
            >
              Send Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex justify-center items-center">
      <div className="max-w-xl w-full bg-card border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <Shield size={20} className="text-primary" />
          </Link>
          <h1 className="text-2xl font-bold">New Secure Drop</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 bg-white/5 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === "text" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white/5"}`}
          >
            <FileText size={16} /> Text Message
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === "file" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-white/5"}`}
          >
            <Upload size={16} /> Upload File
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-70">Title / Reference</label>
              <input
                type="text"
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                placeholder={mode === "file" ? "e.g. Project-Specs.pdf" : "e.g. Server Credentials"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-70">Recipient Email (Optional)</label>
              <input
                type="email"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                placeholder="Securely link to a user"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              />
            </div>
          </div>

          {mode === "text" ? (
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-70">Secret Content</label>
              <div className="relative">
                <textarea
                  required
                  rows={6}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                  placeholder="Paste sensitive data here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                <Lock className="absolute right-3 bottom-3 text-muted-foreground opacity-50" size={16} />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-70">Select File (Max 2MB)</label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${formData.content ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 hover:border-primary/50 bg-white/5"}`}>
                <input
                  type="file"
                  required
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                {formData.content ? (
                  <>
                    <div className="mx-auto h-12 w-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                      <Check size={24} />
                    </div>
                    <p className="text-sm text-foreground font-bold truncate px-4">{formData.title}</p>
                    <p className="text-xs text-emerald-500 mt-1">File encrypted and ready to drop</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">Any file type supported</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-70">Unlock Price (USD)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <div>
                  <p className="text-xs font-bold">One-Time View</p>
                  <p className="text-[10px] text-muted-foreground">Destroy after decryption</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, oneTimeView: !formData.oneTimeView })}
                className={`w-10 h-5 rounded-full relative transition-colors ${formData.oneTimeView ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.oneTimeView ? "left-5.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? "Securing Asset..." : "Encrypt & Create Drop"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
