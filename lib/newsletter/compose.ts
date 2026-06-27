import { prisma } from "@/lib/prisma";
import { getWeeklyFeatured, getWeeklyFeaturedHotels } from "@/lib/weekly-featured";
import { renderNewsletterHTML, renderNewsletterCard } from "@/lib/email/template";

const SITE = "https://voyagesco.com";

// Per-recipient unsubscribe links can't be baked into a single stored
// draft, so the composed html carries this placeholder; the send step
// swaps it for each subscriber's real, signed unsubscribe URL.
export const UNSUBSCRIBE_PLACEHOLDER = "%%UNSUBSCRIBE_URL%%";

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export type ComposedIssue = { subject: string; previewText: string; html: string };

// Assembles this week's newsletter purely from live, published content —
// a deterministic weekly rotation so it changes week to week on its own.
export async function composeWeeklyNewsletter(): Promise<ComposedIssue> {
  const [hotels, packages, experiences] = await Promise.all([
    prisma.hotel.findMany({ where: { published: true } }),
    prisma.package.findMany({ where: { published: true } }),
    prisma.experience.findMany({ where: { published: true } }),
  ]);

  const featPackages = getWeeklyFeatured(packages, 2);
  const featHotels = getWeeklyFeaturedHotels(hotels, 2);
  const featExperiences = getWeeklyFeatured(experiences, 1);

  const cards: string[] = [];

  for (const p of featPackages) {
    cards.push(renderNewsletterCard({
      image: p.image,
      title: p.title,
      detail: `${p.subtitle} · ${p.duration}`,
      price: `From ${inr(p.pricePerPerson)} per person`,
      url: `${SITE}/packages/${p.id}`,
      ctaLabel: "View Journey",
    }));
  }

  for (const h of featHotels) {
    cards.push(renderNewsletterCard({
      image: h.image,
      title: h.name,
      detail: `${h.location} · ${h.category}`,
      price: `From ${inr(h.pricePerNight)} per night`,
      url: `${SITE}/hotels/${h.id}`,
      ctaLabel: "View Stay",
    }));
  }

  for (const e of featExperiences) {
    cards.push(renderNewsletterCard({
      image: e.image,
      title: e.title,
      detail: `${e.location} · ${e.duration}`,
      price: `From ${inr(e.price)} per person`,
      url: `${SITE}/experiences/${e.id}`,
      ctaLabel: "View Experience",
    }));
  }

  const leadTitle = featPackages[0]?.title ?? "Curated escapes";
  const subject = `This week: ${leadTitle} & more curated escapes`;
  const previewText = "A handpicked selection of journeys, stays and experiences from around the world.";

  const html = renderNewsletterHTML({
    eyebrow: "The Weekly Dispatch",
    heading: "This Week's Curated Selection",
    introHtml: "<p style=\"margin:0;\">A handpicked selection of extraordinary journeys, singular stays and cultural experiences from the world's most remarkable places — chosen for you this week.</p>",
    bodyHtml: cards.join("\n"),
    unsubscribeUrl: UNSUBSCRIBE_PLACEHOLDER,
  });

  return { subject, previewText, html };
}

// Composes this week's issue and persists it as a draft (status: "draft").
// Shared by the admin "Generate draft" button and the weekly cron.
export async function createWeeklyDraft() {
  const issue = await composeWeeklyNewsletter();
  return prisma.newsletter.create({
    data: { subject: issue.subject, previewText: issue.previewText, html: issue.html, status: "draft" },
  });
}
