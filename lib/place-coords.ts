import { HOTEL_CITY_COORDS } from "@/lib/hotel-coords";
import { CITY_COORDS } from "@/lib/geo";
import { CITIES } from "@/lib/mock-data";

// Comprehensive property-location → coordinates resolver, so every property
// shows its Location section (map, weather, nearest airport, essentials…).
// Sources, in order: the property's own city/location string, matched against a
// combined table (curated hotel cities + the 550-airport city dataset + the
// supplementary resorts below), with a fuzzy fallback on the location text.

// Resort towns, islands, national parks and renamed/uncovered cities that the
// airport dataset doesn't include — keyed by the exact `city` value used.
const EXTRA: Record<string, [number, number]> = {
  // India (renames / no-airport towns)
  Ghaziabad: [28.6692, 77.4538], Kalyan: [19.2437, 73.1355], Thane: [19.2183, 72.9781],
  Siliguri: [26.7271, 88.3953], Coimbatore: [11.0168, 76.9558], Madurai: [9.9252, 78.1198],
  Tiruchirappalli: [10.7905, 78.7047], Kanyakumari: [8.0883, 77.5385], Bengaluru: [12.9716, 77.5946],
  Mysuru: [12.2958, 76.6394], Hubballi: [15.3647, 75.1240], Mangaluru: [12.9141, 74.8560],
  Vijayawada: [16.5062, 80.6480], Tirupati: [13.6288, 79.4192], Kollam: [8.8932, 76.6141],
  Alappuzha: [9.4981, 76.3388], Kottayam: [9.5916, 76.5222], Thrissur: [10.5276, 76.2144],
  Kannur: [11.8745, 75.3704], Surat: [21.1702, 72.8311], Vadodara: [22.3072, 73.1812],
  Rajkot: [22.3039, 70.8022], Aurangabad: [19.8762, 75.3433], Jaisalmer: [26.9157, 70.9083],
  Bikaner: [28.0229, 73.3119], Ajmer: [26.4499, 74.6399], Kota: [25.2138, 75.8648],
  Mathura: [27.4924, 77.6737], Kanpur: [26.4499, 80.3319], Prayagraj: [25.4358, 81.8463],
  Gorakhpur: [26.7606, 83.3732], Jhansi: [25.4484, 78.5685], Ludhiana: [30.9010, 75.8573],
  Dehradun: [30.3165, 78.0322], Haridwar: [29.9457, 78.1642], Rishikesh: [30.0869, 78.2676],
  Gwalior: [26.2183, 78.1828], Jabalpur: [23.1815, 79.9864], Patna: [25.5941, 85.1376],
  Gaya: [24.7955, 85.0002], Ranchi: [23.3441, 85.3096], Dhanbad: [23.7957, 86.4304],
  Puri: [19.8135, 85.8312], Dibrugarh: [27.4728, 94.9120], Margao: [15.2993, 73.9862],
  Mapusa: [15.5937, 73.8142], Jammu: [32.7266, 74.8570], Katra: [32.9916, 74.9319],
  Shimla: [31.1048, 77.1734],
  // International resort locations / islands / parks
  Courchevel: [45.4154, 6.6345], "New York City": [40.7128, -74.0060], "Sveti Stefan": [42.2547, 18.8917],
  "Ubud, Bali": [-8.5069, 115.2625], "Ise-Shima": [34.3833, 136.8450], "Jackson Hole, Wyoming": [43.4799, -110.7624],
  "Canyon Point, Utah": [37.0028, -111.8935], "Manggis, Bali": [-8.4870, 115.5540], "Nui Chua National Park": [11.7000, 109.1500],
  "Pamalican Island": [11.1053, 120.6006], "Porto Heli": [37.3167, 23.1500], "Torres del Paine": [-50.9423, -73.4068],
  "Vancouver Island": [49.6500, -125.4500], Uluru: [-25.3444, 131.0369], "Megeve, French Alps": [45.7869, 6.6174],
  "Big Island, Hawaii": [19.5429, -155.6659], "Baa Atoll": [5.1500, 73.0500], "Punta Mita": [20.7772, -105.5100],
  Serengeti: [-2.3333, 34.8333], "Chiang Rai": [19.9105, 99.8406], Ravello: [40.6491, 14.6122],
  Coronado: [32.6859, -117.1831], "Sumba Island": [-9.6500, 120.2648], "Coles Bay, Tasmania": [-42.1263, 148.2836],
  "Tetiaroa Atoll": [-17.0121, -149.5867], Dresden: [51.0504, 13.7373], "Seminyak, Bali": [-8.6900, 115.1686],
  Chicago: [41.8781, -87.6298], "Phu Quoc": [10.2270, 103.9640], Tivat: [42.4370, 18.7031],
  "Santa Monica": [34.0195, -118.4912], "North Male Atoll": [4.3500, 73.5500], "Beaver Creek, Colorado": [39.6042, -106.5165],
  Dorado: [18.4589, -66.2679], "Red Sea": [22.3000, 39.0000], Krabi: [8.0863, 98.9063],
  Montalcino: [43.0589, 11.4884], "Virgin Gorda": [18.4802, -64.3936], Montecito: [34.4367, -119.6320],
  "San Miguel de Allende": [20.9153, -100.7436], Matera: [40.6664, 16.6043], "Trou d'Eau Douce": [-20.2400, 57.7900],
  "Sabi Sand Reserve": [-24.8000, 31.5000], "Con Dao": [8.6833, 106.6083], Bodrum: [37.0344, 27.4305],
  "Laamu Atoll": [1.9000, 73.4000], "Nha Trang": [12.2388, 109.1967], "Phang Nga Bay": [8.2757, 98.5006],
  Musandam: [26.1990, 56.2470], "Aspen, Colorado": [39.1911, -106.8175], "Dhaalu Atoll": [2.8500, 72.9500],
  "South Male Atoll": [4.0000, 73.5000], "Five valleys": [27.4712, 89.6339],
};

// Build one lowercased lookup from all sources.
const LOOKUP = new Map<string, [number, number]>();
for (const c of CITIES) { const co = CITY_COORDS[c.code]; if (co && c.name) LOOKUP.set(c.name.toLowerCase(), co); }
for (const [k, v] of Object.entries(HOTEL_CITY_COORDS)) LOOKUP.set(k.toLowerCase(), v);
for (const [k, v] of Object.entries(EXTRA)) LOOKUP.set(k.toLowerCase(), v);

// Sorted longest-first so fuzzy prefers the most specific place name.
const NAMES = Array.from(LOOKUP.keys()).filter(n => n.length >= 4).sort((a, b) => b.length - a.length);

export function resolveCoords(city?: string | null, location?: string | null): [number, number] | null {
  if (city) {
    const direct = LOOKUP.get(city.trim().toLowerCase());
    if (direct) return direct;
    // "Ubud, Bali" → try each comma part.
    for (const part of city.split(",")) { const hit = LOOKUP.get(part.trim().toLowerCase()); if (hit) return hit; }
  }
  // Fuzzy: does the city/location text contain a known place name?
  const hay = `${city || ""} ${location || ""}`.toLowerCase();
  for (const name of NAMES) if (hay.includes(name)) return LOOKUP.get(name)!;
  return null;
}
