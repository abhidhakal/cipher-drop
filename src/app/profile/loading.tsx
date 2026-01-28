import { User, Shield, Lock, Wallet } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Balance Card Skeleton */}
        <div className="mb-8 bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/20 rounded-2xl">
              <Wallet size={32} className="text-primary/30" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-28 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-12 w-48 bg-white/10 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-card border border-white/10 rounded-2xl p-8 space-y-8">
              {/* Profile Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User size={32} className="text-primary/30" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-muted-foreground/30" />
                  <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* MFA Section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-emerald-500/30" />
                  <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="p-4 bg-background/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                      <div className="h-2 w-48 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
                  </div>
                  <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
                </div>
              </div>

              <div className="h-12 w-full bg-primary/20 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Password Section */}
            <div className="bg-card border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Lock size={20} className="text-primary/30" />
                <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                    <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
                  </div>
                ))}
                <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Sessions Section */}
            <div className="bg-card border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-primary/30" />
                  <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 bg-white/5 rounded-lg animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                          <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                          <div className="h-3 w-40 bg-white/5 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
