import { Download, ArrowLeft } from "lucide-react";

export default function InboxLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-white/5 rounded-lg">
            <ArrowLeft size={20} className="text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-64 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Inbox Items */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-white/5 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Download size={24} className="text-white/10" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-24 bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
