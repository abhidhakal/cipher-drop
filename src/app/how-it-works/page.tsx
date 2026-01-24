import Link from "next/link";
import { Shield, Lock, Key, EyeOff } from "lucide-react";
import { Header } from "@/components/Header";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Header />

      <div className="max-w-4xl w-full p-6 mt-16">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-16">
          Security by Design
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Step
            number="01"
            title="AES-256-GCM Encryption"
            description="Before any data is saved to our database, it is encrypted using the Advanced Encryption Standard (AES) in Galois/Counter Mode (GCM). This ensures both confidentiality and integrity."
            icon={<Lock className="text-primary" size={32} />}
          />
          <Step
            number="02"
            title="Zero-Trust Architecture"
            description="We assume the network is hostile. All sessions are verified using cryptographically signed JWTs (HS256) stored in HTTP-Only, Secure cookies to prevent XSS and Session Hijacking."
            icon={<Shield className="text-secondary" size={32} />}
          />
          <Step
            number="03"
            title="Secure Key Exchange"
            description="When you create a drop, a unique initialization vector (IV) and authentication tag are generated. These are required to decrypt the payload, ensuring that even if the database is compromised, the data remains secure without the keys."
            icon={<Key className="text-emerald-500" size={32} />}
          />
          <Step
            number="04"
            title="Audit Trails"
            description="Every action—login, file creation, decryption, and profile update—is immutable logged. This provides a complete forensic trail for security audits."
            icon={<EyeOff className="text-purple-500" size={32} />}
          />
        </div>

        <div className="mt-24 p-8 bg-card border border-white/10 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to secure your data?</h2>
          <Link href="/register" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
            Create Secure Account
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, description, icon }: any) {
  return (
    <div className="flex gap-6">
      <div className="text-4xl font-bold text-white/10">{number}</div>
      <div>
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
