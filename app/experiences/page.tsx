import { prisma } from "@/lib/prisma";
import ExperiencesPageClient from "@/components/pages/ExperiencesPageClient";

export const revalidate = 60;

export default async function ExperiencesPage() {
  const experiences = await prisma.experience.findMany({ where: { published: true } });
  return <ExperiencesPageClient experiences={experiences} />;
}
