// Travel expense categories, with keyword-based auto-detection from the
// description so entries group themselves as you type ("Taxi to airport" →
// Transport, "Dinner at Gaggan" → Food). Shared by the API and the UI.

export const EXPENSE_CATEGORIES = ["Hotels", "Flights", "Food", "Shopping", "Activities", "Transport", "Other"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// Checked in this order so more specific categories win over generic words.
const KEYWORDS: [ExpenseCategory, string[]][] = [
  ["Flights", ["flight", "airfare", "airline", "boarding", "baggage", "check-in bag", "seat upgrade", "layover"]],
  ["Hotels", ["hotel", "resort", "airbnb", "hostel", "room", "suite", "lodge", "villa", "stay", "check-in", "nights", "riad", "b&b"]],
  ["Transport", ["taxi", "uber", "ola", "cab", "grab", "metro", "subway", "train", "rail", "bus", "tram", "transfer", "rental car", "car hire", "fuel", "petrol", "gas", "toll", "ferry", "boat transfer", "tuk", "scooter", "parking"]],
  ["Food", ["food", "dinner", "lunch", "breakfast", "brunch", "cafe", "café", "coffee", "restaurant", "meal", "drinks", "beer", "wine", "bar", "snack", "grocery", "groceries", "dessert", "street food", "pizza", "sushi"]],
  ["Shopping", ["shopping", "shop", "store", "mall", "souvenir", "gift", "clothes", "clothing", "market", "boutique", "duty free", "duty-free", "pharmacy", "sim card"]],
  ["Activities", ["tour", "activity", "museum", "gallery", "entry", "entrance", "ticket", "excursion", "spa", "massage", "diving", "snorkel", "safari", "show", "concert", "theme park", "park", "guide", "class", "cruise", "hike", "trek", "cooking class"]],
];

export function categorizeExpense(description: string): ExpenseCategory {
  const l = (description || "").toLowerCase();
  for (const [cat, words] of KEYWORDS) {
    if (words.some(w => l.includes(w))) return cat;
  }
  return "Other";
}

export function isExpenseCategory(v: unknown): v is ExpenseCategory {
  return typeof v === "string" && (EXPENSE_CATEGORIES as readonly string[]).includes(v);
}
