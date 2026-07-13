import { redirect } from "next/navigation";

// The Smart Trip Planner now lives on the canonical "Plan your trip" page so the
// primary CTA and every existing link lead to it. This route is kept as a
// permanent redirect for any old links/bookmarks.
export default function TripPlannerPage() {
  redirect("/plan");
}
