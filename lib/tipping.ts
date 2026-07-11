// Tipping norms + a few cultural etiquette notes per country, so guests know
// what's customary at a destination. Curated for the main destination countries;
// unknown countries return null and the card hides. Guidance, not rules.

export type TippingGuide = {
  level: string;        // one-line headline (e.g. "10% is customary")
  restaurants: string;
  hotels: string;
  taxis: string;
  etiquette: string[];  // 2–3 short cultural notes
};

const DATA: Record<string, TippingGuide> = {
  India: {
    level: "Appreciated, not obligatory — 5–10%",
    restaurants: "Round up or 5–10% if service isn't already added.",
    hotels: "₹50–100 for porters and housekeeping.",
    taxis: "Round up the fare.",
    etiquette: ["Remove shoes before entering homes and temples.", "Dress modestly at religious sites; cover shoulders and knees.", "Use or receive with the right hand."],
  },
  Maldives: {
    level: "Often included — extra is appreciated",
    restaurants: "A 10% service charge is usually added; round up for standout service.",
    hotels: "$5–10 for your villa host or butler per day.",
    taxis: "Not expected (most transfers are by resort boat).",
    etiquette: ["On local (non-resort) islands, dress modestly and cover shoulders and knees.", "Alcohol is served only on resort islands.", "Respect the reef — never touch or stand on coral."],
  },
  "Sri Lanka": {
    level: "10% is customary",
    restaurants: "10% if a service charge isn't already added.",
    hotels: "Rs 200–500 for porters and helpful staff.",
    taxis: "Round up the fare.",
    etiquette: ["Remove shoes and hats at temples; cover shoulders and knees.", "Never pose with your back to a Buddha statue.", "Use the right hand for giving and eating."],
  },
  Thailand: {
    level: "Not obligatory — appreciated",
    restaurants: "Round up, or 10% at nicer restaurants.",
    hotels: "20–50 baht for porters.",
    taxis: "Round up to the nearest note.",
    etiquette: ["The 'wai' (palms together) is the traditional greeting.", "Never touch anyone's head or point your feet at people or Buddha images.", "Dress respectfully at temples — cover shoulders and knees."],
  },
  Indonesia: {
    level: "Appreciated — often included",
    restaurants: "A 5–10% service charge is common; round up otherwise.",
    hotels: "10,000–20,000 rupiah for porters and daily housekeeping.",
    taxis: "Round up the metered fare.",
    etiquette: ["Use the right hand to give, receive and eat.", "Dress modestly at temples and wear the provided sash/sarong.", "Remove shoes before entering a home."],
  },
  Vietnam: {
    level: "Not traditional, but welcomed",
    restaurants: "5–10% at tourist-facing restaurants.",
    hotels: "$1–2 for porters.",
    taxis: "Round up the fare.",
    etiquette: ["Remove shoes when entering homes and some temples.", "Pass items with both hands as a sign of respect.", "Dress modestly at pagodas."],
  },
  Japan: {
    level: "No tipping — it can cause confusion",
    restaurants: "Never tip; excellent service is standard.",
    hotels: "Not expected. A ryokan may add a service charge.",
    taxis: "Round-number fares only; no tip.",
    etiquette: ["Bow when greeting; a nod is fine for visitors.", "Remove shoes where tatami or a step-up entry (genkan) is present.", "Keep your voice low on trains and don't eat while walking."],
  },
  China: {
    level: "Not customary",
    restaurants: "Tipping isn't expected; some upscale places add a service charge.",
    hotels: "Not expected at most hotels; a few tourist hotels welcome it.",
    taxis: "Round up if you like.",
    etiquette: ["Present and receive business cards and gifts with both hands.", "Leaving a little food shows you were well fed.", "Avoid public displays of anger — 'saving face' matters."],
  },
  "South Korea": {
    level: "No tipping culture",
    restaurants: "Not expected; service is included.",
    hotels: "Not expected.",
    taxis: "No tip; pay the metered fare.",
    etiquette: ["Pour drinks for others, not yourself; receive with both hands.", "Remove shoes indoors.", "Use both hands when giving or receiving items."],
  },
  UAE: {
    level: "10–15% appreciated",
    restaurants: "A 10% service charge is often added; add a little more for good service.",
    hotels: "AED 5–10 for porters and housekeeping.",
    taxis: "Round up the fare.",
    etiquette: ["Dress modestly in public and conservatively at mosques.", "Use the right hand for eating and greetings.", "Avoid public affection; respect prayer times and Ramadan customs."],
  },
  Oman: {
    level: "Appreciated — 10%",
    restaurants: "Round up or 10% if not included.",
    hotels: "1–2 rial for porters.",
    taxis: "Round up the fare.",
    etiquette: ["Dress modestly; cover shoulders and knees.", "Accept coffee and dates when offered — it's a warm tradition.", "Ask before photographing people."],
  },
  Egypt: {
    level: "'Baksheesh' is a way of life — 10%+",
    restaurants: "10% even when a service charge is added (it rarely reaches staff).",
    hotels: "£E 20–50 for porters and helpful staff.",
    taxis: "Agree the fare first, then round up.",
    etiquette: ["Small tips smooth the way for many small services.", "Dress modestly, especially at mosques.", "Use the right hand for eating and giving."],
  },
  Morocco: {
    level: "Customary — 10%",
    restaurants: "10% at restaurants; a few dirham at cafés.",
    hotels: "10–20 dirham for porters.",
    taxis: "Round up the fare.",
    etiquette: ["Bargaining is expected in the souks — do it with good humour.", "Dress modestly; ask before photographing people.", "Use the right hand for eating and greetings."],
  },
  Turkey: {
    level: "5–10% is customary",
    restaurants: "5–10%; check whether 'servis' is already included.",
    hotels: "€1–2 for porters.",
    taxis: "Round up the fare.",
    etiquette: ["Remove shoes before entering homes and mosques.", "Dress modestly at mosques; women cover their hair.", "Accepting offered tea is a friendly gesture."],
  },
  Kenya: {
    level: "10% + safari staff tips",
    restaurants: "10% if not included.",
    hotels: "KSh 100–200 for porters.",
    taxis: "Round up.",
    etiquette: ["On safari, budget a daily tip for guides and camp staff.", "Ask before photographing people, especially in villages.", "Greetings are warm and unhurried — take the time."],
  },
  Tanzania: {
    level: "10% + safari staff tips",
    restaurants: "10% if not included.",
    hotels: "$1–2 for porters.",
    taxis: "Round up.",
    etiquette: ["Tip safari guides and camp staff daily; it's expected and valued.", "Dress modestly, especially in Zanzibar's Stone Town.", "A relaxed 'pole pole' (slowly) pace is the local rhythm."],
  },
  "South Africa": {
    level: "10–15% is customary",
    restaurants: "10–15%; a service charge is sometimes added for larger groups.",
    hotels: "R10–20 for porters; tip car-guards a few rand.",
    taxis: "10%.",
    etiquette: ["Tip safari guides and trackers daily.", "'Now now' means soon-ish, not immediately.", "Greetings matter — start with a friendly hello."],
  },
  Italy: {
    level: "Not expected — round up",
    restaurants: "'Coperto' (cover charge) is standard; round up or leave a few euro.",
    hotels: "€1–2 for porters.",
    taxis: "Round up the fare.",
    etiquette: ["A cappuccino is a morning-only drink to locals.", "Dress smartly; cover shoulders and knees in churches.", "Greet shopkeepers with 'buongiorno' on entering."],
  },
  France: {
    level: "Service included — round up",
    restaurants: "'Service compris' by law; leave small change or a few euro for good service.",
    hotels: "€1–2 for porters.",
    taxis: "Round up the fare.",
    etiquette: ["Always open with 'bonjour' before asking anything.", "Dress well; meals are unhurried.", "Keep your voice down in restaurants."],
  },
  Spain: {
    level: "Small tips — not obligatory",
    restaurants: "Round up, or 5–10% for a good meal.",
    hotels: "€1 for porters.",
    taxis: "Round up.",
    etiquette: ["Dinner is late — 9pm or later.", "A short rest (siesta) still closes some shops mid-afternoon.", "Greet with two cheek kisses among friends."],
  },
  Portugal: {
    level: "5–10% appreciated",
    restaurants: "Round up or 5–10%.",
    hotels: "€1 for porters.",
    taxis: "Round up.",
    etiquette: ["Couvert (bread/olives) on the table is charged if eaten.", "Lunch and dinner are leisurely, social affairs.", "A friendly 'bom dia' opens any interaction."],
  },
  Greece: {
    level: "Round up — 5–10%",
    restaurants: "Round up, or 5–10% at nicer tavernas.",
    hotels: "€1–2 for porters.",
    taxis: "Round up.",
    etiquette: ["Dress modestly at monasteries; shoulders and knees covered.", "Meals are long and shared.", "A relaxed sense of time is part of the charm."],
  },
  UK: {
    level: "10–15% at restaurants",
    restaurants: "10–15% if a service charge isn't already on the bill.",
    hotels: "£1–2 for porters.",
    taxis: "Round up to the nearest pound.",
    etiquette: ["Queue politely — jumping the line is a real faux pas.", "Tipping isn't expected at pubs when ordering at the bar.", "'Please' and 'thank you' go a long way."],
  },
  USA: {
    level: "Tipping is expected — 18–22%",
    restaurants: "18–22% for table service; it's most servers' real income.",
    hotels: "$2–5 for porters; $3–5/day for housekeeping.",
    taxis: "15–20% of the fare.",
    etiquette: ["Tipping is genuinely expected — budget for it everywhere.", "Also tip bartenders ($1–2/drink) and valets.", "Sales tax is added at the register, not on the label."],
  },
  Canada: {
    level: "15–20% is customary",
    restaurants: "15–20% for table service.",
    hotels: "C$2–5 for porters.",
    taxis: "15%.",
    etiquette: ["Tipping norms mirror the US.", "Tax is added at checkout, not shown on the price.", "Politeness and queuing are valued."],
  },
  Mexico: {
    level: "10–15% is customary",
    restaurants: "10–15%; check it isn't already added.",
    hotels: "20–50 pesos for porters and housekeeping.",
    taxis: "Round up; tip more for arranged drivers.",
    etiquette: ["Tip beach and pool servers a little as you go.", "Greetings are warm; a handshake or cheek kiss is common.", "Bargaining is fine in markets, not in shops."],
  },
  Australia: {
    level: "Not expected — welcomed for great service",
    restaurants: "Round up or 10% for excellent service; staff earn a fair wage.",
    hotels: "Not expected; a few dollars for porters is a nice gesture.",
    taxis: "Round up.",
    etiquette: ["An easy-going, first-name friendliness is the norm.", "Sit up front in a taxi/rideshare if travelling solo.", "'Thongs' means flip-flops."],
  },
  "New Zealand": {
    level: "Not expected",
    restaurants: "Not customary; round up for standout service.",
    hotels: "Not expected.",
    taxis: "Round up if you like.",
    etiquette: ["Respect Māori customs at marae and cultural sites.", "Remove shoes when entering many homes.", "A relaxed, informal friendliness prevails."],
  },
  Switzerland: {
    level: "Service included — round up",
    restaurants: "Included by law; round up to the nearest franc or two.",
    hotels: "CHF 1–2 for porters.",
    taxis: "Round up.",
    etiquette: ["Punctuality is taken seriously — arrive on time.", "Greet with a handshake; use surnames until invited otherwise.", "Quiet hours are observed, especially on Sundays."],
  },
};

const ALIAS: Record<string, string> = {
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
  "United States": "USA",
};

export function getTippingGuide(country?: string | null): TippingGuide | null {
  if (!country) return null;
  return DATA[country] ?? DATA[ALIAS[country] ?? ""] ?? null;
}
