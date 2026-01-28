import { Shield, FileUp, Download, History, Wallet } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar Skeleton */}
      <header className="border-b border-white/5 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tighter">
            <span>CipherDrop</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
              <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Header Skeleton */}
        <div className="mb-12">
          <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[FileUp, Download, Wallet, Shield].map((Icon, i) => (
            <div key={i} className="bg-card border border-white/5 p-6 rounded-2xl shadow-xl h-[120px]">
              <div className="flex items-center justify-between h-full">
                <div className="space-y-3">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Icon className="text-white/10" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="h-5 w-40 bg-white/5 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 bg-card border border-white/5 rounded-2xl shadow-xl">
                  <div className="h-12 w-12 bg-white/5 rounded-xl animate-pulse mb-4" />
                  <div className="h-5 w-32 bg-white/5 rounded animate-pulse mb-2" />
                  <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <History size={20} className="text-white/10" />
                  </div>
                  <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/10 rounded-full" />
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-background/50 rounded-xl border border-white/5">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
