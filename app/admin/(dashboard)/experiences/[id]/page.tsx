import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExperienceForm from "@/components/admin/ExperienceForm";

export default async function EditExperiencePage({ params }: { params: { id: string } }) {
  const experience = await prisma.experience.findUnique({ where: { id: params.id } });
  if (!experience) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Experience</h1>
      <ExperienceForm initial={{ ...experience, faqs: experience.faqs as { q: string; a: string }[] | null }} />
    </div>
  );
}
