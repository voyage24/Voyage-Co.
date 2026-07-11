import PropertyMap from "@/components/ui/PropertyMap";
import DestinationWeather from "@/components/ui/DestinationWeather";
import DirectionsButton from "@/components/ui/DirectionsButton";
import DestinationEssentials from "@/components/ui/DestinationEssentials";
import PackingList from "@/components/ui/PackingList";
import Phrasebook from "@/components/ui/Phrasebook";
import NearestAirport from "@/components/products/NearestAirport";
import BestTimeToVisit from "@/components/products/BestTimeToVisit";
import TippingGuide from "@/components/products/TippingGuide";
import CarbonEstimate from "@/components/products/CarbonEstimate";
import ConnectivityGuide from "@/components/products/ConnectivityGuide";

// The shared "destination companion" block used across stays, experiences,
// cruises and packages: map + directions + live weather (when coordinates are
// known), and local time / emergency numbers / concierge / SOS / packing list /
// phrases (when the destination country is known). Renders only what the data
// supports, so it degrades gracefully.
export default function DestinationCompanion({
  coords, country, city, name, destKey, heading = "Location",
}: {
  coords?: [number, number] | null;
  country?: string;
  city?: string;
  name: string;
  destKey: string;
  heading?: string;
}) {
  const hasCoords = !!coords;
  const hasCountry = !!country;
  if (!hasCoords && !hasCountry) return null;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-serif text-2xl font-light text-ink">{heading}</h2>
        {hasCoords && (
          <div className="flex items-center gap-4">
            <DirectionsButton lat={coords![0]} lng={coords![1]} name={name} />
            <DestinationWeather lat={coords![0]} lng={coords![1]} />
          </div>
        )}
      </div>
      {hasCoords && (
        <>
          <PropertyMap lat={coords![0]} lng={coords![1]} name={name} />
          <div className="mt-4"><NearestAirport lat={coords![0]} lng={coords![1]} /></div>
        </>
      )}

      {hasCountry ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 items-start">
          <div className="space-y-4">
            <DestinationEssentials country={country!} city={city} />
            <TippingGuide country={country} />
            <ConnectivityGuide country={country} />
          </div>
          <div className="space-y-4">
            {hasCoords && <PackingList lat={coords![0]} lng={coords![1]} destinationKey={destKey} />}
            {hasCoords && <CarbonEstimate lat={coords![0]} lng={coords![1]} destination={city} />}
            <BestTimeToVisit country={country} />
            <Phrasebook country={country!} />
          </div>
        </div>
      ) : hasCoords ? (
        <div className="mt-4"><PackingList lat={coords![0]} lng={coords![1]} destinationKey={destKey} /></div>
      ) : null}
    </section>
  );
}
