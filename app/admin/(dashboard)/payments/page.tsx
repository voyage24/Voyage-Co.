import { getSiteSettings } from "@/lib/site-settings";
import PaymentsForm from "@/components/admin/PaymentsForm";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Payments</h1>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        Choose which payment gateway is active and its public key. The secret key never lives here —
        it&apos;s set as a Vercel environment variable, the same way every other integration on this site
        (SMTP, Amadeus, Turnstile) keeps its credentials.
      </p>
      <PaymentsForm initialProvider={settings["payment.provider"]} initialPublicKey={settings["payment.publicKey"]} />
    </div>
  );
}
