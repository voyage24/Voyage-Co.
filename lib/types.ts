export interface City {
  code: string;
  name: string;
  fullName: string;
  country: string;
}

export interface Station {
  code: string;
  name: string;
  fullName: string;
  city: string;
  state: string;
}

export interface Airline {
  code: string;
  name: string;
  country: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  region: string;
  stars: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  image: string;
  images?: string[];
  category: string;
  amenities: string[];
  highlights: string[];
  description: string;
  badge?: string | null;
  // Optional — populated for hotels sourced from the luxury hotels master
  // dataset; absent for the original curated entries (those fall back to
  // city-level coordinates via lib/hotel-coords.ts).
  brand?: string | null;
  lat?: number | null;
  lng?: number | null;
  officialSite?: string | null;
  // Computed on listing pages (lib/price-context) — a value/premium read vs
  // same country+category peers; absent elsewhere.
  valueBand?: "value" | "premium";
  priceOnRequest?: boolean;
}

export interface Flight {
  id: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  businessPrice?: number | null;
  amenities: string[];
  currency?: string;          // ISO currency code for `price`, e.g. "INR" / "USD". Defaults to INR.
  source?: "mock" | "live";   // "live" = real Amadeus fare — suppresses the fake discount badge.
}

export interface Train {
  id: string;
  name: string;
  number: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departure: string;
  arrival: string;
  duration: string;
  classes: { type: string; price: number; available: number }[];
  runsDays: string[];
}

export interface Experience {
  id: string;
  title: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  category: string;
  image: string;
  description: string;
  includes: string[];
  badge?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface Package {
  id: string;
  title: string;
  subtitle: string;
  destinations: string[];
  duration: string;
  pricePerPerson: number;
  image: string;
  highlights: string[];
  includes: string[];
  category: string;
  badge?: string | null;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image: string;
  author: string;
  content: string[];
}

export interface Cruise {
  id: string;
  name: string;
  cruiseLine: string;
  ship: string;
  region: string;
  departurePort: string;
  ports: string[];
  duration: string;
  pricePerPerson: number;
  image: string;
  category: string;
  amenities: string[];
  highlights: string[];
  includes: string[];
  description: string;
  rating: number;
  reviewCount: number;
  badge?: string | null;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export type CabinClass = "Economy" | "Premium Economy" | "Business" | "First";
export type TripType = "one-way" | "round-trip" | "multi-city";

export interface Trip {
  ref: string;
  type: "hotel" | "flight" | "package" | "experience" | "train" | "cruise";
  title: string;
  subtitle: string;
  image?: string;
  total: number;
  guestName: string;
  bookedAt: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  detail?: string | null;
  image?: string | null;
  rating: number;
  sortOrder: number;
  published: boolean;
}
