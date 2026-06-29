// Key-less interactive location map via OpenStreetMap's embed. No API key,
// no cost. Server component (just an iframe + link).
export default function PropertyMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const d = 0.02;
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;
  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden border border-line aspect-[16/9]">
        <iframe title={`Map of ${name}`} src={src} loading="lazy" className="absolute inset-0 w-full h-full" style={{ border: 0 }} />
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs tracking-[0.1em] uppercase text-gold link-underline">View larger map →</a>
    </div>
  );
}
