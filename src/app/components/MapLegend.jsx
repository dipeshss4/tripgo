"use client";

import { useState } from "react";

export default function MapLegend({ className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      icon: "🚢",
      label: "Cruise Ship",
      description: "Your vessel following the route",
      color: "bg-blue-500"
    },
    {
      icon: "📍",
      label: "Port of Call",
      description: "Scheduled stops along the journey",
      color: "bg-gray-500"
    },
    {
      icon: "✅",
      label: "Visited Port",
      description: "Ports already visited",
      color: "bg-green-500"
    },
    {
      icon: "🎯",
      label: "Current Target",
      description: "Next destination",
      color: "bg-blue-600"
    },
    {
      icon: "🛤️",
      label: "Route Path",
      description: "Complete sailing route",
      color: "bg-gradient-to-r from-blue-500 to-purple-500"
    }
  ];

  return (
    <div className={`absolute top-4 left-4 z-20 ${className}`}>
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            Map Legend
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}