
"use client";


import {useAutoplayOnView} from "./hooks/useAutoplayOnView";

export default function VideoCard({ item, onOpen }) {
  const vidRef = useAutoplayOnView();
  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5">
      <div className="relative">
        <video ref={vidRef} className="h-48 w-full object-cover" playsInline muted loop preload="metadata" poster={item.poster} onClick={() => onOpen(item)}>
          {item.srcWebm && <source src={item.srcWebm} type="video/webm" />}
          <source src={item.srcMp4} type="video/mp4" />
        </video>
        <button onClick={() => onOpen(item)} className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow hover:bg-white">
          Play
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{item.title}</h3>
          {item.tag && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs">{item.tag}</span>}
        </div>
        <p className="mt-1 text-sm text-gray-600">{item.subtitle}</p>
      </div>
    </div>
  );
}
