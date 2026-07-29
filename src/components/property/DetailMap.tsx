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
}

export default function DetailMap({ latitude, longitude, localityName, nearbyPlaces }: DetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);

  // Directions state
  const [startPoint, setStartPoint] = useState("");
  const [routeResult, setRouteResult] = useState<{ distance: string; duration: string } | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeStartMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: false,
      });

      // Use standard high-detail Google Maps tile layer format for the real map look
      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
        maxZoom: 20,
      }).addTo(mapRef.current);

      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    if (!map) return;

    // Clean up existing markers and circles
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (circleRef.current) {
      circleRef.current.remove();
    }
    if (routeLineRef.current) {
      routeLineRef.current.remove();
    }
    if (routeStartMarkerRef.current) {
      routeStartMarkerRef.current.remove();
    }
    setRouteResult(null);

    // Set map center
    map.setView([latitude, longitude], 15);

    // 1. Add gold circle around property coordinates
    circleRef.current = L.circle([latitude, longitude], {
      color: "#D4AF37",
      fillColor: "#D4AF37",
      fillOpacity: 0.12,
      radius: 300, // 300 meters radius
    }).addTo(map);

    // 2. Add property center marker
    const propertyIcon = L.divIcon({
      className: "custom-property-icon pin-property pin-transition",
      html: `<div style="background-color: #D4AF37; color: #1E293B; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #FFF; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 6px rgb(0 0 0 / 0.15);">🏠</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    
    const propMarker = L.marker([latitude, longitude], { icon: propertyIcon })
      .addTo(map)
      .bindPopup(`<b>Property Location</b><br/>Approximate area in ${localityName}`);
    markersRef.current.push(propMarker);

    // 3. Add nearby places markers
    if (nearbyPlaces) {
      nearbyPlaces.forEach((place) => {
        let emoji = "🚌";
        let color = "#0ea5e9";
        let pinClass = "pin-bus";
        
        if (place.type === "metro") {
          emoji = "🚇";
          color = "#8b5cf6";
          pinClass = "pin-metro";
        } else if (place.type === "airport") {
          emoji = "✈️";
          color = "#f43f5e";
          pinClass = "pin-airport";
        } else if (place.type === "famous") {
          emoji = "🌟";
          color = "#10b981"; // Emerald
          pinClass = "pin-famous";
        }

        const icon = L.divIcon({
          className: `custom-nearby-icon-${place.type} ${pinClass} pin-transition`,
          html: `<div style="background-color: ${color}; color: #FFF; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #FFF; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 4px rgb(0 0 0 / 0.15);">${emoji}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker([place.lat, place.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${place.name}</b><br/>${place.distance} | ${place.time}`);
        markersRef.current.push(marker);
      });
    }

  }, [latitude, longitude, localityName, nearbyPlaces]);

  // Handle directions submission
  const handleGetDirections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startPoint || !mapRef.current) return;

    const map = mapRef.current;

    // Clear old route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
    }
    
    
    try {
      // 1. Geocode the user's input using the free Nominatim API
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startPoint)}`);
      const data = await response.json();

      if (!data || data.length === 0) {
        alert("Could not locate that exact address. Try adding more details like city or area.");
        return;
      }

      // Use the most relevant result
      const startLat = parseFloat(data[0].lat);
      const startLng = parseFloat(data[0].lon);

      // Clean up previous routes
      if (routeLineRef.current) routeLineRef.current.remove();
      if (routeStartMarkerRef.current) routeStartMarkerRef.current.remove();

      // Draw route line
      const pathCoords = [
        [startLat, startLng] as [number, number],
        [latitude, longitude] as [number, number]
      ];

      routeLineRef.current = L.polyline(pathCoords, {
        color: "#0ea5e9",
        weight: 5,
        opacity: 0.85,
        dashArray: "8, 8"
      }).addTo(map);

      // Draw start marker
      const startIcon = L.divIcon({
        className: "custom-start-icon pin-start pin-transition",
        html: `<div style="background-color: #ef4444; color: #FFF; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid #FFF; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 6px rgb(0 0 0 / 0.15);">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      routeStartMarkerRef.current = L.marker([startLat, startLng], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<b>Start Point: ${data[0].display_name.split(",")[0]}</b>`)
        .openPopup();

      // Fit bounds to show both markers
      const group = L.featureGroup([routeStartMarkerRef.current, markersRef.current[0]]);
      map.fitBounds(group.getBounds().pad(0.2));

      // Calculate straight-line distance in km
      const R = 6371; // Earth's radius in km
      const dLat = (latitude - startLat) * Math.PI / 180;
      const dLon = (longitude - startLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(startLat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const airDist = R * c;
      
      // Estimate realistic road distance and driving duration
      const roadDist = (airDist * 1.35).toFixed(1);
      const drivingTime = Math.round(parseFloat(roadDist) * 2.5 + 4);

      setRouteResult({
        distance: `${roadDist} km`,
        duration: `${drivingTime} mins`
      });
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Failed to connect to location services.");
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px]">
      {/* Self-contained CSS for smooth pulses and hover feedback */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes custom-pulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        @keyframes pulse-sky {
          0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(14, 165, 233, 0); }
          100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
        }
        @keyframes pulse-purple {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes pulse-emerald {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes pulse-rose {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .pin-property { animation: custom-pulse 2s infinite ease-in-out; border-radius: 50%; }
        .pin-bus { animation: pulse-sky 2.2s infinite ease-in-out; border-radius: 50%; }
        .pin-metro { animation: pulse-purple 2.4s infinite ease-in-out; border-radius: 50%; }
        .pin-famous { animation: pulse-emerald 2.1s infinite ease-in-out; border-radius: 50%; }
        .pin-airport { animation: pulse-rose 2.6s infinite ease-in-out; border-radius: 50%; }
        .pin-transition { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .pin-transition:hover { transform: scale(1.3) !important; z-index: 99999 !important; }
      ` }} />

      {/* Directions Search Panel overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-line max-w-md">
        <form onSubmit={handleGetDirections} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-rose-500 text-sm shrink-0">📍</span>
            <input 
              type="text" 
              placeholder="Type starting location (e.g. Hebbal, Koramangala)" 
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              required
              className="w-full text-xs font-medium text-slate-700 bg-transparent border-0 outline-0 focus:ring-0 focus:outline-none placeholder-slate-400"
            />
          </div>
          <button 
            type="submit"
            className="bg-accent text-primary text-[10px] font-bold font-mono tracking-wider px-3.5 py-2 rounded-xl transition hover:opacity-90 active:scale-95 cursor-pointer shrink-0 uppercase"
          >
            Get Directions
          </button>
        </form>

        {routeResult && (
          <div className="mt-2.5 pt-2.5 border-t border-line/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Est. Route:</span>
            <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              🚗 {routeResult.distance} ({routeResult.duration})
            </span>
          </div>
        )}
      </div>

      <div ref={containerRef} className="w-full h-full min-h-[350px] bg-[#e2dac6] z-10" />
    </div>
  );
}
