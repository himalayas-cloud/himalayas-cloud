"use client";

import React, { useEffect, useRef } from "react";
import { Navigation, ExternalLink, MapPin } from "lucide-react";
import { parseValidCoordinates } from "@/lib/localities";

interface PropertyDetailMapProps {
  coordinates?: [number, number];
  title: string;
  locality: string;
  city: string;
  address?: string;
  price?: number;
}

export default function PropertyDetailMap({
  coordinates,
  title,
  locality,
  city,
  address,
  price,
}: PropertyDetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  const safeCoords = parseValidCoordinates(coordinates, city, locality);
  const [lat, lng] = safeCoords;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return;

    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [lat, lng],
            zoom: 15,
            zoomControl: true,
            attributionControl: false,
            scrollWheelZoom: false,
          });

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
          }).addTo(map);

          // Custom pulsing orange pin for the room
          const customIcon = L.divIcon({
            className: "tenant-detail-pin",
            html: `
              <div style="
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  background: #F26A1B;
                  color: white;
                  width: 38px;
                  height: 38px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 4px 16px rgba(242, 106, 27, 0.5);
                  border: 2.5px solid #ffffff;
                ">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg); display: block;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -38],
          });

          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

          const safeTitle = title || "Room for Rent";
          const safeLocality = locality || city || "Himachal";
          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; min-width: 150px;">
              <div style="font-weight: 800; color: #191E24; margin-bottom: 2px;">${safeTitle}</div>
              <div style="color: #64748B; font-size: 11px; margin-bottom: 4px;">${safeLocality}, ${city || "HP"}</div>
              ${price ? `<div style="font-weight: 800; color: #F26A1B; font-size: 13px;">₹${price.toLocaleString("en-IN")}/mo</div>` : ""}
            </div>
          `;
          marker.bindPopup(popupContent);

          mapInstanceRef.current = map;

          // Leaflet resize recalculation for smooth mobile display
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 300);
        }
      } catch (err) {
        console.warn("PropertyDetailMap initialization error caught:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup error
        }
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, title, locality, city, price]);

  return (
    <div
      style={{
        marginTop: "20px",
        marginBottom: "20px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1.5px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        background: "#FFFFFF",
      }}
    >
      {/* Header with Location & Directions Button */}
      <div
        style={{
          background: "#F8FAFC",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E2E8F0",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--primary-light, #FFF7ED)",
              color: "var(--primary, #F26A1B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={16} />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#191E24" }}>
              Pinpointed Location on Map
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748B" }}>
              {address || `${locality || city}, ${city}, Himachal Pradesh`}
            </div>
          </div>
        </div>

        {/* Directions Link to Google Maps */}
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#EFF6FF",
            color: "#1D4ED8",
            border: "1px solid #BFDBFE",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "0.78rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          title="Open Google Maps for turn-by-turn navigation to this room"
        >
          <Navigation size={13} />
          <span>Get Directions</span>
          <ExternalLink size={12} style={{ opacity: 0.7 }} />
        </a>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "230px",
          background: "#E2E8F0",
        }}
      />

      {/* Map Footer Bar */}
      <div
        style={{
          background: "#F8FAFC",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.74rem",
          color: "#475569",
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <span style={{ fontWeight: 600 }}>
          GPS: {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
        </span>
        <span style={{ color: "#166534", fontWeight: 700 }}>
          Verified Location
        </span>
      </div>
    </div>
  );
}
