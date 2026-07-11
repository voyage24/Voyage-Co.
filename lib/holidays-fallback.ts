// Curated holiday/festival fallback for destinations the free Nager.Date API
// doesn't cover (notably India, Thailand, the Gulf and much of South/SE Asia).
// High-confidence dates only — fixed national days plus widely-published major
// festivals for 2026–2027. Refresh yearly. Keyed by ISO-3166 alpha-2.

type H = { date: string; name: string; localName?: string };

export const FALLBACK_HOLIDAYS: Record<string, H[]> = {
  IN: [
    { date: "2026-08-15", name: "Independence Day" },
    { date: "2026-10-02", name: "Gandhi Jayanti" },
    { date: "2026-10-20", name: "Dussehra", localName: "Vijayadashami" },
    { date: "2026-11-08", name: "Diwali", localName: "Deepavali" },
    { date: "2026-12-25", name: "Christmas" },
    { date: "2027-01-26", name: "Republic Day" },
    { date: "2027-08-15", name: "Independence Day" },
    { date: "2027-10-02", name: "Gandhi Jayanti" },
  ],
  TH: [
    { date: "2026-12-05", name: "King Bhumibol's Birthday / Father's Day" },
    { date: "2026-12-10", name: "Constitution Day" },
    { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-04-06", name: "Chakri Day" },
    { date: "2027-04-13", name: "Songkran (Thai New Year)" },
    { date: "2027-04-14", name: "Songkran" },
    { date: "2027-04-15", name: "Songkran" },
  ],
  AE: [
    { date: "2026-12-02", name: "UAE National Day" },
    { date: "2026-12-03", name: "UAE National Day Holiday" },
    { date: "2027-01-01", name: "New Year's Day" },
  ],
  MV: [
    { date: "2026-07-26", name: "Independence Day" },
    { date: "2026-11-11", name: "Republic Day" },
    { date: "2027-07-26", name: "Independence Day" },
  ],
  LK: [
    { date: "2026-12-25", name: "Christmas" },
    { date: "2027-02-04", name: "Independence Day" },
    { date: "2027-04-13", name: "Sinhala & Tamil New Year" },
    { date: "2027-04-14", name: "Sinhala & Tamil New Year" },
  ],
  NP: [
    { date: "2026-09-19", name: "Constitution Day" },
    { date: "2026-10-20", name: "Dashain", localName: "Vijaya Dashami" },
    { date: "2026-11-08", name: "Tihar", localName: "Deepawali" },
  ],
  MY: [
    { date: "2026-08-31", name: "Merdeka (Independence Day)" },
    { date: "2026-09-16", name: "Malaysia Day" },
    { date: "2026-11-08", name: "Deepavali" },
    { date: "2026-12-25", name: "Christmas" },
    { date: "2027-02-06", name: "Chinese New Year" },
    { date: "2027-02-07", name: "Chinese New Year" },
  ],
  MU: [
    { date: "2026-11-08", name: "Diwali" },
    { date: "2026-12-25", name: "Christmas" },
    { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-02-01", name: "Abolition of Slavery" },
    { date: "2027-03-12", name: "Independence Day" },
  ],
  TZ: [
    { date: "2026-12-09", name: "Independence Day" },
    { date: "2026-12-25", name: "Christmas" },
    { date: "2027-01-12", name: "Zanzibar Revolution Day" },
    { date: "2027-04-26", name: "Union Day" },
  ],
};
