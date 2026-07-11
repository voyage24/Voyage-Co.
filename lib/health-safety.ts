// Health & safety reference per country: tap-water guidance and a couple of
// non-alarmist, widely-published notes (common vaccinations, malaria/dengue or
// altitude where relevant). Reference only — the card footer always points to a
// travel clinic. Curated for the main destinations; unknown countries hide it.

export type HealthSafety = {
  tapWater: "safe" | "caution" | "bottled";
  notes: string[];
};

const DATA: Record<string, HealthSafety> = {
  India: { tapWater: "bottled", notes: ["Hep A & typhoid vaccination is commonly advised.", "Eat freshly cooked food; skip ice and unpeeled fruit from street stalls."] },
  Maldives: { tapWater: "caution", notes: ["Resort water is desalinated and fine; use bottled on local islands.", "Sun and reef: reef-safe sunscreen, and never touch the coral."] },
  "Sri Lanka": { tapWater: "bottled", notes: ["Hep A & typhoid are commonly advised.", "Use repellent at dusk — dengue is present in wet, urban areas."] },
  Nepal: { tapWater: "bottled", notes: ["On treks, ascend slowly — altitude sickness is the real risk above 2,500 m.", "Hep A & typhoid are commonly advised."] },
  Bhutan: { tapWater: "bottled", notes: ["Several valleys sit at altitude — take the first days gently.", "Bottled or purified water only."] },
  Thailand: { tapWater: "bottled", notes: ["Use repellent — dengue is present, especially in the rainy season.", "Street food is a joy; choose busy, high-turnover stalls."] },
  Indonesia: { tapWater: "bottled", notes: ["Bottled water only, and go easy on ice at smaller places.", "Repellent at dusk; dengue is present."] },
  Vietnam: { tapWater: "bottled", notes: ["Bottled water only.", "Repellent helps — dengue is present in the wet season."] },
  Cambodia: { tapWater: "bottled", notes: ["Bottled water only.", "Use repellent; dengue is present."] },
  Malaysia: { tapWater: "caution", notes: ["Boil or stick to bottled water outside the main hotels.", "Repellent at dusk — dengue is present."] },
  Singapore: { tapWater: "safe", notes: ["Tap water is safe to drink.", "Repellent is still wise in green areas — occasional dengue."] },
  Philippines: { tapWater: "bottled", notes: ["Bottled water only.", "Repellent at dusk; dengue is present."] },
  Japan: { tapWater: "safe", notes: ["Tap water is safe and excellent.", "Pharmacies are well stocked; carry any prescriptions in original packaging."] },
  China: { tapWater: "bottled", notes: ["Drink bottled or boiled water.", "Carry a translation app for pharmacies."] },
  "Hong Kong": { tapWater: "safe", notes: ["Tap water is safe to drink.", "Excellent medical facilities."] },
  "South Korea": { tapWater: "safe", notes: ["Tap water is safe, though many locals prefer bottled.", "Pharmacies are widespread."] },
  UAE: { tapWater: "safe", notes: ["Desalinated tap water is safe; many prefer bottled for taste.", "Summer heat is extreme — hydrate and limit midday sun."] },
  Oman: { tapWater: "caution", notes: ["Bottled water is the norm.", "Extreme summer heat — hydrate and avoid the midday sun."] },
  Qatar: { tapWater: "safe", notes: ["Desalinated tap water is safe; bottled is common.", "Extreme summer heat — hydrate well."] },
  "Saudi Arabia": { tapWater: "caution", notes: ["Bottled water is the norm.", "Extreme summer heat — hydrate and cover up."] },
  Jordan: { tapWater: "caution", notes: ["Bottled water is recommended.", "Wadi Rum and Petra mean sun and long walks — hydrate."] },
  Israel: { tapWater: "safe", notes: ["Tap water is safe to drink.", "Sun is strong around the Dead Sea and Negev."] },
  Egypt: { tapWater: "bottled", notes: ["Bottled water only, and avoid ice and salads that may be rinsed in tap water.", "Hep A & typhoid are commonly advised."] },
  Morocco: { tapWater: "bottled", notes: ["Bottled water only.", "Hep A is commonly advised; go easy on unpeeled produce."] },
  Turkey: { tapWater: "caution", notes: ["Bottled water is recommended outside the main cities.", "Excellent private hospitals in Istanbul & Antalya."] },
  Kenya: { tapWater: "bottled", notes: ["Malaria prophylaxis is advised — ask a travel clinic.", "A yellow-fever certificate may be required on arrival."] },
  Tanzania: { tapWater: "bottled", notes: ["Malaria prophylaxis is advised, including for the safari areas.", "A yellow-fever certificate is often required — check before you fly."] },
  "South Africa": { tapWater: "safe", notes: ["City tap water is generally safe; use bottled in remote areas.", "Low malaria risk in the Kruger low-veld — ask a travel clinic."] },
  Zambia: { tapWater: "bottled", notes: ["Malaria prophylaxis is advised.", "A yellow-fever certificate may be required."] },
  Mauritius: { tapWater: "caution", notes: ["Bottled water is recommended.", "Strong sun year-round — reef-safe sunscreen."] },
  Seychelles: { tapWater: "caution", notes: ["Bottled water is recommended; resort water is fine.", "Strong equatorial sun — cover up on the water."] },
  Italy: { tapWater: "safe", notes: ["Tap water is safe; public fountains in Rome are drinkable.", "Carry your EHIC/insurance details."] },
  France: { tapWater: "safe", notes: ["Tap water is safe to drink.", "Pharmacies (green cross) are excellent for minor ailments."] },
  Spain: { tapWater: "safe", notes: ["Tap water is safe in the cities.", "Strong summer sun — hydrate and use sunscreen."] },
  Portugal: { tapWater: "safe", notes: ["Tap water is safe to drink.", "Pharmacies are helpful for minor issues."] },
  Greece: { tapWater: "caution", notes: ["Safe on the mainland; use bottled on some islands where it's brackish.", "Strong summer sun — hydrate."] },
  Germany: { tapWater: "safe", notes: ["Tap water is safe and high quality.", "Pharmacies (Apotheke) handle minor ailments."] },
  Netherlands: { tapWater: "safe", notes: ["Tap water is among the cleanest in Europe.", "Watch for cyclists when crossing."] },
  Switzerland: { tapWater: "safe", notes: ["Tap and most fountain water is superb.", "At altitude, take the first day gently."] },
  Austria: { tapWater: "safe", notes: ["Alpine tap water is excellent.", "At altitude, ease into the first day."] },
  UK: { tapWater: "safe", notes: ["Tap water is safe to drink.", "Pharmacies can advise on minor ailments."] },
  Ireland: { tapWater: "safe", notes: ["Tap water is safe to drink.", "Pack for changeable weather year-round."] },
  Iceland: { tapWater: "safe", notes: ["Tap water is pristine glacial water.", "Weather turns fast — layer up, even in summer."] },
  Norway: { tapWater: "safe", notes: ["Tap water is excellent.", "Weather changes quickly in the fjords — layer up."] },
  Sweden: { tapWater: "safe", notes: ["Tap water is safe and clean.", "Long summer daylight — an eye mask helps sleep."] },
  USA: { tapWater: "safe", notes: ["Tap water is safe in the cities.", "Medical care is excellent but costly — travel insurance is essential."] },
  Canada: { tapWater: "safe", notes: ["Tap water is safe to drink.", "Carry insurance details; care is excellent."] },
  Mexico: { tapWater: "bottled", notes: ["Bottled water only, and go easy on ice at smaller places.", "Strong sun on the coast — hydrate."] },
  "Costa Rica": { tapWater: "caution", notes: ["Tap water is safe in most of the country; bottled in remote areas.", "Repellent for the rainforest."] },
  Brazil: { tapWater: "bottled", notes: ["Bottled water is recommended.", "A yellow-fever vaccination is advised for some regions."] },
  Argentina: { tapWater: "safe", notes: ["City tap water is generally safe; bottled in the far north.", "At altitude in the northwest, take it slowly."] },
  Peru: { tapWater: "bottled", notes: ["Cusco & the Sacred Valley sit high — allow a day to acclimatise (coca tea helps).", "Bottled or purified water only."] },
  Chile: { tapWater: "caution", notes: ["Safe in Santiago; the north's water is high in minerals — bottled is easier.", "At altitude, ease in gently."] },
  Australia: { tapWater: "safe", notes: ["Tap water is safe to drink.", "The sun is fierce — high-SPF sunscreen is a must."] },
  "New Zealand": { tapWater: "safe", notes: ["Tap water is safe and clean.", "Strong UV — sunscreen even on cloudy days."] },
  Fiji: { tapWater: "caution", notes: ["Resort water is fine; use bottled in villages.", "Strong equatorial sun."] },
  "French Polynesia": { tapWater: "caution", notes: ["Bottled water is recommended on most islands.", "Reef-safe sunscreen; strong sun on the water."] },
};

const ALIAS: Record<string, string> = {
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
  "United States": "USA",
};

export function getHealthSafety(country?: string | null): HealthSafety | null {
  if (!country) return null;
  return DATA[country] ?? DATA[ALIAS[country] ?? ""] ?? null;
}
