// Generate a packing checklist tailored to the forecast + trip length.

export type PackingInput = { maxTemp?: number; minTemp?: number; rainChance?: number; days: number };

export function buildPackingList({ maxTemp, minTemp, rainChance, days }: PackingInput): Record<string, string[]> {
  const hot = maxTemp != null && maxTemp >= 28;
  const warm = maxTemp != null && maxTemp >= 20 && maxTemp < 28;
  const cool = minTemp != null && minTemp < 12;
  const cold = minTemp != null && minTemp < 4;
  const rainy = rainChance != null && rainChance >= 40;
  const tops = Math.min(days + 1, 10);
  const bottoms = Math.min(Math.ceil(days / 2) + 1, 6);

  const clothing: string[] = [
    `${tops} tops / shirts`,
    `${bottoms} trousers / skirts`,
    `${Math.min(days + 2, 12)} sets of underwear & socks`,
    "Comfortable walking shoes",
    "Sleepwear",
  ];
  if (hot) clothing.push("Lightweight, breathable clothing", "Swimwear", "Sun hat & sunglasses", "Sandals");
  if (warm) clothing.push("A light layer for evenings", "Sunglasses");
  if (cool) clothing.push("A warm jacket or coat", "A sweater / mid-layer");
  if (cold) clothing.push("Thermal base layers", "Gloves, scarf & beanie", "Insulated boots");
  if (rainy) clothing.push("Compact umbrella", "Waterproof jacket");

  const essentials = [
    "Passport & travel documents",
    "Wallet, cards & some local cash",
    "Phone & charger",
    "Any medication & basic first aid",
    "Reusable water bottle",
  ];
  if (hot) essentials.push("Sunscreen (SPF 30+)", "After-sun / aloe");

  const toiletries = ["Toothbrush & toothpaste", "Skincare & deodorant", "Any prescriptions", "Travel-size shampoo"];
  const tech = ["Universal travel adapter", "Power bank", "Headphones", "E-reader / entertainment"];
  const extras = ["Day bag / tote", "Laundry bag", "Snacks for the journey"];
  if (days >= 5) extras.push("Small travel detergent");

  return { Essentials: essentials, Clothing: clothing, Toiletries: toiletries, "Tech & gadgets": tech, Extras: extras };
}
