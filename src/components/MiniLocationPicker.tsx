"use client";

import React, { useEffect, useRef, useState } from "react";
import { Navigation, Loader2, MapPin, Check, AlertCircle } from "lucide-react";
import { parseValidCoordinates } from "@/lib/localities";

interface MiniLocationPickerProps {
  coordinates: [number, number];
  onCoordinatesChange: (coords: [number, number]) => void;
  localityLabel?: string;
}

export default function MiniLocationPicker({
  coordinates,
  onCoordinatesChange,
  localityLabel,
}: MiniLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const safeCoords = parseValidCoordinates(coordinates, localityLabel);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (isNaN(safeCoords[0]) || isNaN(safeCoords[1])) return;

    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: safeCoords,
            zoom: 15,
            zoomControl: true,
            attributionControl: false,
          });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        // Custom draggable orange house pin
        const customIcon = L.divIcon({
          className: "custom-picker-pin",
          html: `
            <div style="
              background: #F26A1B;
              color: white;
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(242, 106, 27, 0.45);
              border: 2.5px solid #ffffff;
              cursor: grab;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg); display: block;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const marker = L.marker(coordinates, {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        marker.on("dragend", () => {
          const latlng = marker.getLatLng();
          const newCoords: [number, number] = [
            Number(latlng.lat.toFixed(5)),
            Number(latlng.lng.toFixed(5)),
          ];
          onCoordinatesChange(newCoords);
        });

        // Tap or click anywhere on the map to jump the pin to that exact point
        map.on("click", (e) => {
          marker.setLatLng(e.latlng);
          const newCoords: [number, number] = [
            Number(e.latlng.lat.toFixed(5)),
            Number(e.latlng.lng.toFixed(5)),
          ];
          onCoordinatesChange(newCoords);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Force Leaflet recalculation after modal mounts to prevent gray tiles
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
        }
      } catch (err) {
        console.warn("MiniLocationPicker error:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup
        }
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update center & marker position when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      if (!isNaN(safeCoords[0]) && !isNaN(safeCoords[1])) {
        markerRef.current.setLatLng(safeCoords);
        mapInstanceRef.current.flyTo(safeCoords, 16, { duration: 0.6 });
      }
    }
  }, [safeCoords[0], safeCoords[1]]);

  // Pinpoint current device location using HTML5 Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = Number(pos.coords.latitude.toFixed(5));
        const userLng = Number(pos.coords.longitude.toFixed(5));
        const userCoords: [number, number] = [userLat, userLng];

        onCoordinatesChange(userCoords);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng(userCoords);
          mapInstanceRef.current.flyTo(userCoords, 17, { duration: 1.0 });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        setLocateError("Could not detect location. Please tap directly on the map to pinpoint.");
        setTimeout(() => setLocateError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div
      style={{
        marginTop: "10px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1.5px solid #CBD5E1",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        background: "#FFFFFF",
      }}
    >
      {/* Top Action Header */}
      <div
        style={{
          background: "#F8FAFC",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E2E8F0",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#F26A1B",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#191E24" }}>
            Pinpoint on Map
          </span>
          <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
            (Tap map or drag pin to position)
          </span>
        </div>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            color: "#1D4ED8",
            borderRadius: "6px",
            padding: "4px 9px",
            fontSize: "0.74rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: isLocating ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
          title="Use device GPS to drop pin directly at your current location"
        >
          {isLocating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Navigation size={13} />
          )}
          <span>{isLocating ? "Locating..." : "Use My Current Location"}</span>
        </button>
      </div>

      {locateError && (
        <div
          style={{
            background: "#FEF2F2",
            color: "#B91C1C",
            fontSize: "0.74rem",
            padding: "5px 12px",
            borderBottom: "1px solid #FCA5A5",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <AlertCircle size={13} />
          <span>{locateError}</span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "210px",
          background: "#E2E8F0",
          cursor: "crosshair",
        }}
      />

      {/* Footer Info Bar */}
      <div
        style={{
          background: "#F8FAFC",
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.76rem",
          color: "#475569",
          borderTop: "1px solid #E2E8F0",
          flexWrap: "wrap",
          gap: "4px",
        }}
      >
        <span style={{ fontWeight: 600, color: "#1E293B", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <MapPin size={13} color="#F26A1B" />
          <span>GPS: {coordinates[0].toFixed(5)}°N, {coordinates[1].toFixed(5)}°E</span>
        </span>
        <span style={{ color: "#166534", fontWeight: 700, fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <Check size={13} />
          <span>Pin set for listing</span>
        </span>
      </div>
    </div>
  );
}
