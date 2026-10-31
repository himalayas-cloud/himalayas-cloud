"use client";

import React, { useEffect, useRef, useState } from "react";
import { PropertyDetail } from "./PropertyDetailModal";

interface PropertyMapProps {
  properties: PropertyDetail[];
  selectedCity: string;
  selectedProperty: PropertyDetail | null;
  hoveredPropertyId?: string | null;
  onSelectProperty: (property: PropertyDetail) => void;
}

// Default coordinates for Himachal Pradesh cities
export const CITY_COORDINATES: Record<string, [number, number]> = {
  Solan: [30.9084, 77.0999],
  Nahan: [30.5599, 77.2955],
  Shimla: [31.1048, 77.1734],
  All: [30.8200, 77.2000], // Center between Solan, Nahan, Shimla
};

export default function PropertyMap({
  properties,
  selectedCity,
  selectedProperty,
  hoveredPropertyId,
  onSelectProperty,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      // Ensure container isn't already initialized
      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const defaultCenter = CITY_COORDINATES[selectedCity] || CITY_COORDINATES["All"];
      const defaultZoom = selectedCity === "All" ? 10 : 13;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false, // Custom position or standard
      });

      // Add Zoom Control to Top Right (matches Roomster layout)
      L.control.zoom({ position: "topright" }).addTo(map);

      // Free OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when city changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const center = CITY_COORDINATES[selectedCity] || CITY_COORDINATES["All"];
    const zoom = selectedCity === "All" ? 10 : 13;
    mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
  }, [selectedCity]);

  // Update Markers for properties
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    let isCancelled = false;

    async function updateMarkers() {
      const L = (await import("leaflet")).default;
      if (isCancelled || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker) => {
        map.removeLayer(marker);
      });
      markersRef.current = {};

      properties.forEach((prop, idx) => {
        // Base coordinate from city with slight unique deterministic jitter so multiple rooms in same town don't overlap exactly
        const baseCoord = CITY_COORDINATES[prop.city] || CITY_COORDINATES["Solan"];
        const jitterLat = ((idx * 17) % 11 - 5) * 0.005;
        const jitterLng = ((idx * 23) % 11 - 5) * 0.005;
        const lat = baseCoord[0] + jitterLat;
        const lng = baseCoord[1] + jitterLng;

        const isHovered = hoveredPropertyId === prop.id;
        const isSelected = selectedProperty?.id === prop.id;

        const formattedRent = prop.price >= 1000 ? `₹${(prop.price / 1000).toFixed(0)}k` : `₹${prop.price}`;

        // Custom HTML Price Tag Marker
        const customIcon = L.divIcon({
          className: "custom-map-price-marker",
          html: `
            <div class="map-price-bubble ${isHovered || isSelected ? "active" : ""}">
              <span>${formattedRent}</span>
            </div>
          `,
          iconSize: [54, 28],
          iconAnchor: [27, 28],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Click popup
        const photoUrl = prop.photos?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";
        
        const popupContent = `
          <div class="map-popup-card">
            <div class="map-popup-img" style="background-image: url('${photoUrl}');"></div>
            <div class="map-popup-info">
              <h4 class="map-popup-title">${prop.title}</h4>
              <p class="map-popup-location">📍 ${prop.city} (${prop.locality || "Himachal"})</p>
              <div class="map-popup-bottom">
                <span class="map-popup-price">₹${prop.price.toLocaleString("en-IN")}/mo</span>
                <button class="map-popup-btn" id="btn-popup-${prop.id}">View</button>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: "leaflet-custom-popup",
          maxWidth: 240,
        });

        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-popup-${prop.id}`);
          if (btn) {
            btn.onclick = () => onSelectProperty(prop);
          }
        });

        marker.on("click", () => {
          onSelectProperty(prop);
        });

        markersRef.current[prop.id] = marker;
      });
    }

    updateMarkers();

    return () => {
      isCancelled = true;
    };
  }, [properties, mapLoaded, hoveredPropertyId, selectedProperty, onSelectProperty]);

  return (
    <div className="property-map-wrapper">
      {/* Search as I move the map toggle (Matches Roomster screenshot) */}
      <div className="map-floating-header">
        <label className="search-as-move-toggle">
          <input
            type="checkbox"
            checked={searchAsMove}
            onChange={(e) => setSearchAsMove(e.target.checked)}
          />
          <span className="toggle-checkbox-custom"></span>
          <span className="toggle-text">Search as I move the map</span>
        </label>
      </div>

      {/* The Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="leaflet-map-element" />
    </div>
  );
}
