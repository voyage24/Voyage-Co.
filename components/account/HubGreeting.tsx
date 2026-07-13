"use client";

import { useEffect, useState } from "react";

// The hub's warm, time-aware greeting. Server-rendered pages can't know the
// visitor's local hour, so the salutation is resolved on the client and the
// full date shown alongside — a calm, concierge-style opening to the page.
export default function HubGreeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState("Welcome back");
  const [today, setToday] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    setToday(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  return (
    <div className="mb-8">
      <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">My Voyages</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">
        {greeting}{firstName ? `, ${firstName}` : ""}.
      </h1>
      {today && <p className="text-sm text-ink-muted font-light mt-1.5">{today}</p>}
    </div>
  );
}
