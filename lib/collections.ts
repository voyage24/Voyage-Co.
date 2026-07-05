import { cache } from "react";
import { prisma } from "./prisma";

// ── Admin-managed content collections ────────────────────────────────────────
// Each collection is a list of records whose fields live in Collection.data
// (JSON). Adding a new collection is just a registry entry here + a place to
// render it — no schema change.

export type CollectionField = { key: string; label: string; type?: "text" | "textarea" | "image" | "url" };
export type CollectionDef = {
  type: string;        // Collection.type + admin URL slug
  label: string;
  itemLabel: string;
  description?: string;
  titleField: string;  // field used as the row heading in admin
  imageField?: string; // field rendered as a thumbnail in admin
  fields: CollectionField[];
};

export const COLLECTIONS: CollectionDef[] = [
  {
    type: "team",
    label: "Team members",
    itemLabel: "member",
    description: "The people shown in the “Meet the team” section on the About page.",
    titleField: "name",
    imageField: "image",
    fields: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "image", label: "Photo", type: "image" },
      { key: "bio", label: "Short bio", type: "textarea" },
    ],
  },
  {
    type: "events",
    label: "Events",
    itemLabel: "event",
    description: "Upcoming events & private previews, shown on the Events page.",
    titleField: "title",
    imageField: "image",
    fields: [
      { key: "title", label: "Title" },
      { key: "date", label: "Date (e.g. 14 March 2027)" },
      { key: "location", label: "Location" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      { key: "rsvpUrl", label: "RSVP link", type: "url" },
    ],
  },
  {
    type: "partners",
    label: "Partner logos",
    itemLabel: "logo",
    description: "The partner logo wall shown on the Partners page.",
    titleField: "name",
    imageField: "image",
    fields: [
      { key: "name", label: "Name" },
      { key: "image", label: "Logo image", type: "image" },
      { key: "url", label: "Website (optional)", type: "url" },
    ],
  },
  {
    type: "homeFaq",
    label: "Homepage FAQ",
    itemLabel: "question",
    description: "A short FAQ block shown on the homepage (separate from the full FAQ page).",
    titleField: "q",
    fields: [
      { key: "q", label: "Question" },
      { key: "a", label: "Answer", type: "textarea" },
    ],
  },
];

export const COLLECTION_BY_TYPE = new Map(COLLECTIONS.map(c => [c.type, c]));

export type CollectionItem = { id: string; data: Record<string, string>; sortOrder: number; published: boolean };

// Public reader — published entries of a type, in display order. Cached per request.
export const getCollection = cache(async (type: string): Promise<CollectionItem[]> => {
  try {
    const rows = await prisma.collection.findMany({
      where: { type, published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map(r => ({ id: r.id, data: (r.data as Record<string, string>) ?? {}, sortOrder: r.sortOrder, published: r.published }));
  } catch {
    return [];
  }
});
