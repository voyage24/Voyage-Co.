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

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type ComposedIssue = { subject: string; previewText: string; html: string };

// How many of each content type to feature. Any type can be set to 0 to
// omit it. Defaults preserve the original auto-newsletter mix while now
// also pulling in a cruise and a journal article from the database.
export type NewsletterCounts = {
  packages: number;
  hotels: number;
  experiences: number;
  cruises: number;
  blogPosts: number;
};

export type NewsletterOptions = {
  counts?: Partial<NewsletterCounts>;
  subject?: string;
  intro?: string;
};

const DEFAULT_COUNTS: NewsletterCounts = { packages: 2, hotels: 2, experiences: 1, cruises: 1, blogPosts: 1 };

// Assembles a newsletter from live, published content. With no options it
// uses the default mix (a deterministic weekly rotation that changes on
// its own); the admin can override the per-type counts, subject and intro.
export async function composeWeeklyNewsletter(opts: NewsletterOptions = {}): Promise<ComposedIssue> {
  const counts: NewsletterCounts = { ...DEFAULT_COUNTS, ...(opts.counts ?? {}) };

  const [packages, hotels, experiences, cruises, blogPosts] = await Promise.all([
    counts.packages > 0 ? prisma.package.findMany({ where: { published: true } }) : Promise.resolve([]),
    counts.hotels > 0 ? prisma.hotel.findMany({ where: { published: true } }) : Promise.resolve([]),
    counts.experiences > 0 ? prisma.experience.findMany({ where: { published: true } }) : Promise.resolve([]),
    counts.cruises > 0 ? prisma.cruise.findMany({ where: { published: true } }) : Promise.resolve([]),
    counts.blogPosts > 0 ? prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
  ]);

  const cards: string[] = [];

  for (const p of getWeeklyFeatured(packages, counts.packages)) {
    cards.push(renderNewsletterCard({
      image: p.image, title: p.title, detail: `${p.subtitle} · ${p.duration}`,
      price: `From ${inr(p.pricePerPerson)} per person`, url: `${SITE}/packages/${p.id}`, ctaLabel: "View Journey",
    }));
  }
  for (const h of getWeeklyFeaturedHotels(hotels, counts.hotels)) {
    cards.push(renderNewsletterCard({
      image: h.image, title: h.name, detail: `${h.location} · ${h.category}`,
      price: `From ${inr(h.pricePerNight)} per night`, url: `${SITE}/hotels/${h.id}`, ctaLabel: "View Stay",
    }));
  }
  for (const e of getWeeklyFeatured(experiences, counts.experiences)) {
    cards.push(renderNewsletterCard({
      image: e.image, title: e.title, detail: `${e.location} · ${e.duration}`,
      price: `From ${inr(e.price)} per person`, url: `${SITE}/experiences/${e.id}`, ctaLabel: "View Experience",
    }));
  }
  for (const c of getWeeklyFeatured(cruises, counts.cruises)) {
    cards.push(renderNewsletterCard({
      image: c.image, title: c.name, detail: `${c.cruiseLine} · ${c.region} · ${c.duration}`,
      price: `From ${inr(c.pricePerPerson)} per person`, url: `${SITE}/cruises/${c.id}`, ctaLabel: "View Cruise",
    }));
  }
  for (const b of blogPosts.slice(0, counts.blogPosts)) {
    cards.push(renderNewsletterCard({
      image: b.image, title: b.title, detail: b.excerpt,
      url: `${SITE}/blog/${b.slug}`, ctaLabel: "Read Article",
    }));
  }

  const leadTitle =
    getWeeklyFeatured(packages, counts.packages)[0]?.title ??
    getWeeklyFeaturedHotels(hotels, counts.hotels)[0]?.name ??
    "Curated escapes";
  const subject = opts.subject?.trim() || `This week: ${leadTitle} & more curated escapes`;
  const previewText = "A handpicked selection of journeys, stays and experiences from around the world.";

  const introHtml = opts.intro?.trim()
    ? `<p style="margin:0;">${escapeHtml(opts.intro.trim())}</p>`
    : "<p style=\"margin:0;\">A handpicked selection of extraordinary journeys, singular stays and cultural experiences from the world's most remarkable places — chosen for you this week.</p>";

  const html = renderNewsletterHTML({
    eyebrow: "The Weekly Dispatch",
    heading: "This Week's Curated Selection",
    introHtml,
    bodyHtml: cards.join("\n"),
    unsubscribeUrl: UNSUBSCRIBE_PLACEHOLDER,
  });

  return { subject, previewText, html };
}

// Composes an issue and persists it as a draft (status: "draft").
// Shared by the admin "Generate draft" button and the weekly cron.
export async function createWeeklyDraft(opts: NewsletterOptions = {}) {
  const issue = await composeWeeklyNewsletter(opts);
  return prisma.newsletter.create({
    data: { subject: issue.subject, previewText: issue.previewText, html: issue.html, status: "draft" },
  });
}
