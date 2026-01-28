import { Shield } from "lucide-react";

export default function NewTransferLoading() {
  return (
    <div className="min-h-screen bg-background p-6 flex justify-center items-center">
      <div className="max-w-xl w-full bg-card border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-white/5 rounded-lg">
            <Shield size={20} className="text-primary/30" />
          </div>
          <div className="h-7 w-40 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-4 mb-8 bg-white/5 p-1 rounded-lg">
          <div className="h-10 bg-white/5 rounded-md animate-pulse" />
          <div className="h-10 bg-white/5 rounded-md animate-pulse" />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-2">
            <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
            <div className="h-40 w-full bg-white/5 rounded-lg animate-pulse" />
          </div>

          {/* Price & Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="h-16 w-full bg-white/5 rounded-xl animate-pulse" />
          </div>

          {/* Submit Button */}
          <div className="h-14 w-full bg-primary/20 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
