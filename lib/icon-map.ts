import {
  Plane, Ship, Car, ChefHat, UtensilsCrossed, Camera, ShieldCheck, Sparkles,
  Gift, Star, Globe, Heart, MapPin, Wine, Music, Compass, Users, Bell, Luggage,
  ListChecks, FileText, ArrowLeftRight, CalendarHeart, Gem, Headset, Anchor,
  Mountain, TreePalm, TrainFront, Coffee, Key, Crown, Diamond, Briefcase,
  type LucideIcon,
} from "lucide-react";

// A curated set of icons that content lists can reference by name, so admins can
// choose an icon without any code change. Unknown names fall back to a sparkle.
export const ICON_MAP: Record<string, LucideIcon> = {
  Plane, Ship, Car, ChefHat, UtensilsCrossed, Camera, ShieldCheck, Sparkles,
  Gift, Star, Globe, Heart, MapPin, Wine, Music, Compass, Users, Bell, Luggage,
  ListChecks, FileText, ArrowLeftRight, CalendarHeart, Gem, Headset, Anchor,
  Mountain, TreePalm, TrainFront, Coffee, Key, Crown, Diamond, Briefcase,
};

export function resolveIcon(name: string | undefined): LucideIcon {
  return (name && ICON_MAP[name]) || Sparkles;
}
