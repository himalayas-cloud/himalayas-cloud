"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Search,
  User as UserIcon,
  X,
  Phone,
  LogOut,
  ChevronDown,
  PlusCircle,
  Home,
  LayoutGrid,
  Map as MapIcon,
  List as ListIcon,
  Check,
  SlidersHorizontal,
  Camera,
  ChevronRight,
} from "lucide-react";
import OwnerDashboardModal from "@/components/OwnerDashboardModal";
import PropertyDetailModal, { PropertyDetail } from "@/components/PropertyDetailModal";
import Navbar from "@/components/navbar";
import PropertyImageCarousel from "@/components/PropertyImageCarousel";
import { useInfiniteProperties, useListingsLiveRefresh } from "@/hooks/use-properties";
import {
  searchLocalities,
  getCoordinatesForLocality,
  HIMACHAL_LOCALITIES,
  parseValidCoordinates,
  HIMACHAL_DISTRICTS,
  HIMACHAL_DISTRICT_DATA,
  CITY_BASE_COORDINATES,
} from "@/lib/localities";

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
      <span>Loading Himalayan Map...</span>
    </div>
  ),
});

export interface Property extends PropertyDetail {
  area?: number;
  thumbs?: string[];
  coverThumb?: string;
  imageCount?: number;
}

const DUMMY_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "2BHK Set Near Ranital Garden",
    price: 15000,
    area: 1200,
    furnished: "No Furnished",
    city: "Nahan",
    district: "Sirmaur",
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
    district: "Sirmaur",
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
    district: "Solan",
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
    city: "Shimla City",
    district: "Shimla",
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
  {
    id: "prop-5",
    title: "Independent 1 Room Set in Shamsherpur",
    price: 6500,
    area: 600,
    furnished: "No Furnished",
    city: "Paonta Sahib",
    district: "Sirmaur",
    locality: "Shamsherpur",
    address: "Near Industrial Area & Badripur Chowk, Paonta Sahib, Sirmaur",
    coordinates: [30.4410, 77.6320],
    ownerName: "Harpreet Singh",
    ownerPhone: "+91 98160 55443",
    photos: [
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ],
    type: "1 Room set",
    description: "Comfortable independent room set with attached bathroom and kitchen. Very convenient for executives, bank employees, or industrial workers in Paonta Sahib.",
  },
  {
    id: "prop-6",
    title: "Spacious 2BHK Near Degree College Road",
    price: 7500,
    area: 950,
    furnished: "Semi-Furnished",
    city: "Shillai",
    district: "Sirmaur",
    locality: "Degree College Road",
    address: "Near Govt Degree College & Main Bazar, Shillai, Sirmaur",
    coordinates: [30.6890, 77.7240],
    ownerName: "Surender Negi",
    ownerPhone: "+91 98170 88776",
    photos: [
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    type: "2 Room set",
    description: "Scenic 2BHK room set with wide open mountain views of Trans-Giri valley. 24-hour water supply, separate entrance, peaceful residential location in Shillai.",
  },
  {
    id: "prop-7",
    title: "Studio Room in Moginand Near Highway",
    price: 5000,
    area: 500,
    furnished: "No Furnished",
    city: "Kala Amb",
    district: "Sirmaur",
    locality: "Moginand",
    address: "Near Industrial Area Phase 1 & Moginand, Kala Amb, Sirmaur",
    coordinates: [30.4950, 77.2150],
    ownerName: "Devinder Bansal",
    ownerPhone: "+91 98050 33221",
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ],
    type: "1 Room set",
    description: "Affordable room set right next to Kala Amb industrial zone. Ideal for company staff, factory supervisors, and engineers working in Kala Amb.",
  },
  {
    id: "prop-8",
    title: "Modern 1BHK in Baddi Phase 2",
    price: 8000,
    area: 750,
    furnished: "Semi-Furnished",
    city: "Baddi",
    district: "Solan",
    locality: "Phase 2 / Sai Road",
    address: "Near Sai Road & Pharma Industrial Park, Baddi, Solan",
    coordinates: [30.9578, 76.7914],
    ownerName: "Vikram Chauhan",
    ownerPhone: "+91 98820 44556",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80",
    ],
    type: "1 Room set",
    description: "Well-maintained 1BHK flat in prime Baddi location. 24/7 power backup, reserved parking, very close to major pharmaceutical plants.",
  },
  {
    id: "prop-pg-1",
    title: "Premium PG / Hostel with Meals & WiFi in Solan",
    price: 6000,
    area: 350,
    furnished: "Furnished",
    city: "Solan City",
    district: "Solan",
    locality: "Oachghat / Bypass",
    address: "Near Shoolini University Road & Oachghat, Solan",
    coordinates: [30.8750, 77.1250],
    ownerName: "Sunita Sharma",
    ownerPhone: "+91 98161 44552",
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    ],
    type: "PG / Hostel",
    description: "Comfortable student and working professional PG / Hostel. Includes 3 hygienic meals daily, high-speed WiFi, laundry facilities, study table, and 24-hour hot water.",
  },
  {
    id: "prop-pg-2",
    title: "Boys & Girls PG / Hostel near Sanjauli Chowk",
    price: 7000,
    area: 400,
    furnished: "Furnished",
    city: "Shimla City",
    district: "Shimla",
    locality: "Sanjauli",
    address: "Near IGMC College & Sanjauli Chowk, Shimla",
    coordinates: [31.1020, 77.1950],
    ownerName: "Prem Prakash",
    ownerPhone: "+91 98170 33445",
    photos: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    ],
    type: "PG / Hostel",
    description: "Clean and peaceful PG / Hostel near IGMC and Sanjauli. Ideal for medical students and working staff. Includes breakfast, dinner, hot water, and study tables.",
  },
];

export interface MarketplaceViewProps {
  initialDistrict?: string;
  defaultCity?: string;
  pageTitle?: string;
}

export default function MarketplaceView({
  initialDistrict = "Sirmaur",
  defaultCity,
  pageTitle,
}: MarketplaceViewProps) {
  const { user, profile, loading, authError, loginWithGoogle, updateProfileData, logout, clearError } = useAuth();
  const [firestoreProperties, setFirestoreProperties] = useState<Property[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Default city/district selection
  const startingCity = defaultCity || initialDistrict || "Nahan";
  const [selectedCity, setSelectedCity] = useState<string>(startingCity);
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<Property | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [panToCoordinate, setPanToCoordinate] = useState<[number, number] | null>(
    (initialDistrict && HIMACHAL_DISTRICT_DATA[initialDistrict]?.center) || null
  );

  // Mobile View Toggle: "list" or "map"
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [activeMapPreview, setActiveMapPreview] = useState<Property | null>(null);

  // Interactive Roomster Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchLocalityDropdown, setShowSearchLocalityDropdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(25000);
  const [isBudgetApplied, setIsBudgetApplied] = useState<boolean>(false);
  const [furnishingFilter, setFurnishingFilter] = useState<string>("all");
  const [openPopover, setOpenPopover] = useState<"type" | "budget" | "furnishing" | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationModalTab, setLocationModalTab] = useState<string>(initialDistrict || "Sirmaur");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  // Profile Edit State
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.displayName || "");
      setEditPhone(profile.phoneNumber || "");
      setEditPhotoUrl(profile.photoURL || "");
    } else if (user) {
      setEditDisplayName(user.displayName || "");
      setEditPhone(user.phoneNumber || "");
      setEditPhotoUrl(user.photoURL || "");
    }
  }, [profile, user]);

  const {
    items: rawListings = [],
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
  } = useInfiniteProperties();
  useListingsLiveRefresh();

  // Keep firestore properties synced with SWR cached data
  useEffect(() => {
    if (rawListings.length > 0) {
      const formatted: Property[] = rawListings.map((l: any) => {
        const thumbs =
          l.thumbs && l.thumbs.length > 0
            ? l.thumbs
            : l.coverThumb
              ? [l.coverThumb]
              : l.photos && l.photos.length > 0
                ? l.photos
                : [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                  ];

        return {
          id: l.id || `fs-${Math.random()}`,
          title: l.title,
          price: l.monthlyRent,
          area: l.areaSqft || 900,
          furnished: l.furnished || "No Furnished",
          district: l.district || initialDistrict || "Sirmaur",
          city: l.city || "Nahan",
          locality: l.locality,
          address: l.addressApprox || `${l.locality}, ${l.city}`,
          ownerName: l.ownerName,
          ownerPhone: l.ownerPhone,
          photos: thumbs,
          thumbs,
          coverThumb: l.coverThumb || thumbs[0],
          imageCount: l.imageCount || thumbs.length || 1,
          type: (l.propertyType as any) || "1 Room set",
          description: l.description,
          status: l.status,
          coordinates: parseValidCoordinates(l.coordinates, l.city, l.locality),
        };
      });
      setFirestoreProperties(formatted);
    }
  }, [rawListings, initialDistrict]);

  // Backward-compatible manual reload helper
  const loadProperties = async () => { };

  const handleOpenAuth = () => {
    clearError();
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
    clearError();
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error("Google sign in failed:", err);
    }
  };

  const handleOpenPropertyDetail = (property: Property) => {
    setSelectedPropertyForDetail(property);
  };

  const handleClosePropertyDetail = () => {
    setSelectedPropertyForDetail(null);
  };

  // Only display real listings from Firestore
  const combinedProperties = React.useMemo(() => {
    return firestoreProperties;
  }, [firestoreProperties]);

  // Sync state if URL specifies a deep link property
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const propId = params.get("property");
      if (propId && combinedProperties.length > 0) {
        const found = combinedProperties.find((p) => p.id === propId);
        if (found) {
          setSelectedPropertyForDetail(found);
          if (found.coordinates) {
            setPanToCoordinate(found.coordinates);
          }
        }
      }
    }
  }, [combinedProperties]);

  // Filter properties with two-tier District & Town matching
  const filteredProperties = combinedProperties.filter((prop) => {
    if (selectedCity !== "All") {
      const target = selectedCity.toLowerCase().trim();
      const propCity = (prop.city || "").toLowerCase().trim();
      const propDist = ((prop as any).district || "").toLowerCase().trim();
      const propAddr = (prop.address || "").toLowerCase();
      const propLoc = (prop.locality || "").toLowerCase();

      const matches =
        propCity === target ||
        propCity.includes(target) ||
        target.includes(propCity) ||
        propDist === target ||
        propDist.includes(target) ||
        propAddr.includes(target) ||
        propLoc.includes(target);

      if (!matches) return false;
    }
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
      {/* 1. Header with Brand Logo, Actions, and Profile Icon on Extreme Right Corner */}
      <Navbar
        isLoading={!isMounted || (loading && !profile)}
        isLoggedIn={Boolean(user || profile)}
        photoURL={profile?.photoURL || editPhotoUrl || user?.photoURL}
        displayName={profile?.displayName || user?.displayName}
        email={profile?.email || user?.email}
        selectedCity={selectedCity}
        onHostClick={() => {
          if (!user) {
            handleOpenAuth();
          } else {
            setIsOwnerDashboardOpen(true);
          }
        }}
        onLocationClick={() => setIsLocationModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLoginClick={handleOpenAuth}
      />

      {/* 2. Roomster-Style Split-Screen Marketplace Layout */}
      {/* On desktop: Left listings scroll independently; right Map stays completely fixed */}
      <main className="split-marketplace-layout">
        {/* Left Scrollable Listings Pane */}
        <section className={`split-left-pane ${mobileView === "map" ? "hidden-on-mobile" : ""}`}>
          {/* Breadcrumbs matching exact original design */}
          <nav className="roomster-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              <Home size={15} />
            </Link>
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
            <span>{selectedCity === "All" ? (initialDistrict || "All Cities") : selectedCity}</span>
          </nav>

          {/* Heading */}
          <h1 className="roomster-heading">
            {pageTitle || `Rooms for Rent in ${selectedCity === "All" ? (initialDistrict ? `${initialDistrict}, HP` : "Himachal Pradesh") : `${selectedCity}, HP`}`}
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
                      { label: "PG / Hostel", value: "PG / Hostel" },
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

            {/* Budget Button with Slider Popup */}
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
                      { label: "No Furnished", value: "no-furnished" },
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
                onClick={() => handleOpenPropertyDetail(property)}
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
                <div className="property-img-wrapper" style={{ position: "relative", overflow: "hidden" }}>
                  <PropertyImageCarousel
                    images={
                      property.thumbs && property.thumbs.length > 0
                        ? property.thumbs
                        : property.photos && property.photos.length > 0
                          ? property.photos
                          : property.coverThumb
                            ? [property.coverThumb]
                            : []
                    }
                    title={property.title}
                  />
                  <span className="property-badge" style={{ zIndex: 4 }}>{property.city}</span>

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
                      zIndex: 4,
                    }}
                  >
                    NEW
                  </span>
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
                        handleOpenPropertyDetail(property);
                      }}
                    >
                      View & Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Load More Button */}
          {!isReachingEnd && filteredProperties.length > 0 && (
            <div style={{ textAlign: "center", margin: "28px 0" }}>
              <button
                type="button"
                onClick={() => loadMore()}
                disabled={isLoadingMore}
                className="btn-primary"
                style={{
                  padding: "12px 32px",
                  borderRadius: "999px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(242, 106, 27, 0.28)",
                  cursor: isLoadingMore ? "wait" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "0 auto",
                }}
              >
                {isLoadingMore ? "Loading more rooms..." : `Load More Rooms (${filteredProperties.length} showing)`}
              </button>
            </div>
          )}

          {filteredProperties.length === 0 && (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                margin: "24px 0",
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
                  setSelectedCity(startingCity);
                  setSearchQuery("");
                  setTypeFilter("all");
                  setIsBudgetApplied(false);
                  setMinBudget(0);
                  setMaxBudget(25000);
                  setFurnishingFilter("all");
                  setPanToCoordinate(
                    (initialDistrict && HIMACHAL_DISTRICT_DATA[initialDistrict]?.center) || null
                  );
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Bottom attribution/copyright inside left scroll */}
          <div style={{ marginTop: "32px", padding: "16px 0", borderTop: "1px solid #E2E8F0", textAlign: "center", fontSize: "0.8rem", color: "#94A3B8" }}>
            <p>© 2026 RentHimalayas • Sirmaur • Solan • Shimla</p>
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
            onSelectProperty={(p) => {
              setActiveMapPreview(null);
              handleOpenPropertyDetail(p as Property);
            }}
            mobileView={mobileView}
            onActivePreviewChange={(p) => setActiveMapPreview(p as Property | null)}
          />
        </section>
      </main>

      {/* Mobile Floating Toggle (List vs Map) */}
      {!selectedPropertyForDetail &&
        !activeMapPreview &&
        !isAuthModalOpen &&
        !isProfileModalOpen &&
        !isOwnerDashboardOpen &&
        !isLocationModalOpen && (
          <div className="mobile-view-toggle-bar">
            <button
              className={`mobile-view-toggle-btn ${mobileView === "list" ? "active" : ""}`}
              onClick={() => {
                setActiveMapPreview(null);
                setMobileView("list");
              }}
            >
              <ListIcon size={16} />
              <span>List</span>
            </button>
            <button
              className={`mobile-view-toggle-btn ${mobileView === "map" ? "active" : ""}`}
              onClick={() => setMobileView("map")}
            >
              <MapIcon size={16} />
              <span>Map</span>
            </button>
          </div>
        )}

      {/* AUTH MODAL */}
      {isAuthModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={handleCloseAuth}>
          <div
            className="modal-dialog animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "410px", padding: "32px 26px", textAlign: "center" }}
          >
            <button className="modal-close-btn" onClick={handleCloseAuth}>
              <X size={20} />
            </button>

            {/* Brand Icon Header */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "var(--primary-light)",
                marginBottom: "16px",
              }}
            >
              <Image
                src="/logo.png"
                alt="Rent Himalayas"
                width={32}
                height={32}
                style={{ objectFit: "contain" }}
              />
            </div>

            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "8px", color: "#191E24" }}>
              Welcome to Rent Himalayas
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "22px" }}>
              Sign in with your Google account to view owner contact details, save favorite rooms, and list properties across Himachal.
            </p>

            {authError && <div className="alert-error" style={{ textAlign: "left", marginBottom: "16px" }}>{authError}</div>}

            {/* GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              className="btn-google-auth-primary"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
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
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #ECEFF2", fontSize: "0.78rem", color: "var(--text-light)" }}>
              Zero spam • Zero brokerage • 100% Free for tenants & students
            </div>
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsProfileModalOpen(false)}>
          <div
            className="modal-dialog animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "440px", padding: "26px" }}
          >
            <button className="modal-close-btn" onClick={() => setIsProfileModalOpen(false)}>
              <X size={20} />
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              {/* Avatar circle */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  overflow: "hidden",
                  position: "relative",
                  background: (profile?.photoURL || editPhotoUrl) ? "transparent" : "var(--primary)",
                  border: "3px solid #FFFFFF",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "2rem",
                }}
              >
                {(profile?.photoURL || editPhotoUrl) ? (
                  <img
                    src={profile?.photoURL || editPhotoUrl}
                    alt={editDisplayName || "Profile"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  editDisplayName ? editDisplayName.charAt(0).toUpperCase() : "U"
                )}
              </div>

              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#191E24", margin: 0 }}>
                {profile?.displayName || user?.displayName || "My Profile"}
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                {user?.email}
              </p>
            </div>

            {profileSuccess && (
              <div
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#065F46",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                Profile updated successfully!
              </div>
            )}

            {/* Edit Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingProfile(true);
                try {
                  await updateProfileData({
                    displayName: editDisplayName,
                    phoneNumber: editPhone,
                    photoURL: editPhotoUrl,
                  });
                  setProfileSuccess(true);
                  setTimeout(() => setProfileSuccess(false), 3000);
                } catch (err) {
                  console.error("Error updating profile:", err);
                } finally {
                  setIsSavingProfile(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label className="form-label" style={{ fontSize: "0.82rem", marginBottom: "4px" }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="e.g. Vishal Verma"
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "0.82rem", marginBottom: "4px" }}>
                  Contact / WhatsApp Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98160 00000"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "0.82rem", marginBottom: "4px" }}>
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSavingProfile}
                style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}
              >
                {isSavingProfile ? "Saving Changes..." : "Save Profile"}
              </button>
            </form>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #ECEFF2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 14px" }}
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsOwnerDashboardOpen(true);
                }}
              >
                <PlusCircle size={15} />
                <span>My Listings</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 14px", color: "#DC2626", borderColor: "#FCA5A5" }}
                onClick={() => {
                  logout();
                  setIsProfileModalOpen(false);
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RICH PROPERTY DETAIL MODAL / MOBILE FULL-SCREEN VIEW */}
      {selectedPropertyForDetail && (
        <PropertyDetailModal
          property={selectedPropertyForDetail}
          isOpen={!!selectedPropertyForDetail}
          onClose={handleClosePropertyDetail}
        />
      )}

      {/* OWNER DASHBOARD MODAL */}
      {isOwnerDashboardOpen && user && (
        <OwnerDashboardModal
          isOpen={isOwnerDashboardOpen}
          onClose={() => {
            setIsOwnerDashboardOpen(false);
            loadProperties();
          }}
          user={user}
          displayName={profile?.displayName || user.displayName || ""}
        />
      )}

      {/* TWO-TIER LOCATION SELECTOR MODAL (SWIGGY / AIRBNB / HOUSING STYLE) */}
      {isLocationModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsLocationModalOpen(false)}>
          <div
            className="modal-dialog animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "560px", padding: "20px" }}
          >
            <button className="modal-close-btn" onClick={() => setIsLocationModalOpen(false)}>
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ background: "var(--primary-light)", padding: "8px", borderRadius: "8px", color: "var(--primary)" }}>
                <MapPin size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#191E24" }}>
                  Select Location in Himachal
                </h2>
                <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                  Browse rooms in Sirmaur, Solan, Shimla, or across Himachal Pradesh
                </p>
              </div>
            </div>

            {/* Quick Search */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <Search size={16} color="#64748B" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search town, tehsil, or district (e.g. Paonta, Shillai, Baddi, Nahan)..."
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>

            {/* Quick Sirmaur / Nahan & All HP pills */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCity(initialDistrict || "Sirmaur");
                  const coords = (initialDistrict && HIMACHAL_DISTRICT_DATA[initialDistrict]?.center) || [30.5599, 77.2955];
                  setPanToCoordinate(coords);
                  setIsLocationModalOpen(false);
                  setLocationSearchQuery("");
                }}
                style={{
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "12px",
                  border: (selectedCity === "Nahan" || selectedCity === "Sirmaur") ? "2px solid var(--primary)" : "1px solid #E2E8F0",
                  background: (selectedCity === "Nahan" || selectedCity === "Sirmaur") ? "var(--primary-light)" : "#F8FAFC",
                  color: (selectedCity === "Nahan" || selectedCity === "Sirmaur") ? "var(--primary)" : "#1E293B",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s",
                  boxSizing: "border-box",
                }}
              >
                <span>{initialDistrict || "Sirmaur"} (All Towns)</span>
                {(selectedCity === "Nahan" || selectedCity === "Sirmaur") && <Check size={16} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCity("All");
                  setPanToCoordinate(null);
                  setIsLocationModalOpen(false);
                  setLocationSearchQuery("");
                }}
                style={{
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "12px",
                  border: selectedCity === "All" ? "2px solid var(--primary)" : "1px solid #E2E8F0",
                  background: selectedCity === "All" ? "var(--primary-light)" : "#F8FAFC",
                  color: selectedCity === "All" ? "var(--primary)" : "#1E293B",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s",
                  boxSizing: "border-box",
                }}
              >
                <span>All Himachal</span>
                {selectedCity === "All" && <Check size={16} />}
              </button>
            </div>

            {/* If Search Query is active: show matching towns across all districts */}
            {locationSearchQuery.trim() ? (
              <div>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748B", marginBottom: "8px" }}>
                  Matching Towns & Areas:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                  {HIMACHAL_DISTRICTS.flatMap((d) => (HIMACHAL_DISTRICT_DATA[d]?.towns || []))
                    .filter((t) =>
                      t.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
                      t.district.toLowerCase().includes(locationSearchQuery.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={`${item.district}-${item.name}`}
                        onClick={() => {
                          setSelectedCity(item.name);
                          setPanToCoordinate(item.coordinates);
                          setIsLocationModalOpen(false);
                          setLocationSearchQuery("");
                        }}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          background: selectedCity === item.name ? "var(--primary-light)" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#191E24" }}>{item.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748B" }}>Distt. {item.district}</div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* Two-Tier District Tabs & Town Grid */
              <div>
                {/* District Tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    overflowX: "auto",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #E2E8F0",
                    marginBottom: "12px",
                  }}
                >
                  {HIMACHAL_DISTRICTS.map((distName) => (
                    <button
                      key={distName}
                      type="button"
                      onClick={() => setLocationModalTab(distName)}
                      style={{
                        height: "36px",
                        padding: "0 16px",
                        borderRadius: "999px",
                        border: locationModalTab === distName ? "1.5px solid var(--primary)" : "1px solid #E2E8F0",
                        background: locationModalTab === distName ? "var(--primary-light)" : "#FFFFFF",
                        color: locationModalTab === distName ? "var(--primary)" : "#475569",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                        boxSizing: "border-box",
                      }}
                    >
                      {distName}
                    </button>
                  ))}
                </div>

                {/* Quick "Entire District" button */}
                <div style={{ marginBottom: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity(locationModalTab);
                      const coords = HIMACHAL_DISTRICT_DATA[locationModalTab]?.center || CITY_BASE_COORDINATES[locationModalTab];
                      if (coords) setPanToCoordinate(coords);
                      setIsLocationModalOpen(false);
                    }}
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      color: "#0F172A",
                      fontWeight: 700,
                      fontSize: "0.86rem",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                    }}
                  >
                    <span>Explore all rooms in Distt. {locationModalTab}</span>
                    <ChevronRight size={16} color="#64748B" />
                  </button>
                </div>

                {/* Towns Grid for Active District */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                  {(HIMACHAL_DISTRICT_DATA[locationModalTab]?.towns || []).map((t) => (
                    <div
                      key={t.name}
                      onClick={() => {
                        setSelectedCity(t.name);
                        setPanToCoordinate(t.coordinates);
                        setIsLocationModalOpen(false);
                      }}
                      style={{
                        height: "46px",
                        padding: "0 14px",
                        borderRadius: "12px",
                        border: selectedCity === t.name ? "1.5px solid var(--primary)" : "1px solid #E2E8F0",
                        background: selectedCity === t.name ? "var(--primary-light)" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.86rem", color: "#191E24", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                      {selectedCity === t.name && <Check size={14} color="var(--primary)" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
