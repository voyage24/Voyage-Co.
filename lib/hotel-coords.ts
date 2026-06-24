// Coordinates for every city referenced in lib/mock-data.ts's HOTELS
// dataset, keyed by city name so any hotel the traveller picks via the
// search dropdown can be plotted — not just a fixed featured set.
// Decorative, for the hero map, not for navigation.

export const HOTEL_CITY_COORDS: Record<string, [number, number]> = {
  Agra: [27.1767, 78.0081],
  "Baden-Baden": [48.7606, 8.2400],
  Bali: [-8.3405, 115.0920],
  Bangkok: [13.7563, 100.5018],
  Barcelona: [41.3851, 2.1734],
  Cancun: [21.1619, -86.8515],
  Dubai: [25.2048, 55.2708],
  Florence: [43.7696, 11.2558],
  Gangtey: [27.5044, 90.1614],
  Goa: [15.2993, 74.1240],
  Gstaad: [46.4724, 7.2868],
  Hyderabad: [17.3850, 78.4867],
  Ibiza: [38.9067, 1.4206],
  Jaipur: [26.9124, 75.7873],
  Kochi: [9.9312, 76.2673],
  "Lake Como": [45.9860, 9.2572],
  London: [51.5072, -0.1276],
  Lucerne: [47.0502, 8.3093],
  Maldives: [3.2028, 73.2207],
  Marrakech: [31.6295, -7.9811],
  Mumbai: [19.0760, 72.8777],
  Munich: [48.1351, 11.5820],
  Nairobi: [-1.2921, 36.8219],
  "New Delhi": [28.6139, 77.2090],
  "New York": [40.7128, -74.0060],
  Paris: [48.8566, 2.3522],
  Paro: [27.4287, 89.4164],
  Phuket: [7.8804, 98.3923],
  Porto: [41.1579, -8.6291],
  Positano: [40.6280, 14.4849],
  Puglia: [40.9000, 17.3000],
  Ranthambore: [26.0173, 76.5026],
  Reykjavik: [64.1466, -21.9426],
  Rishikesh: [30.0869, 78.2676],
  Rome: [41.9028, 12.4964],
  Santorini: [36.3932, 25.4615],
  Seychelles: [-4.6796, 55.4920],
  Singapore: [1.3521, 103.8198],
  "St. Moritz": [46.4908, 9.8355],
  Sydney: [-33.8688, 151.2093],
  Thimphu: [27.4712, 89.6339],
  Tokyo: [35.6762, 139.6503],
  Udaipur: [24.5854, 73.7125],
  Venice: [45.4408, 12.3155],
  Vienna: [48.2082, 16.3738],

  // The Americas
  "Los Angeles": [34.0522, -118.2437],
  Miami: [25.7617, -80.1918],
  "Las Vegas": [36.1699, -115.1398],
  "San Francisco": [37.7749, -122.4194],
  Aspen: [39.1911, -106.8175],
  Banff: [51.1784, -115.5708],
  Vancouver: [49.2827, -123.1207],

  // South America
  "Rio de Janeiro": [-22.9068, -43.1729],
  "Buenos Aires": [-34.6037, -58.3816],
  Cusco: [-13.5319, -71.9675],
  Cartagena: [10.3910, -75.4794],

  // Caribbean
  "Turks and Caicos": [21.7214, -71.5358],
  "St Barts": [17.9000, -62.8333],
  "Montego Bay": [18.4762, -77.8939],
  Anguilla: [18.2206, -63.0686],

  // Middle East
  Doha: [25.2854, 51.5310],
  "Abu Dhabi": [24.4539, 54.3773],
  Muscat: [23.5859, 58.4059],
  AlUla: [26.6090, 37.9220],

  // Africa
  "Cape Town": [-33.9249, 18.4241],
  "Victoria Falls": [-17.9243, 25.8572],
  Cairo: [30.0444, 31.2357],
  Zanzibar: [-6.1659, 39.2026],

  // East Asia & Pacific
  "Hong Kong": [22.3193, 114.1694],
  Shanghai: [31.2304, 121.4737],
  Beijing: [39.9042, 116.4074],
  Seoul: [37.5665, 126.9780],
  Kyoto: [35.0116, 135.7681],
  Weligama: [5.9667, 80.4167],
  Kathmandu: [27.7172, 85.3240],
  "Siem Reap": [13.3633, 103.8564],
  "Luang Prabang": [19.8856, 102.1347],
  Boracay: [11.9674, 121.9248],
  Queenstown: [-45.0312, 168.6626],
  "Bora Bora": [-16.5004, -151.7415],
  Fiji: [-17.7134, 178.0650],

  // Europe (more)
  Edinburgh: [55.9533, -3.1883],
  Amsterdam: [52.3676, 4.9041],
  Copenhagen: [55.6761, 12.5683],
  Stockholm: [59.3293, 18.0686],
  Lisbon: [38.7223, -9.1393],
  Madrid: [40.4168, -3.7038],
  Budapest: [47.4979, 19.0402],
  Prague: [50.0755, 14.4378],
  Dubrovnik: [42.6507, 18.0944],
  Berlin: [52.5200, 13.4050],
};

export function getHotelCityCoords(city: string): [number, number] | null {
  return HOTEL_CITY_COORDS[city] ?? null;
}
