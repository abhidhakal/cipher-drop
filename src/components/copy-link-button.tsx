"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyLinkButton({ dropId }: { dropId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const link = `${window.location.origin}/drop/${dropId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all ${copied ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 hover:bg-white/10 text-muted-foreground"
        }`}
      title="Copy Secure Link"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}
