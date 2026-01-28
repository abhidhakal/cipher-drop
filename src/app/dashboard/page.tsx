import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, FileUp, Download, History, LogOut, Wallet, UserCircle, Settings } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

async function getData(userId: string) {
  const [logs, sentFiles, receivedFiles, user] = await Promise.all([
    db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    db.fileDrop.count({ where: { senderId: userId } }),
    db.fileDrop.count({ where: { receiverId: userId } }),
    db.user.findUnique({ where: { id: userId }, select: { balance: true, email: true, mfaEnabled: true } })
  ]);

  return { logs, sentFiles, receivedFiles, user };
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getData(session.userId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tighter">
            <span>CipherDrop</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/profile" className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 transition-all">
              <Wallet size={16} className="text-primary" />
              <span className="font-bold text-sm text-foreground">${data.user?.balance.toFixed(2)}</span>
            </Link>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-3">
              <Link href="/profile" className="p-2 hover:bg-white/5 rounded-full transition-colors" title="Settings">
                <Settings size={20} className="text-muted-foreground" />
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2 tracking-tight">Welcome, Operator</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <UserCircle size={14} /> {data.user?.email} • Session Authenticated
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardCard
            title="Files Sent"
            value={data.sentFiles.toString()}
            icon={<FileUp className="text-primary" />}
          />
          <DashboardCard
            title="Files Received"
            value={data.receivedFiles.toString()}
            icon={<Download className="text-blue-400" />}
          />
          <DashboardCard
            title="Vault Balance"
            value={`$${data.user?.balance.toFixed(2)}`}
            icon={<Wallet className="text-emerald-400" />}
            link="/profile"
          />
          <DashboardCard
            title="Integrity Score"
            value="A+"
            icon={<Shield className="text-purple-400" />}
            subtext={data.user?.mfaEnabled ? "MFA Active" : "MFA Recommended"}
            subtextColor={data.user?.mfaEnabled ? "text-emerald-500" : "text-amber-500"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest opacity-50">Quick Operations</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/transfer/new" className="group p-6 bg-card border border-white/5 rounded-2xl hover:border-primary/50 transition-all shadow-xl">
                <div className="mb-4 p-3 bg-primary/10 w-fit rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <FileUp size={24} />
                </div>
                <h3 className="font-bold text-lg">Secure Send</h3>
                <p className="text-sm text-muted-foreground mt-1">Deploy an encrypted asset drop.</p>
              </Link>

              <Link href="/transfer/inbox" className="group p-6 bg-card border border-white/5 rounded-2xl hover:border-blue-500/50 transition-all shadow-xl">
                <div className="mb-4 p-3 bg-blue-500/10 w-fit rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                  <Download size={24} />
                </div>
                <h3 className="font-bold text-lg">Inbox</h3>
                <p className="text-sm text-muted-foreground mt-1">Retrieve and decrypt incoming data.</p>
              </Link>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <History size={20} className="text-primary" />
                  </div>
                  Live Security Feed
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Connected</span>
                </div>
              </div>

              <div className="space-y-4">
                {data.logs.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                    <History size={48} className="mx-auto text-white/5 mb-4" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No terminal logs recorded</p>
                  </div>
                ) : (
                  data.logs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-background/50 rounded-xl border border-white/5 hover:bg-background transition-colors group">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shadow-[0_0_8px] ${log.action.includes("FAILED") ? "bg-red-500 shadow-red-500" :
                        log.action.includes("LOGIN") ? "bg-emerald-500 shadow-emerald-500" : "bg-blue-500 shadow-blue-500"
                        }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{formatAction(log.action)}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          SOURCE: {log.ipAddress} • REF: {log.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ title, value, icon, subtext, subtextColor, link }: { title: string, value: string, icon: React.ReactNode, subtext?: string, subtextColor?: string, link?: string }) {
  const content = (
    <div className={`bg-card border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-xl transition-all h-full min-h-[120px] ${link ? "hover:border-primary/50 cursor-pointer" : ""}`}>
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2 opacity-50">{title}</p>
          <div className="text-3xl font-black tracking-tighter">{value}</div>
        </div>
        <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${subtext ? (subtextColor || "text-emerald-500") : "invisible"}`}>
          <Shield size={10} /> {subtext || "placeholder"}
        </p>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shrink-0">{icon}</div>
    </div>
  );

  if (link) return <Link href={link} className="block h-full">{content}</Link>;
  return content;
}

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}
