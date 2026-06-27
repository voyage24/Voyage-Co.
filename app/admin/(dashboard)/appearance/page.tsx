import { getSiteSettings } from "@/lib/site-settings";
import AppearanceForm from "@/components/admin/AppearanceForm";

export const dynamic = "force-dynamic";

export default async function AdminAppearancePage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Appearance</h1>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        Customise the site&apos;s colours, fonts, logo, contact details and homepage hero text.
        Changes go live across the website as soon as you save.
      </p>
      <AppearanceForm initial={settings} />
    </div>
  );
}
