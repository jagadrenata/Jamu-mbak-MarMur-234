"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
    { headers: { "Accept-Language": "id" } }
  );
  const data = await res.json();
  const a = data.address ?? {};

  return {
    street: [a.road, a.house_number].filter(Boolean).join(" ") || "",
    village: a.village || a.suburb || a.neighbourhood || "",
    district: a.county || a.city_district || "",
    city: a.city || a.town || a.regency || a.municipality || "",
    province: a.state || "",
    country: a.country || "",
    display_name: data.display_name || "",
  };
}

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function Map({ onSelect, onGeocode, isLoading }) {
  return (
    <div className="rounded overflow-hidden border border-cream-200 relative">
      <MapContainer
        center={[-7.7956, 110.3695]}
        zoom={13}
        className="h-64 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          onSelect={async (latlng) => {
            onSelect?.(latlng);
            if (onGeocode) {
              const result = await reverseGeocode(latlng.lat, latlng.lng);
              onGeocode(result, latlng);
            }
          }}
        />
      </MapContainer>
      {isLoading && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-medium opacity-70">Mengambil lokasi...</span>
        </div>
      )}
    </div>
  );
}
