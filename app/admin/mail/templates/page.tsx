import { getPageContentMap } from "@/lib/page-content";
import { EMAIL_TEMPLATES } from "@/lib/email/email-templates";
import EmailTemplatesForm from "@/components/admin/EmailTemplatesForm";

export const dynamic = "force-dynamic";

export default async function MailTemplatesPage() {
  const map = await getPageContentMap();
  const values: Record<string, string> = {};
  for (const t of EMAIL_TEMPLATES) {
    values[`email.${t.key}.subject`] = map[`email.${t.key}.subject`] ?? t.subject;
    values[`email.${t.key}.heading`] = map[`email.${t.key}.heading`] ?? t.heading;
    values[`email.${t.key}.body`] = map[`email.${t.key}.body`] ?? t.body;
  }
  const templates = EMAIL_TEMPLATES.map(t => ({ key: t.key, label: t.label, description: t.description, placeholders: t.placeholders }));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Email Templates</h1>
        <p className="text-sm text-gray-500">Wording of the automated emails members receive.</p>
      </div>
      <EmailTemplatesForm templates={templates} values={values} />
    </div>
  );
}
