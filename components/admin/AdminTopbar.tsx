"use client";

import { useRouter } from "next/navigation";

export default function AdminTopbar({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 bg-white">
      <p className="text-sm text-gray-500">Signed in as <span className="font-medium text-gray-900">{email}</span></p>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 transition-colors"
      >
        Log out
      </button>
    </header>
  );
}
