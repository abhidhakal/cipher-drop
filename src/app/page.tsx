"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, CreditCard, ArrowRight, EyeOff } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden bg-background relative">
      {/* Background Grids/Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-secondary/20 opacity-20 blur-[100px]"></div>

      {/* Navbar Placeholder */}
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-16 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} />
            <span>Bank-Grade Security</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl"
        >
          The Secure Escrow for <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-purple-400 to-secondary">
            Digital Assets
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
        >
          Exchange sensitive files, code, and credentials with verified payments.
          Zero-knowledge encryption ensures only you and the recipient can see the data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/register"
            className="group px-8 py-3 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-[0_0_30px_-5px_var(--color-primary)] flex items-center gap-2"
          >
            Start Secure Transfer
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/how-it-works"
            className="px-8 py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-full font-semibold text-lg hover:bg-secondary/20 transition-all"
          >
            How it Works
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-6xl"
        >
          <FeatureCard
            icon={<Lock className="w-8 h-8 text-primary" />}
            title="End-to-End Encryption"
            description="Files are encrypted locally before upload. We never see your unencrypted data."
          />
          <FeatureCard
            icon={<CreditCard className="w-8 h-8 text-secondary" />}
            title="Escrow Payments"
            description="Funds are held safely until the recipient decrypts and verifies the files."
          />
          <FeatureCard
            icon={<EyeOff className="w-8 h-8 text-emerald-400" />}
            title="Anonymity First"
            description="No tracking, no logs. Operate with complete privacy and peace of mind."
          />
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-white/5 hover:border-primary/50 transition-colors text-left group">
      <div className="mb-4 p-3 rounded-lg bg-background/50 w-fit group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
