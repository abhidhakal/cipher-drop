"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="p-2 hover:bg-white/5 rounded-full text-destructive transition-colors"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </form>
  );
}
