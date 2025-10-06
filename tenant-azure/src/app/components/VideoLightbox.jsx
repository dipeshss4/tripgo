
"use client";

export default function VideoLightbox({ open, onClose, item }) {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow ring-1 ring-white/20">
        <div className="relative">
          <button className="absolute right-3 top-3 z-10 rounded bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900" onClick={onClose}>Close</button>
          <video className="w-full h-[60vh] object-cover" controls autoPlay playsInline>
            {item.srcWebm && <source src={item.srcWebm} type="video/webm" />}
            <source src={item.srcMp4} type="video/mp4" />
          </video>
        </div>
        <div className="p-4 text-white">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <p className="text-white/80">{item.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
