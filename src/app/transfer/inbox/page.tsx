import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, FileText } from "lucide-react";
import { CopyLinkButton } from "@/components/copy-link-button";

export default async function InboxPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // In this mock, we don't have a way to "send to email" directly and link it to a user ID easily without a real email system.
  // But we can show "Public Drops" or drops where receiverId match.
  // For the sake of the assignment, let's just show "Drops created by you" (Sent) and "Drops where you are receiver" (Received).
  // I updated schema to have receiverId.

  const received = await db.fileDrop.findMany({
    where: { receiverId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  const sent = await db.fileDrop.findMany({
    where: { senderId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 bg-card rounded-lg hover:bg-white/5 transition-colors">
            <Shield size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Secure Transfer History</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sent Files */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Sent Drops
            </h2>
            {sent.length === 0 ? (
              <p className="text-muted-foreground">No sent files.</p>
            ) : (
              sent.map((drop: any) => (
                <div key={drop.id} className="bg-card border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-primary/50 transition-colors">
                  <div>
                    <p className="font-semibold">{drop.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(drop.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyLinkButton dropId={drop.id} />
                    <Link href={`/drop/${drop.id}`} className="text-xs bg-white/5 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors">
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Received Files (if any) */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Received Drops
            </h2>
            {received.length === 0 ? (
              <p className="text-muted-foreground">No received files.</p>
            ) : (
              received.map((drop: any) => (
                <div key={drop.id} className="bg-card border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-secondary/50 transition-colors">
                  <div>
                    <p className="font-semibold">{drop.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(drop.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyLinkButton dropId={drop.id} />
                    <Link href={`/drop/${drop.id}`} className="text-xs bg-white/5 px-3 py-1.5 rounded-full hover:bg-secondary hover:text-black transition-colors">
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
