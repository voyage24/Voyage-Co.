import ComposeEmail from "@/components/admin/ComposeEmail";

export const dynamic = "force-dynamic";

export default function MailComposePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Compose</h1>
        <p className="text-sm text-gray-500">Send a branded email to any recipient.</p>
      </div>
      <ComposeEmail />
    </div>
  );
}
