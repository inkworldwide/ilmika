"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

interface MapProperty {
  id: string;
  title: string;
  price: number;
  transactionType: string;
  latitude: number | null;
  longitude: number | null;
  locality: { name: string };
  city: { name: string };
  images: Array<{ url: string }>;
  bhk: number | null;
}

interface MapComponentProps {
  properties: MapProperty[];
  hoveredPropertyId?: string | null;
}

export default function MapComponent({ properties, hoveredPropertyId }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Find average lat/long to center the map
      const validCoords = properties.filter(p => p.latitude && p.longitude);
      const centerLat = validCoords.length > 0 ? (validCoords.reduce((acc, p) => acc + (p.latitude || 0), 0) / validCoords.length) : 12.9716;
      const centerLng = validCoords.length > 0 ? (validCoords.reduce((acc, p) => acc + (p.longitude || 0), 0) / validCoords.length) : 77.5946;

      mapRef.current = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
      });

      // Add nice clean Mapbox style tiles (via OpenStreetMap CartoDB Voyager which fits the warm cream design system beautifully!)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapRef.current);

      // Add custom zoom controls at top right
      L.control.zoom({ position: "topright" }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    // Filter properties with valid coordinates
    const validProperties = properties.filter(p => p.latitude && p.longitude);

    validProperties.forEach(p => {
      const lat = p.latitude!;
      const lng = p.longitude!;

      const formattedPrice = p.price >= 10000000 
        ? `₹${(p.price / 10000000).toFixed(1)} Cr` 
        : p.price >= 100000 
        ? `₹${(p.price / 100000).toFixed(1)} L` 
        : `₹${(p.price / 1000).toFixed(0)} K`;

      // Custom HTML Marker that looks premium
      const customIcon = L.divIcon({
        className: "custom-price-marker",
        html: `
          <div class="px-2.5 py-1.5 rounded-full bg-primary border border-accent text-accent text-xs font-bold font-mono shadow-md hover:bg-accent hover:text-primary transition duration-200 text-center" style="min-width: 60px;">
            ${formattedPrice}${p.transactionType === "RENT" ? "/m" : ""}
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Bind dynamic premium card popup
      const coverUrl = p.images && p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

      const popupContent = L.DomUtil.create("div", "p-2 w-48 text-left");
      popupContent.innerHTML = `
        <div class="rounded-lg overflow-hidden">
          <img src="${coverUrl}" class="w-full h-24 object-cover" />
          <div class="pt-2">
            <h4 class="font-serif text-xs font-semibold text-slate-800 line-clamp-1">${p.title}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">${p.locality.name}, ${p.city.name}</p>
            <p class="text-xs font-bold text-slate-800 mt-1">${formattedPrice}</p>
            <a href="/properties/${p.id}" class="block text-center mt-2 bg-primary text-secondary text-[10px] font-bold py-1.5 rounded hover:bg-slate-800 transition">View Details</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        minWidth: 200,
      });

      markersRef.current[p.id] = marker;
    });

    // Fit map bounds if there are markers
    if (validProperties.length > 0) {
      const bounds = L.latLngBounds(validProperties.map(p => [p.latitude!, p.longitude!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Keep map alive across renders, just updates markers
    };
  }, [properties]);

  // Effect to highlight hovered property marker
  useEffect(() => {
    if (!mapRef.current || !hoveredPropertyId) return;
    const marker = markersRef.current[hoveredPropertyId];
    if (marker) {
      marker.openPopup();
      mapRef.current.panTo(marker.getLatLng());
    }
  }, [hoveredPropertyId]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] lg:min-h-0 bg-[#e2dac6] z-10" />
  );
}
