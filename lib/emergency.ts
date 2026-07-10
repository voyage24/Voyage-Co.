// Traveller safety reference: emergency phone numbers + an IANA timezone per
// country, so the destination-essentials card can show local time and who to
// call. Static data, bundled — works fully offline. 112 works across the EU and
// on most GSM networks worldwide, so it's the fallback.

export type Emergency = { police: string; ambulance: string; general: string; tz: string };

const DATA: Record<string, Emergency> = {
  India: { police: "100", ambulance: "102", general: "112", tz: "Asia/Kolkata" },
  "United Arab Emirates": { police: "999", ambulance: "998", general: "112", tz: "Asia/Dubai" },
  UAE: { police: "999", ambulance: "998", general: "112", tz: "Asia/Dubai" },
  "United Kingdom": { police: "999", ambulance: "999", general: "112", tz: "Europe/London" },
  UK: { police: "999", ambulance: "999", general: "112", tz: "Europe/London" },
  France: { police: "17", ambulance: "15", general: "112", tz: "Europe/Paris" },
  Italy: { police: "113", ambulance: "118", general: "112", tz: "Europe/Rome" },
  Spain: { police: "091", ambulance: "061", general: "112", tz: "Europe/Madrid" },
  Switzerland: { police: "117", ambulance: "144", general: "112", tz: "Europe/Zurich" },
  Greece: { police: "100", ambulance: "166", general: "112", tz: "Europe/Athens" },
  Portugal: { police: "112", ambulance: "112", general: "112", tz: "Europe/Lisbon" },
  Germany: { police: "110", ambulance: "112", general: "112", tz: "Europe/Berlin" },
  Netherlands: { police: "112", ambulance: "112", general: "112", tz: "Europe/Amsterdam" },
  Austria: { police: "133", ambulance: "144", general: "112", tz: "Europe/Vienna" },
  "United States": { police: "911", ambulance: "911", general: "911", tz: "America/New_York" },
  USA: { police: "911", ambulance: "911", general: "911", tz: "America/New_York" },
  Maldives: { police: "119", ambulance: "102", general: "102", tz: "Indian/Maldives" },
  Thailand: { police: "191", ambulance: "1669", general: "191", tz: "Asia/Bangkok" },
  Singapore: { police: "999", ambulance: "995", general: "999", tz: "Asia/Singapore" },
  Indonesia: { police: "110", ambulance: "118", general: "112", tz: "Asia/Jakarta" },
  Japan: { police: "110", ambulance: "119", general: "110", tz: "Asia/Tokyo" },
  Australia: { police: "000", ambulance: "000", general: "000", tz: "Australia/Sydney" },
  "New Zealand": { police: "111", ambulance: "111", general: "111", tz: "Pacific/Auckland" },
  "Sri Lanka": { police: "119", ambulance: "1990", general: "119", tz: "Asia/Colombo" },
  Turkey: { police: "155", ambulance: "112", general: "112", tz: "Europe/Istanbul" },
  Egypt: { police: "122", ambulance: "123", general: "122", tz: "Africa/Cairo" },
  Morocco: { police: "19", ambulance: "15", general: "112", tz: "Africa/Casablanca" },
  "South Africa": { police: "10111", ambulance: "10177", general: "112", tz: "Africa/Johannesburg" },
  Bhutan: { police: "113", ambulance: "112", general: "112", tz: "Asia/Thimphu" },
  Nepal: { police: "100", ambulance: "102", general: "112", tz: "Asia/Kathmandu" },
};

// Empty tz means "unknown" — the UI hides the local-time cell rather than
// showing UTC mislabelled as local time. 112 works on most GSM networks.
const FALLBACK: Emergency = { police: "112", ambulance: "112", general: "112", tz: "" };

export function getEmergency(country: string | null | undefined): Emergency {
  if (!country) return FALLBACK;
  return DATA[country.trim()] ?? FALLBACK;
}
