// Coordinates for every destination referenced in lib/mock-data.ts's
// PACKAGES dataset, keyed by the exact strings used in each package's
// `destinations` array. Decorative, for plotting the hero route map.

export const PACKAGE_DESTINATION_COORDS: Record<string, [number, number]> = {
  // India
  Delhi: [28.6139, 77.2090],
  Agra: [27.1767, 78.0081],
  Jaipur: [26.9124, 75.7873],
  Jodhpur: [26.2389, 73.0243],
  Udaipur: [24.5854, 73.7125],
  Jaisalmer: [26.9157, 70.9083],

  // Bhutan
  Paro: [27.4287, 89.4164],
  Thimphu: [27.4712, 89.6339],
  Punakha: [27.5916, 89.8775],

  // Sri Lanka & Maldives
  Colombo: [6.9271, 79.8612],
  Kandy: [7.2906, 80.6337],
  "Malé": [4.1755, 73.5093],

  // Italy
  Rome: [41.9028, 12.4964],
  Positano: [40.6280, 14.4849],
  Florence: [43.7696, 11.2558],

  // East Africa
  Nairobi: [-1.2921, 36.8219],
  Serengeti: [-2.3333, 34.8333],
  Zanzibar: [-6.1659, 39.2026],

  // Japan
  Tokyo: [35.6762, 139.6503],
  Hakone: [35.2324, 139.1069],
  Kyoto: [35.0116, 135.7681],

  // Patagonia
  "El Calafate": [-50.3379, -72.2647],
  "Torres del Paine": [-51.0, -73.0],
  Ushuaia: [-54.8019, -68.3030],

  // Morocco
  Marrakech: [31.6295, -7.9811],
  "Fès": [34.0181, -5.0078],
  Merzouga: [31.0801, -4.0133],

  // Peru
  Lima: [-12.0464, -77.0428],
  Cusco: [-13.5319, -71.9675],
  "Machu Picchu": [-13.1631, -72.5450],

  // New Zealand
  Queenstown: [-45.0312, 168.6626],
  "Milford Sound": [-44.6708, 167.9252],
  Wanaka: [-44.7032, 169.1321],

  // Jordan
  Amman: [31.9454, 35.9284],
  Petra: [30.3285, 35.4444],
  "Wadi Rum": [29.5324, 35.4206],

  // Egypt
  Cairo: [30.0444, 31.2357],
  Luxor: [25.6872, 32.6396],
  Aswan: [24.0889, 32.8998],

  // South Africa
  "Cape Town": [-33.9249, 18.4241],
  Stellenbosch: [-33.9321, 18.8602],
  Kruger: [-24.0, 31.5],

  // Greece
  Athens: [37.9838, 23.7275],
  Santorini: [36.3932, 25.4615],
  Mykonos: [37.4467, 25.3289],

  // French Polynesia
  Papeete: [-17.5516, -149.5585],
  "Bora Bora": [-16.5004, -151.7415],
  Moorea: [-17.5388, -149.8295],

  // Iceland
  "Reykjavík": [64.1466, -21.9426],
  "Vík": [63.4186, -19.0060],
  "Jökulsárlón": [64.0784, -16.2300],

  // Scotland
  Edinburgh: [55.9533, -3.1883],
  Inverness: [57.4778, -4.2247],
  "Isle of Skye": [57.2736, -6.2155],

  // Vietnam & Cambodia
  Hanoi: [21.0285, 105.8542],
  "Halong Bay": [20.9101, 107.1839],
  "Siem Reap": [13.3633, 103.8564],

  // American Southwest
  "Grand Canyon": [36.1069, -112.1129],
  Sedona: [34.8697, -111.7610],
  Zion: [37.2982, -113.0263],
};

export function getPackageDestinationCoords(name: string): [number, number] | null {
  return PACKAGE_DESTINATION_COORDS[name] ?? null;
}
