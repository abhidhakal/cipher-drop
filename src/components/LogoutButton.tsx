"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/lib/csrf";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "x-csrf-token": getCsrfToken() || "",
        },
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 hover:bg-red-500/10 rounded-full text-red-500/70 hover:text-red-500 transition-colors"
      title="Logout"
    >
      <LogOut size={20} />
    </button>
  );
}
