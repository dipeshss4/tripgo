
"use client";

import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoLightbox from "./VideoLightbox";
import { mediaApi } from "../../lib/api";
import { useApi } from "./hooks/useApi";

export default function VideoShowcase() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const onOpen = (item) => { setActive(item); setOpen(true); };

  // Fetch videos from backend
  const { data: videosData, loading, error } = useApi(() => mediaApi.getVideos({ limit: 6 }));
  const backendVideos = videosData?.data || [];

  // Map backend data to component format with fallback
  const items = backendVideos.length > 0
    ? backendVideos.map((video, index) => ({
        id: video.id,
        title: video.title || `Video ${index + 1}`,
        subtitle: video.description || "Discover amazing experiences",
        tag: video.tags?.[0] || (index === 0 ? "Featured" : "Popular"),
        poster: video.thumbnailUrl || video.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60&auto=format&fit=crop",
        srcMp4: video.url,
      }))
    : [
        // Fallback data if API fails or returns empty
        { id: 1, title: "Caribbean Highlights", subtitle: "Turquoise bays, sunset decks, and island hopping.", tag: "Top Pick", poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" },
        { id: 2, title: "Mediterranean Dreams", subtitle: "From Amalfi cliffs to Greek isles in motion.", tag: "Editors' Choice", poster: "https://images.unsplash.com/photo-1526481280698-8fcc13fd87f8?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4" },
        { id: 3, title: "Coastal Paradise", subtitle: "Stunning coastlines and pristine beaches await.", tag: "New", poster: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://videos.pexels.com/video-files/2169542/2169542-uhd_2560_1440_30fps.mp4" },
        { id: 4, title: "Ocean Explorer", subtitle: "Navigate through crystal blue waters and hidden coves.", tag: "Popular", poster: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4" },
        { id: 5, title: "Tropical Getaway", subtitle: "Escape to palm-fringed beaches and warm tropical waters.", tag: "Featured", poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://videos.pexels.com/video-files/2169307/2169307-uhd_2560_1440_30fps.mp4" },
        { id: 6, title: "Sunset Sailing", subtitle: "Experience magical golden hours on the open sea.", tag: "Trending", poster: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=60&auto=format&fit=crop", srcMp4: "https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4" },
      ];

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
