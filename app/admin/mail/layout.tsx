import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import MailNav from "@/components/admin/MailNav";

// Dedicated "Voyages Mail" app — mail features only, its own installable PWA,
// deliberately separate from the full admin console.
export const metadata: Metadata = {
  title: "Voyages Mail",
  manifest: "/mail.webmanifest",
  appleWebApp: { capable: true, title: "Voyages Mail", statusBarStyle: "black-translucent" },
};

export default async function MailLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser(cookies().get(SESSION_COOKIE_NAME)?.value);
  if (!user) redirect("/admin/login");

  return (
    <div className="admin-root min-h-screen bg-[#f6f6f3]">
      <MailNav email={user.email} />
      <main className="max-w-3xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
