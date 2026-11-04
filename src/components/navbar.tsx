"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronDown, PlusCircle } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";

export type NavbarProps = {
  isLoading?: boolean;
  isLoggedIn: boolean;
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  selectedCity: string; // "All" shows "Himachal (All)"
  onHostClick: () => void;
  onLocationClick: () => void;
  onProfileClick: () => void;
  onLoginClick: () => void;
};

export default function Navbar({
  isLoading,
  isLoggedIn,
  photoURL,
  displayName,
  email,
  selectedCity,
  onHostClick,
  onLocationClick,
  onProfileClick,
  onLoginClick,
}: NavbarProps) {
  return (
    <header className="app-header">
      {/* Brand */}
      <div className="header-brand-wrap">
        <Link
          href="/"
          className="brand-logo"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/logo.png"
              alt="Rent Himalayas Logo"
              width={36}
              height={36}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#191E24",
              letterSpacing: "-0.02em",
            }}
          >
            Rent<span style={{ color: "var(--primary)" }}>Himalayas</span>
          </span>
        </Link>
      </div>

      {/* Action buttons */}
      <div className="header-nav-actions">
        <button
          className="btn-host-navbar"
          onClick={onHostClick}
          title="List your room, flat, PG or hostel in Himachal"
        >
          <PlusCircle size={16} />
          <span>Rent Your Room</span>
        </button>

        <div
          className="location-pill"
          onClick={onLocationClick}
          title="Select location"
        >
          <MapPin size={16} className="text-primary" />
          <span className="location-pill-text">
            {selectedCity === "All" ? "Himachal (All)" : selectedCity}
          </span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Profile icon, far right corner */}
      <ProfileAvatar
        isLoading={isLoading}
        isLoggedIn={isLoggedIn}
        photoURL={photoURL}
        displayName={displayName}
        email={email}
        onAvatarClick={onProfileClick}
        onLoginClick={onLoginClick}
      />
    </header>
  );
}

