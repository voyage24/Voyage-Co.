// Coordinates for cruise ports of call — keyed by the exact port strings used
// in lib/mock-data.ts's CRUISES dataset. Decorative, for plotting the hero
// route map, not for navigation. Covers every port across all 18 cruises so
// any of them can be featured, not just a handful.

export const PORT_COORDS: Record<string, [number, number]> = {
  // Eastern Caribbean Discovery (c1)
  "Miami, USA": [25.7617, -80.1918],
  "Nassau, Bahamas": [25.0480, -77.3554],
  "Perfect Day at CocoCay": [25.8013, -77.9533],
  "St. Thomas, USVI": [18.3419, -64.9307],

  // Southern Caribbean Explorer (c2)
  "San Juan, Puerto Rico": [18.4655, -66.1057],
  "Aruba": [12.5211, -69.9683],
  "Curaçao": [12.1696, -68.9900],
  "Bonaire": [12.1784, -68.2385],

  // Western Mediterranean Classics (c3)
  "Barcelona, Spain": [41.3851, 2.1734],
  "Marseille, France": [43.2965, 5.3698],
  "Genoa, Italy": [44.4056, 8.9463],
  "Naples, Italy": [40.8518, 14.2681],
  "Valletta, Malta": [35.8989, 14.5146],

  // Greek Isles & Turkish Coast (c4)
  "Athens, Greece": [37.9838, 23.7275],
  "Santorini, Greece": [36.3932, 25.4615],
  "Kuşadası, Turkey": [37.8579, 27.2610],
  "Mykonos, Greece": [37.4467, 25.3289],
  "Istanbul, Turkey": [41.0082, 28.9784],

  // Alaska Glacier Discovery (c5)
  "Seattle, USA": [47.6062, -122.3321],
  "Juneau": [58.3019, -134.4197],
  "Skagway": [59.4583, -135.3139],
  "Ketchikan": [55.3422, -131.6461],
  "Glacier Bay (scenic cruising)": [58.6658, -136.9002],

  // Norwegian Coastal Voyage (c6)
  "Bergen, Norway": [60.3913, 5.3221],
  "Ålesund": [62.4722, 6.1495],
  "Trondheim": [63.4305, 10.3951],
  "Tromsø": [69.6492, 18.9553],
  "Kirkenes": [69.7269, 30.0457],

  // Antarctica Peninsula Expedition (c7) & Antarctica & South Georgia (c8)
  "Ushuaia, Argentina": [-54.8019, -68.3030],
  "Drake Passage (scenic)": [-60.0, -65.0],
  "South Shetland Islands": [-62.0, -58.0],
  "Antarctic Peninsula": [-63.0, -57.0],
  "Falkland Islands": [-51.7963, -59.5236],
  "South Georgia": [-54.2811, -36.5092],

  // Galápagos Discovery (c9)
  "Baltra, Ecuador": [-0.4393, -90.2659],
  "Santa Cruz Island": [-0.6833, -90.3333],
  "Española Island": [-1.3833, -89.6667],
  "Genovesa Island": [0.3167, -89.9500],

  // Japan & Okinawa Voyage (c10)
  "Shanghai, China": [31.2304, 121.4737],
  "Naha, Okinawa": [26.2124, 127.6809],
  "Ishigaki": [24.3448, 124.1572],
  "Yokohama": [35.4437, 139.6380],

  // Nile River Journey (c11)
  "Luxor, Egypt": [25.6872, 32.6396],
  "Esna": [25.2934, 32.5523],
  "Edfu": [24.9778, 32.8742],
  "Kom Ombo": [24.4525, 32.9316],
  "Aswan": [24.0889, 32.8998],

  // Rhine Castles & Vineyards (c12)
  "Amsterdam, Netherlands": [52.3676, 4.9041],
  "Cologne, Germany": [50.9375, 6.9603],
  "Rüdesheim, Germany": [49.9786, 7.9269],
  "Strasbourg, France": [48.5734, 7.7521],
  "Basel, Switzerland": [47.5596, 7.5886],

  // Danube Delights (c13)
  "Budapest, Hungary": [47.4979, 19.0402],
  "Vienna, Austria": [48.2082, 16.3738],
  "Melk, Austria": [48.2261, 15.3344],
  "Passau, Germany": [48.5667, 13.4314],

  // Classic Transatlantic Crossing (c14) — "Open Ocean Crossing" stands in
  // for the voyage's actual endpoint, New York, since that's the implied
  // arrival port for this specific itinerary.
  "Southampton, UK": [50.9097, -1.4044],
  "Open Ocean Crossing": [40.7128, -74.0060],

  // Asia to Africa World Cruise Segment (c15)
  "Singapore": [1.3521, 103.8198],
  "Colombo, Sri Lanka": [6.9271, 79.8612],
  "Mumbai, India": [19.0760, 72.8777],
  "Dubai, UAE": [25.2048, 55.2708],
  "Mombasa, Kenya": [-4.0435, 39.6682],

  // Tahiti & French Polynesia (c16)
  "Papeete, Tahiti": [-17.5516, -149.5585],
  "Bora Bora": [-16.5004, -151.7415],
  "Moorea": [-17.5388, -149.8295],
  "Huahine": [-16.7333, -151.0333],

  // Seychelles Island Hopper (c17)
  "Mahé, Seychelles": [-4.6796, 55.4920],
  "Praslin": [-4.3215, 55.7375],
  "La Digue": [-4.3500, 55.8333],
  "Curieuse": [-4.2833, 55.7333],

  // Into the Midnight Sun (c18)
  "Stockholm, Sweden": [59.3293, 18.0686],
  "Helsinki, Finland": [60.1699, 24.9384],
  "St. Petersburg, Russia": [59.9311, 30.3609],
  "Copenhagen, Denmark": [55.6761, 12.5683],
};

export function getPortCoords(port: string): [number, number] | null {
  return PORT_COORDS[port] ?? null;
}
