"use client";

import { useEffect, useRef, useState } from "react";
import MapLegend from "./MapLegend";

export default function AnimatedRouteMap({
  points = [],
  height = "460px",
  bgUrl = "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
}) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const shipRef = useRef(null);
  const rafRef = useRef(null);
  const [hoveredPort, setHoveredPort] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  const project = (lat, lng, w, h) => {
    const x = ((lng + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    return { x, y };
  };

  useEffect(() => {
    if (!svgRef.current || !pathRef.current || points.length < 2) return;

    const svg = svgRef.current;
    const path = pathRef.current;
    const ship = shipRef.current;

    const w = svg.viewBox.baseVal.width || svg.clientWidth;
    const h = svg.viewBox.baseVal.height || svg.clientHeight;

    const coords = points.map((p) => project(p.lat, p.lng, w, h));
    const d = coords.map((c, i) => (i === 0 ? `M ${c.x},${c.y}` : `L ${c.x},${c.y}`)).join(" ");
    path.setAttribute("d", d);

    const total = path.getTotalLength();
    const duration = 15000; // Slower, more elegant animation
    let start;

    const tick = (t) => {
      if (!start) start = t;
      const elapsed = (t - start) % duration;
      const progress = elapsed / duration;
      const len = progress * total;
      const pt = path.getPointAtLength(len);

      // Calculate direction for ship rotation
      const nextLen = Math.min(len + 1, total);
      const nextPt = path.getPointAtLength(nextLen);
      const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);

      ship.setAttribute("transform", `translate(${pt.x}, ${pt.y}) rotate(${angle})`);
      setAnimationProgress(progress);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [points]);

  const getCurrentSegment = () => {
    if (points.length < 2) return 0;
    const segmentProgress = animationProgress * (points.length - 1);
    return Math.floor(segmentProgress);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5" style={{ height }}>
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <img
          src={bgUrl}
          alt="World Map"
          className="h-full w-full object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-blue-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </div>

      {/* Animated Water Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-blue-300/10 to-transparent transform rotate-12 scale-150" />
      </div>

      {/* Main SVG */}
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Route Path with Glow Effect */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.8)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.8)" />
          </linearGradient>
        </defs>

        {/* Background route path (shadow) */}
        <path
          ref={pathRef}
          d=""
          fill="none"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(2, 2)"
        />

        {/* Main route path */}
        <path
          ref={pathRef}
          d=""
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="20 5"
          filter="url(#glow)"
          className="animate-pulse"
        />

        {/* Port Markers */}
        {points.map((point, index) => {
          const coords = project(point.lat, point.lng, 1600, 800);
          const isActive = getCurrentSegment() === index;
          const isPassed = getCurrentSegment() > index;

          return (
            <g key={index}>
              {/* Port Glow */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r="20"
                fill={isActive ? "rgba(59, 130, 246, 0.3)" : "rgba(147, 51, 234, 0.2)"}
                className={isActive ? "animate-ping" : ""}
              />

              {/* Port Marker */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r="8"
                fill={isPassed ? "#10b981" : isActive ? "#3b82f6" : "#6b7280"}
                stroke="white"
                strokeWidth="3"
                className="cursor-pointer transition-all duration-300 hover:scale-125"
                onMouseEnter={() => setHoveredPort(index)}
                onMouseLeave={() => setHoveredPort(null)}
              />

              {/* Port Number */}
              <text
                x={coords.x}
                y={coords.y}
                textAnchor="middle"
                dy="0.35em"
                className="fill-white text-xs font-bold pointer-events-none"
              >
                {index + 1}
              </text>
            </g>
          );
        })}

        {/* Animated Ship */}
        <g ref={shipRef}>
          <g transform="translate(-12, -6)">
            {/* Ship Shadow */}
            <path
              d="M2 2 L20 2 L22 6 L20 10 L2 10 L0 6 Z"
              fill="rgba(0,0,0,0.3)"
              transform="translate(2, 2)"
            />

            {/* Ship Hull */}
            <path
              d="M0 0 L18 0 L20 4 L18 8 L0 8 L-2 4 Z"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />

            {/* Ship Details */}
            <rect x="4" y="2" width="3" height="4" fill="white" />
            <rect x="9" y="1" width="3" height="6" fill="white" />
            <rect x="14" y="2" width="2" height="4" fill="white" />

            {/* Ship Wake */}
            <path
              d="M-8 4 Q-4 2 0 4 Q-4 6 -8 4"
              fill="rgba(255,255,255,0.4)"
              className="animate-pulse"
            />
          </g>
        </g>
      </svg>

      {/* Map Legend */}
      <MapLegend />

      {/* Port Info Tooltip */}
      {hoveredPort !== null && points[hoveredPort] && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg ring-1 ring-black/5 z-30">
          <div className="text-sm font-semibold text-gray-900">
            Stop {hoveredPort + 1}: {points[hoveredPort].name}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {points[hoveredPort].lat.toFixed(4)}°, {points[hoveredPort].lng.toFixed(4)}°
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
          <div className="flex items-center justify-between text-white text-sm mb-2">
            <span>Journey Progress</span>
            <span>{Math.round(animationProgress * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${animationProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Destination */}
      {points.length > 0 && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-xl px-4 py-3 text-white shadow-lg">
          <div className="text-xs opacity-80">En Route To</div>
          <div className="text-sm font-semibold">
            {points[Math.min(getCurrentSegment() + 1, points.length - 1)]?.name || points[points.length - 1]?.name}
          </div>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-bounce"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}