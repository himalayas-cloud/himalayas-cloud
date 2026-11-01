"use client";

import React, { useEffect, useRef, useState } from "react";
import { PropertyDetail } from "./PropertyDetailModal";
import { parseValidCoordinates, CITY_BASE_COORDINATES } from "@/lib/localities";
import { X, MapPin, Phone, MessageCircle, ChevronRight } from "lucide-react";

export interface PropertyMapProps {
  properties: PropertyDetail[];
  selectedCity: string;
  selectedProperty: PropertyDetail | null;
  hoveredPropertyId?: string | null;
  panToCoordinate?: [number, number] | null;
  onSelectProperty: (property: PropertyDetail) => void;
  mobileView?: "list" | "map";
  onActivePreviewChange?: (property: PropertyDetail | null) => void;
}

export const CITY_COORDINATES = CITY_BASE_COORDINATES;

export default function PropertyMap({
  properties,
  selectedCity,
  selectedProperty,
  hoveredPropertyId,
  panToCoordinate,
  onSelectProperty,
  mobileView,
  onActivePreviewChange,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePreview, setActivePreview] = useState<PropertyDetail | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      // Ensure container isn't already initialized
      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const defaultCenter = CITY_COORDINATES[selectedCity] || CITY_COORDINATES["Nahan"] || [30.5599, 77.2955];
      const defaultZoom = selectedCity === "All" ? 11 : 13.5;

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

      // Close preview when tapping map background
      map.on("click", () => {
        setActivePreview(null);
        onActivePreviewChange?.(null);
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Ensure tiles load completely on mobile
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
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

  // Invalidate map size when switching between list and map views on mobile
  useEffect(() => {
    if (mapInstanceRef.current && mobileView === "map") {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 120);
    }
  }, [mobileView]);

  // Update center when city changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    try {
      const center = CITY_COORDINATES[selectedCity] || CITY_COORDINATES["Nahan"] || [30.5599, 77.2955];
      const zoom = selectedCity === "All" ? 11 : 13.5;
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    } catch {}
  }, [selectedCity]);

  // Fly to coordinate when searched or clicked
  useEffect(() => {
    if (!mapInstanceRef.current || !panToCoordinate) return;
    try {
      mapInstanceRef.current.flyTo(panToCoordinate, 15, { duration: 1.2 });
    } catch {}
  }, [panToCoordinate]);

  // Center on selected property
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;
    try {
      const exactCoord = parseValidCoordinates(
        selectedProperty.coordinates,
        selectedProperty.city,
        selectedProperty.locality
      );
      if (exactCoord && !isNaN(exactCoord[0]) && !isNaN(exactCoord[1])) {
        mapInstanceRef.current.panTo(exactCoord, { animate: true, duration: 0.8 });
      }
    } catch {}
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
        const isSelected = selectedProperty?.id === prop.id || activePreview?.id === prop.id;

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

        // Clicking a room marker brings up the room popup preview on screen without Leaflet dismiss
        marker.on("click", (e: any) => {
          if (L?.DomEvent) L.DomEvent.stopPropagation(e);
          setActivePreview(prop);
          onActivePreviewChange?.(prop);
          map.panTo([lat, lng], { animate: true, duration: 0.5 });
        });

        markersRef.current[prop.id] = marker;
      });
    }

    updateMarkers();

    return () => {
      isCancelled = true;
    };
  }, [properties, mapLoaded, hoveredPropertyId, selectedProperty, activePreview?.id, onSelectProperty, onActivePreviewChange]);

  return (
    <div className="property-map-wrapper">
      {/* Search as I move the map toggle (Matches Roomster layout) */}
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

      {/* Floating Room Preview Card on Map (Replaces bug-prone Leaflet HTML popups) */}
      {activePreview && (
        <div className="map-floating-preview-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <button
            className="map-preview-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setActivePreview(null);
              onActivePreviewChange?.(null);
            }}
            aria-label="Close preview"
          >
            <X size={15} />
          </button>

          <div
            className="map-preview-body"
            onClick={() => onSelectProperty(activePreview)}
          >
            <div className="map-preview-thumb-wrap">
              <img
                src={activePreview.photos?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"}
                alt={activePreview.title}
                className="map-preview-thumb"
              />
              <span className="map-preview-rent-badge">
                ₹{activePreview.price.toLocaleString("en-IN")}/mo
              </span>
            </div>

            <div className="map-preview-meta">
              <h4 className="map-preview-title">{activePreview.title}</h4>
              <p className="map-preview-loc">
                <MapPin size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "3px" }} />
                {activePreview.locality ? `${activePreview.locality}, ${activePreview.city}` : activePreview.city}
              </p>
              <div className="map-preview-pills">
                <span className="map-preview-pill">{activePreview.type || "Room set"}</span>
                <span className="map-preview-pill">{activePreview.furnished || "Unfurnished"}</span>
              </div>
            </div>
          </div>

          <div className="map-preview-btn-row">
            <button
              type="button"
              className="btn-map-preview-view"
              onClick={() => onSelectProperty(activePreview)}
            >
              <span>View Details</span>
              <ChevronRight size={14} />
            </button>
            <a
              href={`tel:${activePreview.ownerPhone}`}
              className="btn-map-preview-call"
              title="Call Owner"
            >
              <Phone size={14} />
              <span>Call</span>
            </a>
            <a
              href={`https://wa.me/${activePreview.ownerPhone.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20interested%20in%20your%20room%20"${encodeURIComponent(activePreview.title)}"%20on%20Rent%20Himalayas`}
              target="_blank"
              rel="noreferrer"
              className="btn-map-preview-whatsapp"
              title="WhatsApp Owner"
            >
              <MessageCircle size={15} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
