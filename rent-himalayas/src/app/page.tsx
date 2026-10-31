"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Search,
  User as UserIcon,
  X,
  Phone,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ChevronDown,
  CheckCircle,
  MessageCircle,
  PlusCircle,
  Home,
  LayoutGrid,
  Map as MapIcon,
  List as ListIcon,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { ConfirmationResult } from "firebase/auth";
import OwnerDashboardModal from "@/components/OwnerDashboardModal";
import PropertyDetailModal, { PropertyDetail } from "@/components/PropertyDetailModal";
import { subscribePublishedProperties } from "@/lib/properties";
import { searchLocalities, getCoordinatesForLocality, HIMACHAL_LOCALITIES, parseValidCoordinates } from "@/lib/localities";

// Dynamic import of Leaflet PropertyMap for SSR safety
const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F1F5F9",
        color: "#64748B",
        fontWeight: 600,
        fontSize: "0.95rem",
      }}
    >
      <span>🗺️ Loading Himalayan Map...</span>
    </div>
  ),
});

export interface Property extends PropertyDetail {
  area?: number;
}

const DUMMY_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "2BHK Set Near Ranital Garden",
    price: 15000,
    area: 1200,
    furnished: "No Furnished",
    city: "Nahan",
    locality: "Ranital",
    address: "Near Historic Ranital Lake & Garden, Nahan",
    coordinates: [30.5578, 77.2974],
    ownerName: "Vishal Kumar",
    ownerPhone: "+91 98160 12345",
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    ],
    type: "2 Room set",
    description: "Spacious 2BHK room set with natural mountain light, wide balcony, modern kitchen setup, and 24-hour clean water supply. Walking distance from main market and Ranital Garden.",
  },
  {
    id: "prop-2",
    title: "Independent 2BHK Near Gunnu Ghat",
    price: 18000,
    area: 1500,
    furnished: "Semi-Furnished",
    city: "Nahan",
    locality: "Gunnu Ghat",
    address: "Gunnu Ghat Bazar, Near Delhi Gate, Nahan",
    coordinates: [30.5585, 77.2940],
    ownerName: "Kishan Gupta",
    ownerPhone: "+91 98170 54321",
    photos: [
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    type: "2 Room set",
    description: "Premium independent room set in a peaceful neighborhood. Separate entrance, car parking space, geyser installed, and scenic views of the Shivalik hills.",
  },
  {
    id: "prop-3",
    title: "Modern 1BHK in Chambaghat",
    price: 12000,
    area: 800,
    furnished: "No Furnished",
    city: "Solan",
    locality: "Chambaghat",
    address: "Near Mushroom City & NH, Chambaghat, Solan",
    coordinates: [30.9230, 77.1080],
    ownerName: "Anjali Sharma",
    ownerPhone: "+91 98050 98765",
    photos: [
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ],
    type: "1 Room set",
    description: "Newly constructed 1 room set right near Chambaghat, Solan. Very convenient for working professionals or small family. High speed internet connectivity available.",
  },
  {
    id: "prop-4",
    title: "Cozy Studio 1RK in Lakkar Bazaar",
    price: 9500,
    area: 550,
    furnished: "Furnished",
    city: "Shimla",
    locality: "Lakkar Bazaar",
    address: "Near The Ridge & Lakkar Bazaar, Shimla",
    coordinates: [31.1070, 77.1755],
    ownerName: "Rohit Verma",
    ownerPhone: "+91 98820 11223",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
    ],
    type: "1 Room set",
    description: "Warm wooden-finished studio room set overlooking pine valleys. 10 minutes walk from The Ridge. Fully furnished with bed, wardrobe, heater, and geyser.",
  },
];

export default function HomePage() {
  const {
    user,
    profile,
    loading,
    authError,
    clearError,
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    setupRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
    logout,
    updateDisplayName,
    testAdminPrivilegeEscalation,
  } = useAuth();

  // Navigation & Filter state
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchLocalityDropdown, setShowSearchLocalityDropdown] = useState(false);
  const [panToCoordinate, setPanToCoordinate] = useState<[number, number] | null>(null);

  // Popover state for interactive buttons
  const [openPopover, setOpenPopover] = useState<"budget" | "type" | "furnishing" | null>(null);

  // Filter values
  const [typeFilter, setTypeFilter] = useState("all");
  const [furnishingFilter, setFurnishingFilter] = useState("all");

  // Budget slider state (Exact match to Roomster screenshot)
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(25000);
  const [isBudgetApplied, setIsBudgetApplied] = useState(false);

  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"email" | "phone">("email");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<Property | null>(null);
  const [firestoreProperties, setFirestoreProperties] = useState<Property[]>([]);

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState("+91 99999 99999");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Security test feedback
  const [securityTestResult, setSecurityTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Edit name in profile
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (profile?.displayName) {
      setEditName(profile.displayName);
    }
  }, [profile]);

  // Subscribe to live published properties from Firestore
  useEffect(() => {
    const unsubscribe = subscribePublishedProperties((listings) => {
      const formatted: Property[] = listings.map((l) => ({
        id: l.id || `fs-${Math.random()}`,
        title: l.title,
        price: l.monthlyRent,
        area: l.areaSqft || 900,
        furnished: l.furnished || "No Furnished",
        city: (l.city as "Solan" | "Nahan" | "Shimla") || "Solan",
        locality: l.locality,
        address: l.addressApprox || `${l.locality}, ${l.city}`,
        ownerName: l.ownerName,
        ownerPhone: l.ownerPhone,
        photos:
          l.photos && l.photos.length > 0
            ? l.photos
            : [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
              ],
        type: (l.propertyType as any) || "1 Room set",
        description: l.description,
        status: l.status,
        coordinates: parseValidCoordinates(l.coordinates, l.city, l.locality),
      }));
      setFirestoreProperties(formatted);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAuth = () => {
    clearError();
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
    clearError();
    setOtpSent(false);
    setConfirmationResult(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      handleCloseAuth();
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      handleCloseAuth();
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const verifier = setupRecaptcha("recaptcha-container");
      const confirmation = await sendPhoneOtp(phoneNumber, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    try {
      await verifyPhoneOtp(confirmationResult, otpCode);
      handleCloseAuth();
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setIsSavingName(true);
    try {
      await updateDisplayName(editName);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleRunSecurityTest = async () => {
    setSecurityTestResult(null);
    const res = await testAdminPrivilegeEscalation();
    setSecurityTestResult(res);
  };

  // Combine live Firestore listings with starter dummy properties (avoiding duplicates)
  const combinedProperties = [
    ...firestoreProperties,
    ...DUMMY_PROPERTIES.filter(
      (dummy) => !firestoreProperties.some((fp) => fp.title === dummy.title)
    ),
  ];

  // Filter properties
  const filteredProperties = combinedProperties.filter((prop) => {
    if (selectedCity !== "All" && prop.city !== selectedCity) return false;
    if (
      searchQuery &&
      !prop.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(prop.address || prop.locality || "").toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (typeFilter !== "all" && prop.type !== typeFilter) return false;
    
    // Budget filter with slider values
    if (isBudgetApplied) {
      if (prop.price < minBudget || prop.price > maxBudget) return false;
    }

    if (
      furnishingFilter === "no-furnished" &&
      (prop.furnished === "Yes" ||
        prop.furnished === "Furnished" ||
        prop.furnished === "Semi" ||
        prop.furnished === "Semi-Furnished")
    ) {
      return false;
    }
    if (
      furnishingFilter === "semi" &&
      prop.furnished !== "Semi" &&
      prop.furnished !== "Semi-Furnished"
    ) {
      return false;
    }
    if (
      furnishingFilter === "furnished" &&
      prop.furnished !== "Yes" &&
      prop.furnished !== "Furnished"
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="app-container">
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container"></div>

      {/* 1. Header with updated Logo */}
      <header className="app-header">
        <div className="logo-group">
          <a
            href="#"
            className="brand-logo"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}
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
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#191E24", letterSpacing: "-0.02em" }}>
              Rent<span style={{ color: "var(--primary)" }}>Himalayas</span>
            </span>
          </a>

          {/* City Switcher Pill */}
          <div
            className="location-pill"
            onClick={() => {
              const cities = ["All", "Solan", "Nahan", "Shimla"];
              const nextIdx = (cities.indexOf(selectedCity) + 1) % cities.length;
              setSelectedCity(cities[nextIdx]);
              setPanToCoordinate(null);
            }}
          >
            <MapPin size={16} className="text-primary" />
            <span>{selectedCity === "All" ? "Himachal (All)" : selectedCity}</span>
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="header-actions">
          {/* Become a Host / Rent Your Room button */}
          <button
            className="btn-host-navbar"
            onClick={() => {
              if (!user) {
                handleOpenAuth();
              } else {
                setIsOwnerDashboardOpen(true);
              }
            }}
            title="List your room, flat, or PG in Himachal"
          >
            <PlusCircle size={16} />
            <span>Rent Your Room</span>
          </button>

          {loading ? (
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
              Loading...
            </span>
          ) : user ? (
            <div
              className="user-badge-pill"
              onClick={() => setIsProfileModalOpen(true)}
              title="Click to view Firestore Profile & Security Info"
            >
              <div className="user-avatar-circle">
                {profile?.displayName
                  ? profile.displayName.charAt(0).toUpperCase()
                  : user.email
                  ? user.email.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#191E24" }}>
                {profile?.displayName || user.email?.split("@")[0] || user.phoneNumber || "My Account"}
              </span>
            </div>
          ) : (
            <button className="btn-header-auth" onClick={handleOpenAuth}>
              <UserIcon size={18} />
              <span>Login/SignUp</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Roomster-Style Split-Screen Marketplace Layout */}
      {/* On desktop: Left listings scroll independently; right Map stays completely fixed */}
      <main className="split-marketplace-layout">
        {/* Left Scrollable Listings Pane */}
        <section className={`split-left-pane ${mobileView === "map" ? "hidden-on-mobile" : ""}`}>
          {/* Breadcrumbs */}
          <nav className="roomster-breadcrumb" aria-label="Breadcrumb">
            <Home size={15} />
            <span>&gt;</span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedCity("All");
                setPanToCoordinate(null);
              }}
              title="View all Himachal Pradesh"
            >
              Himachal Pradesh
            </span>
            <span>&gt;</span>
            <span>{selectedCity === "All" ? "All Cities" : selectedCity}</span>
          </nav>

          {/* Heading */}
          <h1 className="roomster-heading">
            Rooms for Rent in {selectedCity === "All" ? "Himachal Pradesh" : `${selectedCity}, HP`}
          </h1>

          {/* Interactive Filter Bar (Grid, A Room, Budget Slider Popup, Furnishing, Locality Search) */}
          <div className="roomster-filters-bar">
            {/* Grid Button */}
            <button className="roomster-filter-btn active" title="Grid View">
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>

            {/* Room Type Button with Animated Dropdown */}
            <div className="filter-popover-anchor">
              <button
                type="button"
                className={`roomster-filter-btn ${typeFilter !== "all" ? "active" : ""} ${openPopover === "type" ? "is-open" : ""}`}
                onClick={() => setOpenPopover(openPopover === "type" ? null : "type")}
                title="Select Room Type"
              >
                <span>{typeFilter === "all" ? "A room" : typeFilter}</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: openPopover === "type" ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
                {typeFilter !== "all" && <span className="filter-active-dot" />}
              </button>

              {openPopover === "type" && (
                <>
                  <div className="popover-backdrop-layer" onClick={() => setOpenPopover(null)} />
                  <div className="filter-dropdown-card">
                    {[
                      { label: "All Room Types", value: "all" },
                      { label: "1 Room set", value: "1 Room set" },
                      { label: "2 Room set", value: "2 Room set" },
                      { label: "3 room set", value: "3 room set" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={`filter-dropdown-item ${typeFilter === opt.value ? "selected" : ""}`}
                        onClick={() => {
                          setTypeFilter(opt.value);
                          setOpenPopover(null);
                        }}
                      >
                        <span>{opt.label}</span>
                        {typeFilter === opt.value && <Check size={14} color="var(--primary)" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Budget Button with Slider Popup (Exact match to screenshot) */}
            <div className="filter-popover-anchor">
              <button
                type="button"
                className={`roomster-filter-btn ${isBudgetApplied ? "active" : ""} ${openPopover === "budget" ? "is-open" : ""}`}
                onClick={() => setOpenPopover(openPopover === "budget" ? null : "budget")}
                title="Filter by Monthly Budget"
              >
                <span>
                  {isBudgetApplied ? `₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}` : "Budget"}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: openPopover === "budget" ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
                {isBudgetApplied && <span className="filter-active-dot" />}
              </button>

              {openPopover === "budget" && (
                <>
                  <div className="popover-backdrop-layer" onClick={() => setOpenPopover(null)} />
                  <div className="budget-popup-card">
                    <div className="budget-popup-header">
                      <span className="budget-popup-title">Select budget</span>
                      <button
                        type="button"
                        className="budget-popup-close-btn"
                        onClick={() => setOpenPopover(null)}
                        title="Close budget popup"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Dual Inputs Row: Min and Max */}
                    <div className="budget-inputs-row">
                      <div className="budget-input-wrapper">
                        <input
                          type="number"
                          className="budget-input-field"
                          value={minBudget}
                          onChange={(e) => setMinBudget(Math.max(0, Number(e.target.value)))}
                          placeholder="0"
                        />
                      </div>
                      <span className="budget-input-separator">–</span>
                      <div className="budget-input-wrapper">
                        <input
                          type="number"
                          className="budget-input-field"
                          value={maxBudget}
                          onChange={(e) => setMaxBudget(Number(e.target.value))}
                          placeholder="5000"
                        />
                      </div>
                    </div>

                    {/* Green Range Slider matching screenshot */}
                    <div className="budget-slider-track-wrap">
                      <input
                        type="range"
                        min="1000"
                        max="35000"
                        step="500"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="budget-range-slider"
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                        <span>₹1k</span>
                        <span>₹15k</span>
                        <span>₹35k+</span>
                      </div>
                    </div>

                    {/* Quick Budget Chips */}
                    <div className="budget-preset-chips">
                      {[
                        { label: "Under ₹5k", min: 0, max: 5000 },
                        { label: "₹5k - ₹10k", min: 5000, max: 10000 },
                        { label: "₹10k - ₹15k", min: 10000, max: 15000 },
                        { label: "₹15k - ₹25k", min: 15000, max: 25000 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className={`budget-preset-btn ${minBudget === preset.min && maxBudget === preset.max ? "selected" : ""}`}
                          onClick={() => {
                            setMinBudget(preset.min);
                            setMaxBudget(preset.max);
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Footer: Clear and Show results */}
                    <div className="budget-popup-footer">
                      <button
                        type="button"
                        className="budget-clear-btn"
                        onClick={() => {
                          setMinBudget(0);
                          setMaxBudget(25000);
                          setIsBudgetApplied(false);
                          setOpenPopover(null);
                        }}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="budget-show-results-btn"
                        onClick={() => {
                          setIsBudgetApplied(true);
                          setOpenPopover(null);
                        }}
                      >
                        Show results
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Furnishing Button with Animated Dropdown */}
            <div className="filter-popover-anchor">
              <button
                type="button"
                className={`roomster-filter-btn ${furnishingFilter !== "all" ? "active" : ""} ${openPopover === "furnishing" ? "is-open" : ""}`}
                onClick={() => setOpenPopover(openPopover === "furnishing" ? null : "furnishing")}
                title="Filter by Furnishing"
              >
                <span>
                  {furnishingFilter === "all"
                    ? "Furnishing"
                    : furnishingFilter === "no-furnished"
                    ? "No Furnished"
                    : furnishingFilter === "semi"
                    ? "Semi-Furnished"
                    : "Furnished"}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: openPopover === "furnishing" ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
                {furnishingFilter !== "all" && <span className="filter-active-dot" />}
              </button>

              {openPopover === "furnishing" && (
                <>
                  <div className="popover-backdrop-layer" onClick={() => setOpenPopover(null)} />
                  <div className="filter-dropdown-card">
                    {[
                      { label: "All Furnishing", value: "all" },
                      { label: "No Furnished (Default)", value: "no-furnished" },
                      { label: "Semi-Furnished", value: "semi" },
                      { label: "Furnished", value: "furnished" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={`filter-dropdown-item ${furnishingFilter === opt.value ? "selected" : ""}`}
                        onClick={() => {
                          setFurnishingFilter(opt.value);
                          setOpenPopover(null);
                        }}
                      >
                        <span>{opt.label}</span>
                        {furnishingFilter === opt.value && <Check size={14} color="var(--primary)" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Locality Search with Autocomplete Dropdown & Map Fly */}
            <div className="filter-search-box">
              <Search size={14} color="#64748B" />
              <input
                type="text"
                placeholder="Search area (e.g. Ranital)..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setShowSearchLocalityDropdown(val.trim().length > 0);
                  const match = getCoordinatesForLocality(val, selectedCity);
                  if (match) setPanToCoordinate(match);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setShowSearchLocalityDropdown(true);
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchLocalityDropdown(false);
                    setPanToCoordinate(null);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  title="Clear search"
                >
                  <X size={12} color="#94A3B8" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {showSearchLocalityDropdown && (
                <>
                  <div className="popover-backdrop-layer" onClick={() => setShowSearchLocalityDropdown(false)} />
                  <div className="search-locality-dropdown">
                    <div style={{ padding: "6px 10px", fontSize: "0.72rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
                      Suggested Localities & Landmark Pins
                    </div>
                    {searchLocalities(searchQuery, selectedCity).slice(0, 7).map((loc) => (
                      <div
                        key={loc.id}
                        className="search-locality-item"
                        onClick={() => {
                          setSearchQuery(loc.name);
                          setSelectedCity(loc.city);
                          setPanToCoordinate(loc.coordinates);
                          setShowSearchLocalityDropdown(false);
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#FFF7ED",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <MapPin size={13} color="var(--primary)" />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#191E24" }}>
                            {loc.name}, <span style={{ color: "#64748B", fontWeight: 500 }}>{loc.city}</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            {loc.category} • Fly map here
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subheader: Listing count */}
          <div className="rooms-subhead-row">
            <div className="rooms-count-label">
              {filteredProperties.length} Rooms For Rent
            </div>
          </div>

          {/* Cards Grid (scrolls independently) */}
          <div className="split-listings-grid">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="property-card"
                onClick={() => setSelectedPropertyForDetail(property)}
                onMouseEnter={() => setHoveredPropertyId(property.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
                style={{
                  cursor: "pointer",
                  borderColor: hoveredPropertyId === property.id ? "var(--primary)" : undefined,
                  boxShadow:
                    hoveredPropertyId === property.id
                      ? "0 8px 24px rgba(242, 106, 27, 0.2)"
                      : undefined,
                }}
              >
                <div className="property-img-wrapper">
                  <Image
                    src={
                      property.photos[0] ||
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={property.title}
                    className="property-img"
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                  <span className="property-badge">{property.city}</span>

                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#166534",
                      color: "#FFFFFF",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "4px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    NEW
                  </span>

                  {property.photos && property.photos.length > 1 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        background: "rgba(15, 23, 42, 0.75)",
                        backdropFilter: "blur(4px)",
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "999px",
                      }}
                    >
                      📷 {property.photos.length}
                    </span>
                  )}
                </div>

                <div className="property-info" style={{ padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      <UserIcon size={12} />
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>
                      {property.ownerName}
                    </span>
                  </div>

                  <h3
                    className="property-title"
                    style={{
                      fontSize: "1rem",
                      marginBottom: "4px",
                      color: hoveredPropertyId === property.id ? "var(--primary)" : undefined,
                    }}
                  >
                    {property.title}
                  </h3>

                  <p className="property-details" style={{ fontSize: "0.82rem", margin: "4px 0" }}>
                    Price: <strong>₹{property.price.toLocaleString("en-IN")}/mo</strong> •{" "}
                    <strong>
                      {property.furnished === "Yes" || property.furnished === "Furnished"
                        ? "Furnished"
                        : property.furnished === "Semi" || property.furnished === "Semi-Furnished"
                        ? "Semi-Furnished"
                        : "No Furnished"}
                    </strong>
                  </p>

                  <p className="property-address" style={{ fontSize: "0.78rem", marginBottom: "12px" }}>
                    {property.locality ? `${property.locality}, ${property.city}` : property.address}
                  </p>

                  <div className="property-footer" style={{ paddingTop: "8px" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 700 }}>
                      {property.type}
                    </span>
                    <button
                      className="btn-contact"
                      style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPropertyForDetail(property);
                      }}
                    >
                      View & Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px dashed #CBD5E1",
                margin: "20px 0",
              }}
            >
              <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#191E24", marginBottom: "6px" }}>
                No rooms match your search filters in {selectedCity}
              </p>
              <p style={{ fontSize: "0.88rem", color: "#64748B", marginBottom: "16px" }}>
                Try adjusting your budget or clearing room type filters.
              </p>
              <button
                className="btn-secondary"
                style={{ width: "auto", display: "inline-flex", margin: "0 auto" }}
                onClick={() => {
                  setSelectedCity("All");
                  setSearchQuery("");
                  setTypeFilter("all");
                  setIsBudgetApplied(false);
                  setMinBudget(0);
                  setMaxBudget(25000);
                  setFurnishingFilter("all");
                  setPanToCoordinate(null);
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Bottom attribution/copyright inside left scroll */}
          <div style={{ marginTop: "32px", padding: "16px 0", borderTop: "1px solid #E2E8F0", textAlign: "center", fontSize: "0.8rem", color: "#94A3B8" }}>
            <p>© 2026 RentHimalayas • Solan • Nahan • Shimla</p>
          </div>
        </section>

        {/* Right Fixed / Sticky Map Pane */}
        <section className={`split-right-pane ${mobileView === "list" ? "hidden-on-mobile" : ""}`}>
          <PropertyMap
            properties={filteredProperties}
            selectedCity={selectedCity}
            selectedProperty={selectedPropertyForDetail}
            hoveredPropertyId={hoveredPropertyId}
            panToCoordinate={panToCoordinate}
            onSelectProperty={(p) => setSelectedPropertyForDetail(p as Property)}
          />
        </section>
      </main>

      {/* Mobile Floating Toggle (List vs Map) */}
      <div className="mobile-view-toggle-bar">
        <button
          className={`mobile-view-toggle-btn ${mobileView === "list" ? "active" : ""}`}
          onClick={() => setMobileView("list")}
        >
          <ListIcon size={16} />
          <span>List ({filteredProperties.length})</span>
        </button>
        <button
          className={`mobile-view-toggle-btn ${mobileView === "map" ? "active" : ""}`}
          onClick={() => setMobileView("map")}
        >
          <MapIcon size={16} />
          <span>Map</span>
        </button>
      </div>

      {/* AUTH MODAL */}
      {isAuthModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={handleCloseAuth}>
          <div
            className="modal-dialog animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={handleCloseAuth}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
              {authTab === "email"
                ? isSignUp
                  ? "Create Your Account"
                  : "Welcome Back"
                : "Phone Verification"}
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              Access verified rentals and direct owner contacts in Himachal.
            </p>

            {/* Provider Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab-btn ${authTab === "email" ? "active" : ""}`}
                onClick={() => {
                  setAuthTab("email");
                  clearError();
                }}
              >
                Email / Password
              </button>
              <button
                className={`auth-tab-btn ${authTab === "phone" ? "active" : ""}`}
                onClick={() => {
                  setAuthTab("phone");
                  clearError();
                }}
              >
                Phone OTP
              </button>
            </div>

            {authError && <div className="alert-error">{authError}</div>}

            {/* TAB 1: EMAIL / PASSWORD */}
            {authTab === "email" && (
              <form onSubmit={handleEmailAuth}>
                {isSignUp && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Vishal Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </button>

                <div style={{ textAlign: "center", marginTop: "14px", fontSize: "0.88rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  </span>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      clearError();
                    }}
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PHONE OTP */}
            {authTab === "phone" && (
              <div>
                <div className="alert-info">
                  <strong>💡 Tip for Development:</strong> Firebase Spark tier has a strict SMS limit.
                  Use your configured test number <code>+91 99999 99999</code> with code <code>123456</code> for instant, quota-free login!
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                      <label className="form-label">Phone Number (with country code)</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+91 99999 99999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send Verification Code"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="form-group">
                      <label className="form-label">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="123456"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: "10px" }}
                      onClick={() => setOtpSent(false)}
                    >
                      Change Phone Number
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="auth-divider">Or continue with</div>

            {/* GOOGLE SIGN IN */}
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}

      {/* USER PROFILE & FIRESTORE SECURITY CONSOLE MODAL */}
      {isProfileModalOpen && user && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsProfileModalOpen(false)}>
          <div
            className="modal-dialog animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "520px" }}
          >
            <button className="modal-close-btn" onClick={() => setIsProfileModalOpen(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "4px" }}>
              My Profile & Security Info
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Live record from Cloud Firestore (<code>users/{user.uid}</code>).
            </p>

            <div className="profile-card">
              <div className="profile-field-row">
                <span className="profile-field-label">Firebase UID</span>
                <span className="profile-field-value" style={{ fontSize: "0.78rem" }}>
                  {user.uid}
                </span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Email</span>
                <span className="profile-field-value">{user.email || "Not linked"}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Phone</span>
                <span className="profile-field-value">{user.phoneNumber || "Not linked"}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">System Role</span>
                <span className="profile-field-value">
                  <span className={`security-badge ${profile?.role || "user"}`}>
                    {profile?.role || "user"}
                  </span>
                </span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Auth Provider</span>
                <span className="profile-field-value">
                  {user.providerData.map((p) => p.providerId).join(", ") || "Phone/Custom"}
                </span>
              </div>
            </div>

            {/* Editable Profile Name */}
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                />
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "auto", padding: "8px 16px", whiteSpace: "nowrap" }}
                  onClick={handleSaveName}
                  disabled={isSavingName}
                >
                  {isSavingName ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* SECURITY RULE VERIFICATION SECTION */}
            <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span>Security Rules Verification</span>
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                Click below to simulate a malicious client trying to escalate their role to <code>admin</code>. Firestore Security Rules should actively reject this write.
              </p>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleRunSecurityTest}
                style={{ fontSize: "0.85rem", marginBottom: "12px" }}
              >
                ⚡ Test Security: Attempt Admin Escalation
              </button>

              {securityTestResult && (
                <div className={securityTestResult.success ? "alert-success" : "alert-error"}>
                  {securityTestResult.success ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <CheckCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{securityTestResult.message}</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{securityTestResult.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="btn-danger"
                onClick={async () => {
                  await logout();
                  setIsProfileModalOpen(false);
                }}
              >
                <LogOut size={16} style={{ display: "inline", marginRight: "6px" }} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RICH PROPERTY DETAIL MODAL / MOBILE BOTTOM SHEET */}
      {selectedPropertyForDetail && (
        <PropertyDetailModal
          property={selectedPropertyForDetail}
          isOpen={!!selectedPropertyForDetail}
          onClose={() => setSelectedPropertyForDetail(null)}
        />
      )}
      {/* OWNER DASHBOARD MODAL */}
      {isOwnerDashboardOpen && user && (
        <OwnerDashboardModal
          isOpen={isOwnerDashboardOpen}
          onClose={() => setIsOwnerDashboardOpen(false)}
          user={user}
          displayName={profile?.displayName || user.displayName || ""}
        />
      )}
    </div>
  );
}
