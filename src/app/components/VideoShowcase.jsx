
"use client";

import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoLightbox from "./VideoLightbox";

const items = [
  { id: 1, title: "Caribbean Highlights", subtitle: "Turquoise bays, sunset decks, and island hopping.", tag: "Top Pick", poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 2, title: "Mediterranean Days", subtitle: "From Amalfi cliffs to Greek isles in motion.", tag: "Editors’ Choice", poster: "https://images.unsplash.com/photo-1526481280698-8fcc13fd87f8?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4" },
  { id: 3, title: "Alaska in Motion", subtitle: "Glaciers calving, whales surfacing, fjords unfolding.", tag: "New", poster: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://cdn.coverr.co/videos/coverr-ocean-waves-1569/1080p.mp4" },
];

export default function VideoShowcase() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const onOpen = (item) => { setActive(item); setOpen(true); };

  return (
    <section id="videos" className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <p className="text-sm uppercase tracking-widest text-gray-500">Watch & Feel</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Video Tours</h2>
          <p className="mt-3 text-gray-600">Quick clips to help you pick your next voyage.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => <VideoCard key={it.id} item={it} onOpen={onOpen} />)}
        </div>
      </div>

      <VideoLightbox open={open} onClose={() => setOpen(false)} item={active} />
    </section>
  );
}
