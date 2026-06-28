// Builders for schema.org JSON-LD used across the site for rich snippets.
export const SITE_URL = "https://voyagesco.com";
const clean = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== "")) as T;

type ReviewLite = { rating: number; authorName: string; comment: string; createdAt: Date | string };

function aggregate(reviews: ReviewLite[], fallbackRating?: number, fallbackCount?: number) {
  if (reviews.length > 0) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { "@type": "AggregateRating", ratingValue: Number(avg.toFixed(1)), reviewCount: reviews.length };
  }
  if (fallbackRating && fallbackCount) {
    return { "@type": "AggregateRating", ratingValue: fallbackRating, reviewCount: fallbackCount };
  }
  return undefined;
}

function offer(price?: number) {
  if (!price) return undefined;
  return { "@type": "Offer", price, priceCurrency: "INR", availability: "https://schema.org/InStock" };
}

function reviewNodes(reviews: ReviewLite[]) {
  return reviews.slice(0, 8).map(r => clean({
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    author: { "@type": "Person", name: r.authorName },
    reviewBody: r.comment,
    datePublished: new Date(r.createdAt).toISOString().slice(0, 10),
  }));
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Voyages & Co.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Bespoke luxury travel — handcrafted journeys, rare stays, private experiences.",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Voyages & Co.",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/hotels?city={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function hotelJsonLd(h: { id: string; name: string; description: string; image: string; city: string; country: string; stars?: number; rating?: number; reviewCount?: number; pricePerNight?: number; priceOnRequest?: boolean }, reviews: ReviewLite[] = []) {
  return clean({
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: h.name,
    description: h.description?.slice(0, 500),
    image: h.image,
    url: `${SITE_URL}/hotels/${h.id}`,
    address: clean({ "@type": "PostalAddress", addressLocality: h.city, addressCountry: h.country }),
    starRating: h.stars ? { "@type": "Rating", ratingValue: h.stars } : undefined,
    aggregateRating: aggregate(reviews, h.rating, h.reviewCount),
    review: reviews.length ? reviewNodes(reviews) : undefined,
    makesOffer: h.priceOnRequest ? undefined : offer(h.pricePerNight),
  });
}

export function productJsonLd(opts: { type: string; id: string; basePath: string; name: string; description?: string; image: string; price?: number; priceOnRequest?: boolean; rating?: number; reviewCount?: number }, reviews: ReviewLite[] = []) {
  return clean({
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description?.slice(0, 500),
    image: opts.image,
    url: `${SITE_URL}${opts.basePath}/${opts.id}`,
    aggregateRating: aggregate(reviews, opts.rating, opts.reviewCount),
    review: reviews.length ? reviewNodes(reviews) : undefined,
    offers: opts.priceOnRequest ? undefined : offer(opts.price),
  });
}
