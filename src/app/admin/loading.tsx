import { Shield, Users, FileText, DollarSign } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar Skeleton */}
      <header className="border-b border-white/5 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-primary/30" size={24} />
            <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="h-10 w-56 bg-white/5 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[Users, FileText, DollarSign, Shield].map((Icon, i) => (
            <div key={i} className="bg-card border border-white/5 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <Icon className="text-white/10" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
            <div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 mb-4 pb-4 border-b border-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
            ))}
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="grid grid-cols-5 gap-4 py-4 border-b border-white/5 last:border-0">
              {[1, 2, 3, 4, 5].map((col) => (
                <div key={col} className="h-4 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
