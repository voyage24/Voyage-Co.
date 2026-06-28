import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE = "https://voyagesco.com";

export const revalidate = 3600;

const STATIC_PATHS = [
  "", "/hotels", "/flights", "/trains", "/experiences", "/packages", "/cruises",
  "/blog", "/plan", "/about", "/contact", "/careers", "/press", "/partners",
  "/help", "/privacy", "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.map(p => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  try {
    const [hotels, packages, experiences, cruises, posts] = await Promise.all([
      prisma.hotel.findMany({ where: { published: true }, select: { id: true } }),
      prisma.package.findMany({ where: { published: true }, select: { id: true } }),
      prisma.experience.findMany({ where: { published: true }, select: { id: true } }),
      prisma.cruise.findMany({ where: { published: true }, select: { id: true } }),
      prisma.blogPost.findMany({ where: { published: true }, select: { slug: true } }),
    ]);
    const dyn: MetadataRoute.Sitemap = [
      ...hotels.map(h => ({ url: `${SITE}/hotels/${h.id}`, lastModified: now, priority: 0.6 })),
      ...packages.map(p => ({ url: `${SITE}/packages/${p.id}`, lastModified: now, priority: 0.8 })),
      ...experiences.map(e => ({ url: `${SITE}/experiences/${e.id}`, lastModified: now, priority: 0.6 })),
      ...cruises.map(c => ({ url: `${SITE}/cruises/${c.id}`, lastModified: now, priority: 0.6 })),
      ...posts.map(b => ({ url: `${SITE}/blog/${b.slug}`, lastModified: now, priority: 0.5 })),
    ];
    return [...staticRoutes, ...dyn];
  } catch {
    return staticRoutes;
  }
}
