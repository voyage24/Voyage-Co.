"use client";

import { useEffect, useState } from "react";

// WMO weather-code → friendly label + emoji.
function describe(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Clear", icon: "☀️" };
  if (code <= 3) return { label: "Partly cloudy", icon: "⛅" };
  if (code <= 48) return { label: "Foggy", icon: "🌫️" };
  if (code <= 67) return { label: "Rain", icon: "🌧️" };
  if (code <= 77) return { label: "Snow", icon: "❄️" };
  if (code <= 82) return { label: "Showers", icon: "🌦️" };
  if (code <= 86) return { label: "Snow showers", icon: "🌨️" };
  if (code >= 95) return { label: "Storm", icon: "⛈️" };
  return { label: "Cloudy", icon: "☁️" };
}

// Live local time + current weather at a destination, via the free, key-less
// Open-Meteo API.
export default function DestinationWeather({ lat, lng }: { lat: number; lng: number }) {
  const [data, setData] = useState<{ temp: number; code: number; tz: string } | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    let on = true;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`)
      .then(r => r.json())
      .then(d => { if (on && d?.current) setData({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, tz: d.timezone }); })
      .catch(() => {});
    return () => { on = false; };
  }, [lat, lng]);

  useEffect(() => {
    if (!data?.tz) return;
    const upd = () => {
      try { setTime(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: data.tz }).format(new Date())); } catch {}
    };
    upd();
    const id = setInterval(upd, 30000);
    return () => clearInterval(id);
  }, [data?.tz]);

  if (!data) return null;
  const w = describe(data.code);

  return (
    <div className="inline-flex items-center gap-4 bg-panel-soft border border-line rounded-xl px-4 py-2.5 text-sm">
      <span className="flex items-center gap-1.5"><span className="text-base">{w.icon}</span> {data.temp}°C · {w.label}</span>
      {time && <span className="text-ink-muted font-light border-l border-line pl-4">{time} local</span>}
    </div>
  );
}
