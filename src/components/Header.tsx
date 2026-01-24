import Link from "next/link";

export function Header() {
  return (
    <nav className="w-full border-b border-white/5 bg-background m-0 p-0 relative z-20">
      <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          CipherDrop
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
