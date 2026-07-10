import { getPageContentMap } from "@/lib/page-content";
import { EMAIL_TEMPLATES } from "@/lib/email/email-templates";
import EmailTemplatesForm from "@/components/admin/EmailTemplatesForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  const map = await getPageContentMap();
  const values: Record<string, string> = {};
  for (const t of EMAIL_TEMPLATES) {
    values[`email.${t.key}.subject`] = map[`email.${t.key}.subject`] ?? t.subject;
    values[`email.${t.key}.heading`] = map[`email.${t.key}.heading`] ?? t.heading;
    values[`email.${t.key}.body`] = map[`email.${t.key}.body`] ?? t.body;
  }
  const templates = EMAIL_TEMPLATES.map(t => ({ key: t.key, label: t.label, description: t.description, placeholders: t.placeholders }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
        <p className="text-sm text-gray-500">Edit the wording of the automated emails your members receive. Changes go live on save; the branded shell (logo, footer) is added automatically.</p>
      </div>
      <EmailTemplatesForm templates={templates} values={values} />
    </div>
  );
}
