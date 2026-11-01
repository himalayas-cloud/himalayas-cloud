"use client";

import React, { useEffect, useRef, useState } from "react";
import { PropertyDetail } from "./PropertyDetailModal";
import { getCoordinatesForLocality, parseValidCoordinates, CITY_BASE_COORDINATES } from "@/lib/localities";

export interface PropertyMapProps {
  properties: PropertyDetail[];
  selectedCity: string;
  selectedProperty: PropertyDetail | null;
  hoveredPropertyId?: string | null;
  panToCoordinate?: [number, number] | null;
  onSelectProperty: (property: PropertyDetail) => void;
}

export const CITY_COORDINATES = CITY_BASE_COORDINATES;

export default function PropertyMap({
  properties,
  selectedCity,
  selectedProperty,
  hoveredPropertyId,
  panToCoordinate,
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
        zoomControl: false,
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

  // Fly to coordinate when searched or clicked
  useEffect(() => {
    if (!mapInstanceRef.current || !panToCoordinate) return;
    mapInstanceRef.current.flyTo(panToCoordinate, 15, { duration: 1.2 });
  }, [panToCoordinate]);

  // Center on selected property
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;
    const exactCoord = parseValidCoordinates(
      selectedProperty.coordinates,
      selectedProperty.city,
      selectedProperty.locality
    );
    if (exactCoord && !isNaN(exactCoord[0]) && !isNaN(exactCoord[1])) {
      mapInstanceRef.current.flyTo(exactCoord, 15, { duration: 1.0 });
    }
  }, [selectedProperty]);

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
        // Resolve exact geographical coordinates with zero NaN risk
        const exactCoord = parseValidCoordinates(prop.coordinates, prop.city, prop.locality);
        const microJitterLat = ((idx % 3) - 1) * 0.0006;
        const microJitterLng = (((idx + 1) % 3) - 1) * 0.0006;
        const lat = exactCoord[0] + microJitterLat;
        const lng = exactCoord[1] + microJitterLng;

        if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return;

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
              <p class="map-popup-location">${prop.locality ? `${prop.locality}, ${prop.city}` : prop.city}</p>
              <div class="map-popup-bottom">
                <span class="map-popup-price">₹${prop.price.toLocaleString("en-IN")}/mo</span>
                <button class="map-popup-btn" id="btn-popup-${prop.id}">View Details</button>
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
