
import Link from "next/link";
import { Upload, Link as LinkIcon, DollarSign, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Header />

      <div className="max-w-4xl w-full p-6 mt-16 pb-24">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
          How CipherDrop Works
        </h1>
        <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto mb-20">
          We solve the "who goes first" problem in digital sales.
          Use our secure escrow to sell files to anyone, anywhere, safely.
        </p>

        {/* 3 Step Process */}
        <div className="relative">
          {/* Vertical Line for Desktop */}
          <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-white/10 -translate-x-1/2"></div>

          <div className="space-y-16">
            <TimelineStep
              number="01"
              title="Upload & Encrypt"
              description="Upload your file. We encrypt it immediately in your browser using your unique key. We never see the unencrypted file."
              icon={<Upload className="text-primary" size={28} />}
              alignment="left"
            />
            <TimelineStep
              number="02"
              title="Set Price & Share Link"
              description="Set your price (e.g., $50). We generate a secure payment link. Send this link to your buyer via DM, email, or any chat app."
              icon={<LinkIcon className="text-primary" size={28} />}
              alignment="right"
            />
            <TimelineStep
              number="03"
              title="Get Paid Instantly"
              description="The buyer pays the amount to unlock the file. Once payment is confirmed, the file is decrypted for them, and funds are sent to you."
              icon={<DollarSign className="text-primary" size={28} />}
              alignment="left"
            />
          </div>
        </div>

        {/* Technical Section */}
        <div className="mt-32 border-t border-white/10 pt-16">
          <h2 className="text-2xl font-bold text-center mb-12">Under the Hood</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechCard
              title="Zero-Knowledge Encryption"
              desc="AES-256-GCM encryption happens on your device. The server only stores the encrypted blob."
            />
            <TechCard
              title="Antifragile Escrow"
              desc="Funds are held in a neutral state until cryptographic proof of file delivery is verified."
            />
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link href="/register" className="inline-block px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors text-lg shadow-xl">
            Start Your First Transfer
          </Link>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ number, title, description, icon, alignment }: any) {
  return (
    <div className={`flex md:items-center flex-col max-w-sm mx-auto md:max-w-none md:mx-0 ${alignment === "right" ? "md:flex-row-reverse" : "md:flex-row"} gap-8 relative`}>
      {/* Dot on Line */}
      <div className="hidden md:flex absolute left-[50%] top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full -translate-x-[50%] z-10"></div>

      {/* Content Side */}
      <div className={`flex-1 ${alignment === "left" ? "md:text-right" : "md:text-left"} text-center`}>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Icon Side */}
      <div className="flex-1 flex justify-center md:block">
        <div className={`w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 ${alignment === "left" ? "md:mr-auto" : "md:ml-auto"}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function TechCard({ title, desc }: any) {
  return (
    <div className="p-6 rounded-xl bg-card border border-white/5">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="text-muted-foreground" size={20} />
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
