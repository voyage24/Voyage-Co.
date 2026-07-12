import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/permissions";
import MailNav from "@/components/admin/MailNav";
import MailAppLock from "@/components/admin/MailAppLock";

// Dedicated "Voyages Mail" app — mail features only, its own installable PWA,
// deliberately separate from the full admin console.
export const metadata: Metadata = {
  title: "Voyages Mail",
  manifest: "/mail.webmanifest",
  appleWebApp: { capable: true, title: "Voyages Mail", statusBarStyle: "black-translucent" },
};

export default async function MailLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser(cookies().get(SESSION_COOKIE_NAME)?.value);
  if (!user) redirect("/admin/login?next=/admin/mail");

  // Role-based access within the mail app (e.g. newsletter is manager+).
  const path = headers().get("x-admin-path");
  if (path && path !== "/admin/mail" && !canAccess(user.role, path)) redirect("/admin/mail");

  return (
    <div className="mail-app admin-root min-h-screen bg-[#f6f6f3]">
      {/* Apply the saved mail theme before paint (no flash). */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('mail-theme');var r=document.currentScript.parentElement;if(t==='dark'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){r.classList.add('dark');}}catch(e){}})();`,
        }}
      />
      <MailNav email={user.email} role={user.role} />
      {/* Extra bottom padding on phones so the fixed bottom tab bar never covers content. */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6 pb-24 sm:pb-6">
        <MailAppLock>{children}</MailAppLock>
      </main>
    </div>
  );
}
