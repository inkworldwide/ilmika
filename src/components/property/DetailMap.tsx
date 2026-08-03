"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface NearbyPlace {
  name: string;
  distance: string;
  time: string;
  type: "bus" | "metro" | "airport" | "famous";
  lat: number;
  lng: number;
}

interface DetailMapProps {
  latitude: number;
  longitude: number;
  localityName: string;
  nearbyPlaces?: NearbyPlace[];
  selectedPlaceName?: string | null;
}

export default function DetailMap({
  latitude,
  longitude,
  localityName,
  nearbyPlaces,
  selectedPlaceName,
}: DetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);

  // Map Controls State
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");
  const [activeCategory, setActiveCategory] = useState<"all" | "bus" | "metro" | "famous" | "airport">("all");

  // Directions State
  const [startPoint, setStartPoint] = useState("");
  const [routeResult, setRouteResult] = useState<{ distance: string; duration: string } | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeStartMarkerRef = useRef<L.Marker | null>(null);

  // Tile Layer URLs
  const streetsUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  const satelliteUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: false,
      });

      tileLayerRef.current = L.tileLayer(streetsUrl, {
        attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapRef.current = map;
    }
  }, [latitude, longitude]);

  // Handle Map Tile Switcher (Streets vs Satellite)
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const newUrl = mapType === "satellite" ? satelliteUrl : streetsUrl;
    tileLayerRef.current = L.tileLayer(newUrl, {
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
      maxZoom: 20,
    }).addTo(mapRef.current);
  }, [mapType]);

  // Update Markers & Radius Circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (circleRef.current) circleRef.current.remove();
    if (routeLineRef.current) routeLineRef.current.remove();
    if (routeStartMarkerRef.current) routeStartMarkerRef.current.remove();
    setRouteResult(null);

    map.setView([latitude, longitude], 15);

    // 1. Sleek Gold Property Radius Circle (300m)
    circleRef.current = L.circle([latitude, longitude], {
      color: "#D4AF37",
      fillColor: "#D4AF37",
      fillOpacity: 0.12,
      weight: 2,
      radius: 350,
    }).addTo(map);

    // 2. High-End Property Pin
    const propertyIconHtml = `
      <div class="relative flex flex-col items-center group cursor-pointer">
        <!-- Floating Tooltip Banner (on hover) -->
        <div class="absolute bottom-full mb-2 opacity-90 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 pointer-events-none z-50">
          <div class="bg-slate-950/95 border border-amber-400/80 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
            <svg class="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span>Property Location (${localityName})</span>
          </div>
        </div>
        <!-- 3D Gold Pin Button -->
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-white text-slate-950 font-bold flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-125 ring-4 ring-amber-400/30 z-10">
          <svg class="w-5 h-5 fill-slate-950" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        </div>
        <div class="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-400/40 animate-ping absolute -bottom-1"></div>
        <div class="w-2 h-2 rounded-full bg-amber-500 shadow-sm"></div>
      </div>
    `;

    const propertyIcon = L.divIcon({
      className: "custom-property-pin-wrap",
      html: propertyIconHtml,
      iconSize: [40, 50],
      iconAnchor: [20, 48],
    });

    const propMarker = L.marker([latitude, longitude], { icon: propertyIcon })
      .addTo(map)
      .bindPopup(`<div class="p-1.5 text-center font-sans"><b class="text-xs text-slate-900">Verified Property Location</b><p class="text-[10px] text-slate-500 mt-0.5">${localityName}</p></div>`);

    markersRef.current.set("PROPERTY_CENTER", propMarker);

    // 3. Render Nearby Places as 3D Circular Pin Markers matching Property Home Pin style
    if (nearbyPlaces) {
      const filteredPlaces = activeCategory === "all" 
        ? nearbyPlaces 
        : nearbyPlaces.filter(p => p.type === activeCategory);

      filteredPlaces.forEach((place) => {
        let gradientClasses = "from-sky-400 via-sky-500 to-sky-600";
        let ringClasses = "ring-sky-400/30";
        let borderColor = "#38bdf8";
        // Rich SVG Vector Icons
        let iconSvg = `<svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`;

        if (place.type === "metro") {
          gradientClasses = "from-purple-500 via-purple-600 to-purple-700";
          ringClasses = "ring-purple-400/30";
          borderColor = "#a78bfa";
          iconSvg = `<svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z"/></svg>`;
        } else if (place.type === "airport") {
          gradientClasses = "from-rose-500 via-rose-600 to-rose-700";
          ringClasses = "ring-rose-400/30";
          borderColor = "#fb7185";
          iconSvg = `<svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
        } else if (place.type === "famous") {
          gradientClasses = "from-emerald-500 via-emerald-600 to-emerald-700";
          ringClasses = "ring-emerald-400/30";
          borderColor = "#34d399";
          iconSvg = `<svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
        }

        const isHighlighted = selectedPlaceName === place.name;

        const pinHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer ${isHighlighted ? "z-[99999]" : ""}">
            <!-- Floating Tooltip Banner (Shown on hover or when selected) -->
            <div class="${isHighlighted ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"} transition-all duration-200 absolute bottom-full mb-2 pointer-events-none z-50">
              <div class="bg-slate-950/95 border text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md" style="border-color: ${borderColor};">
                <span>${place.name}</span>
                <span class="bg-white/20 px-1.5 py-0.2 rounded text-[10px] font-mono">${place.distance}</span>
              </div>
            </div>

            <!-- 3D Circular Pin Button matching Home Icon style -->
            <div class="w-9 h-9 rounded-full bg-gradient-to-br ${gradientClasses} border-2 border-white shadow-xl flex items-center justify-center transform transition-transform duration-200 ${
              isHighlighted ? "scale-125 ring-4 " + ringClasses : "group-hover:scale-125"
            } z-10">
              ${iconSvg}
            </div>
            <div class="w-1.5 h-1.5 rounded-full bg-slate-700/60 shadow-sm -mt-0.5"></div>
          </div>
        `;

        const icon = L.divIcon({
          className: `custom-pin-${place.name.replace(/\s+/g, "_")}`,
          html: pinHtml,
          iconSize: [36, 46],
          iconAnchor: [18, 42],
        });

        const marker = L.marker([place.lat, place.lng], { icon })
          .addTo(map)
          .bindPopup(`<div class="p-1.5 font-sans"><b class="text-xs text-slate-900">${place.name}</b><p class="text-[10px] text-slate-500 mt-0.5 font-mono">Distance: ${place.distance} | Travel: ~${place.time}</p></div>`);

        markersRef.current.set(place.name, marker);
      });
    }

  }, [latitude, longitude, localityName, nearbyPlaces, activeCategory, selectedPlaceName]);

  // Handle selectedPlaceName highlight from sidebar
  useEffect(() => {
    if (!selectedPlaceName || !mapRef.current) return;
    const marker = markersRef.current.get(selectedPlaceName);
    if (marker) {
      marker.openPopup();
      mapRef.current.panTo(marker.getLatLng());
    }
  }, [selectedPlaceName]);

  // Handle directions calculation
  const handleGetDirections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startPoint || !mapRef.current) return;

    const map = mapRef.current;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startPoint)}`);
      const data = await response.json();

      if (!data || data.length === 0) {
        alert("Could not locate that address. Try adding more details like city or area.");
        return;
      }

      const startLat = parseFloat(data[0].lat);
      const startLng = parseFloat(data[0].lon);

      if (routeLineRef.current) routeLineRef.current.remove();
      if (routeStartMarkerRef.current) routeStartMarkerRef.current.remove();

      const pathCoords = [
        [startLat, startLng] as [number, number],
        [latitude, longitude] as [number, number],
      ];

      routeLineRef.current = L.polyline(pathCoords, {
        color: "#D4AF37",
        weight: 5,
        opacity: 0.9,
        dashArray: "10, 10",
      }).addTo(map);

      const startIcon = L.divIcon({
        className: "custom-route-start-pin",
        html: `
          <div class="bg-rose-600 border-2 border-white text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      routeStartMarkerRef.current = L.marker([startLat, startLng], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<b>Start Point: ${data[0].display_name.split(",")[0]}</b>`)
        .openPopup();

      const group = L.featureGroup([routeStartMarkerRef.current, markersRef.current.get("PROPERTY_CENTER")!]);
      map.fitBounds(group.getBounds().pad(0.25));

      const R = 6371;
      const dLat = ((latitude - startLat) * Math.PI) / 180;
      const dLon = ((longitude - startLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startLat * Math.PI) / 180) *
          Math.cos((latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const airDist = R * c;

      const roadDist = (airDist * 1.35).toFixed(1);
      const drivingTime = Math.round(parseFloat(roadDist) * 2.5 + 4);

      setRouteResult({
        distance: `${roadDist} km`,
        duration: `${drivingTime} mins`,
      });
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Failed to connect to location services.");
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-inner">
      {/* Top Overlay: Category Filter & Map Switcher */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Directions Search Input Bar */}
        <div className="bg-white/95 backdrop-blur-md border border-line rounded-2xl p-2 shadow-lg flex-1 min-w-[260px] pointer-events-auto">
          <form onSubmit={handleGetDirections} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 pl-2">
              <span className="text-rose-500 text-xs shrink-0">📍</span>
              <input
                type="text"
                placeholder="Type starting location (e.g. Hebbal)..."
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-accent text-primary text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-xl hover:bg-accent/90 cursor-pointer shrink-0 uppercase"
            >
              Get Directions
            </button>
          </form>

          {routeResult && (
            <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-xs px-2">
              <span className="text-slate-500 font-medium">Est. Drive Route:</span>
              <span className="font-mono font-bold text-accent bg-primary text-secondary px-2 py-0.5 rounded text-[11px]">
                🚗 {routeResult.distance} (~{routeResult.duration})
              </span>
            </div>
          )}
        </div>

        {/* Map View Mode Switcher (Streets vs Satellite) */}
        <div className="bg-white/95 backdrop-blur-md border border-line p-1 rounded-2xl shadow-lg flex items-center gap-1 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={() => setMapType("streets")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
              mapType === "streets" ? "bg-primary text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🗺️ Map
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
              mapType === "satellite" ? "bg-primary text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🛰️ Satellite
          </button>
        </div>
      </div>

      {/* Bottom Category Filter Bar Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-line px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 text-[11px] font-semibold overflow-x-auto max-w-[calc(100%-80px)] no-scrollbar">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider pr-1 hidden sm:inline">Filter Pins:</span>
        {[
          { id: "all", label: "All Pins" },
          { id: "bus", label: "🚌 Bus" },
          { id: "metro", label: "🚇 Metro" },
          { id: "famous", label: "🌟 Famous" },
          { id: "airport", label: "✈️ Airport" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-accent text-primary font-bold shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Map Element Container */}
      <div ref={containerRef} className="w-full h-full min-h-[420px] bg-[#e2dac6] z-10" />
    </div>
  );
}
