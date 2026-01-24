import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ShieldAlert, Users, Activity, Lock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession();

  // RBAC: Check for ADMIN role
  if (!session || session.role !== "ADMIN") {
    // If not admin, redirect or show error
    redirect("/dashboard");
  }

  const [users, logs] = await Promise.all([
    db.user.findMany({
      select: { id: true, email: true, role: true, mfaEnabled: true, createdAt: true },
      take: 10
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } }
    })
  ]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-2xl font-bold">Admin Command Center</h1>
          </div>
          <Link href="/dashboard" className="text-sm bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
            Return to User Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <Users size={18} className="text-blue-400" />
                Users Status
              </h2>
              <div className="space-y-4">
                {users.map((u: any) => (
                  <div key={u.id} className="p-3 bg-background/50 rounded-xl border border-white/5 text-sm">
                    <p className="font-bold truncate">{u.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${u.role === "ADMIN" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}>
                        {u.role}
                      </span>
                      {u.mfaEnabled && (
                        <span className="bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full text-[10px] font-bold">MFA</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Global Audit Logs */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <Activity size={18} className="text-purple-400" />
                Live Security Feed (Audit)
              </h2>
              <div className="space-y-3 overflow-hidden">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-4 p-3 bg-background/30 rounded-lg border border-white/5 text-xs">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${log.action.includes("FAILED") ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-emerald-500"
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-foreground uppercase tracking-tight">{log.action.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-muted-foreground truncate">
                        User: {log.user?.email || "Anonymous"} • IP: {log.ipAddress}
                      </p>
                      <p className="mt-1 text-white/40 font-mono text-[10px] break-all">{log.metadata}</p>
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
