import ComposeEmail from "@/components/admin/ComposeEmail";

export const dynamic = "force-dynamic";

export default function AdminComposePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Compose email</h1>
        <p className="text-sm text-gray-500">Send a one-off branded email to any recipient — in-house via your concierge address, no external mail app.</p>
      </div>
      <ComposeEmail />
    </div>
  );
}
