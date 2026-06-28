"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return (
    <button onClick={logout} className="text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors">
      Sign out
    </button>
  );
}
