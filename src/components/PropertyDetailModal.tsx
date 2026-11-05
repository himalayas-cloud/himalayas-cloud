"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Home,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Sparkles,
  Camera,
  Share2,
} from "lucide-react";

const PropertyDetailMap = dynamic(() => import("./PropertyDetailMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "230px",
        background: "#F1F5F9",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748B",
        fontSize: "0.85rem",
        margin: "20px 0",
      }}
    >
      Loading map...
    </div>
  ),
});

export interface PropertyDetail {
  id: string;
  title: string;
  price: number;
  area?: number;
  furnished?: "Yes" | "No" | "Semi" | string;
  district?: string;
  city: string;
  locality: string;
  address?: string;
  ownerName: string;
  ownerPhone: string;
  photos: string[];
  type?: string;
  description?: string;
  status?: string;
  coordinates?: [number, number];
}

interface PropertyDetailModalProps {
  property: PropertyDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailModal({
  property,
  isOpen,
  onClose,
}: PropertyDetailModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFullScreenPhoto, setIsFullScreenPhoto] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [extraPhotos, setExtraPhotos] = useState<string[] | null>(null);

  // Progressive hydration: fetch all high-res photos for the property in the background
  useEffect(() => {
    if (!isOpen || !property?.id || property.id.startsWith("prop-")) {
      setExtraPhotos(null);
      return;
    }
    let isCancelled = false;
    fetch(`/api/properties/${property.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isCancelled && data && Array.isArray(data.photos) && data.photos.length > 0) {
          setExtraPhotos(data.photos);
        }
      })
      .catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, [isOpen, property?.id]);

  // Reset photo index when a new property is opened
  useEffect(() => {
    if (isOpen) {
      setActivePhotoIdx(0);
      setIsFullScreenPhoto(false);
      setCopiedLink(false);
      // Lock body scroll on mobile for native app feel
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, property]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullScreenPhoto) {
          setIsFullScreenPhoto(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullScreenPhoto, onClose]);

  if (!isOpen || !property) return null;

  const photos =
    (extraPhotos && extraPhotos.length > 0 ? extraPhotos : null) ||
    (property.photos && property.photos.length > 0 ? property.photos : null) ||
    ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"];

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this room for rent in ${property.locality}, ${property.city} on Rent Himalayas: ₹${property.price.toLocaleString("en-IN")}/mo`,
          url: currentUrl,
        });
        return;
      } catch {
        // Share cancelled or not supported
      }
    }
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore
    }
  };

  const cleanPhone = property.ownerPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=Hi%20${encodeURIComponent(
    property.ownerName
  )},%20I%20saw%20your%20listing%20"${encodeURIComponent(
    property.title
  )}"%20on%20Rent%20Himalayas%20and%20would%20like%20to%20know%20more%20details%20or%20visit.`;

  // Format furnishing label
  const getFurnishingLabel = (f?: string) => {
    if (f === "Yes" || f === "Furnished") return "Furnished";
    if (f === "Semi" || f === "Semi-Furnished") return "Semi-Furnished";
    return "No Furnished";
  };

  return (
    <>
      <div className="property-modal-overlay animate-fade-in" onClick={onClose}>
        <div
          className="property-modal-sheet animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Actions (Share button, Close button) */}
          <div className="property-modal-top-bar">
            <div className="property-modal-top-actions">
              <button
                type="button"
                className="property-modal-action-circle-btn"
                onClick={handleShare}
                aria-label="Share property"
                title={copiedLink ? "Link copied!" : "Share room"}
              >
                <Share2 size={17} />
              </button>

              <button
                type="button"
                className="property-modal-action-circle-btn"
                onClick={onClose}
                aria-label="Close details"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Feedback Toast for copied link */}
          {copiedLink && (
            <div className="share-toast-pill animate-fade-in">
              ✓ Link copied to clipboard!
            </div>
          )}

          {/* 1. PHOTO GALLERY / CAROUSEL */}
          <div className="detail-gallery-container">
            {/* Tapping photo opens Fullscreen view for 720x1080 / any aspect ratio */}
            <div
              className="detail-active-photo-wrapper"
              onClick={() => setIsFullScreenPhoto(true)}
              style={{ cursor: "zoom-in" }}
              title="Click to view full photo in 100% resolution"
            >
              <Image
                src={photos[activePhotoIdx]}
                alt={`${property.title} - Photo ${activePhotoIdx + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 720px"
                className="detail-active-photo"
                unoptimized
              />

              {/* Badges on Image */}
              <div className="detail-photo-badges">
                <span className="detail-city-badge">
                  <MapPin size={13} style={{ display: "inline", verticalAlign: "-2px" }} />
                  {property.city}
                </span>
                <span className="detail-type-badge">
                  {property.type || "Room Set"}
                </span>
              </div>

              {/* Tap to view full photo hint */}
              <div className="detail-fullscreen-hint">
                <Maximize2 size={13} />
                <span>Full Photo (720x1080)</span>
              </div>

              {/* Photo Counter */}
              {photos.length > 1 && (
                <div className="detail-photo-counter" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <Camera size={12} strokeWidth={2.2} />
                  <span>{activePhotoIdx + 1} / {photos.length}</span>
                </div>
              )}

              {/* Navigation Arrows for multi-photo */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    className="detail-photo-nav-btn prev"
                    onClick={handlePrevPhoto}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className="detail-photo-nav-btn next"
                    onClick={handleNextPhoto}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="detail-thumbnail-strip">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className={`detail-thumb ${idx === activePhotoIdx ? "active" : ""}`}
                    onClick={() => setActivePhotoIdx(idx)}
                  >
                    <Image
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="72px"
                      className="detail-thumb-img"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. PROPERTY DETAILS CONTENT */}
          <div className="detail-content-body">
            {/* Rent & Title Header */}
            <div className="detail-header-row">
              <div>
                <div className="detail-rent-tag">
                  <span className="rent-currency">₹</span>
                  <span className="rent-amount">
                    {property.price.toLocaleString("en-IN")}
                  </span>
                  <span className="rent-period">/ month</span>
                </div>
                <h1 className="detail-title">{property.title}</h1>
              </div>
            </div>

            {/* Location Bar */}
            <div className="detail-location-bar">
              <MapPin size={17} className="text-primary flex-shrink-0" />
              <span>
                {property.address || `${property.locality}, ${property.city}, Himachal Pradesh`}
              </span>
            </div>

            {/* Quick Highlights Grid (Carpet area removed per request) */}
            <div className="detail-highlights-grid">
              <div className="highlight-card">
                <span className="highlight-label">Property Type</span>
                <span className="highlight-value">{property.type || "Room Set"}</span>
              </div>

              <div className="highlight-card">
                <span className="highlight-label">Furnishing</span>
                <span className="highlight-value">
                  {getFurnishingLabel(property.furnished)}
                </span>
              </div>

              <div className="highlight-card" style={{ gridColumn: "span 2" }}>
                <span className="highlight-label">Status</span>
                <span className="highlight-value status-available">
                  <CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Ready to Move in {property.city}
                </span>
              </div>
            </div>

          {/* Description Section */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <Sparkles size={16} className="text-primary" />
              <span>About this Room</span>
            </h3>
            <p className="detail-description">
              {property.description ||
                `Spacious and peaceful ${property.type || "room set"} situated in ${
                  property.locality
                }, ${property.city}. Surrounded by refreshing Himalayan views, clean water supply, and easy connectivity to local transport.`}
            </p>
          </div>

          {/* Pinpointed Location on Map with Turn-by-Turn Directions */}
          <PropertyDetailMap
            coordinates={property.coordinates}
            title={property.title}
            locality={property.locality}
            city={property.city}
            address={property.address}
            price={property.price}
          />

          {/* Owner Info Card */}
          <div className="detail-owner-card">
            <div className="detail-owner-avatar">
              {property.ownerName.charAt(0).toUpperCase()}
            </div>
            <div className="detail-owner-meta">
              <div className="detail-owner-name-row">
                <span className="detail-owner-name">{property.ownerName}</span>
                <span className="detail-verified-badge">
                  <ShieldCheck size={13} /> Verified Host
                </span>
              </div>
              <span className="detail-owner-phone-sub">
                {property.ownerPhone}
              </span>
            </div>
          </div>

          {/* Space for fixed bottom bar on mobile so last content is never hidden */}
          <div className="mobile-action-spacer" />
        </div>

        {/* 3. STICKY CALL & WHATSAPP ACTION BAR (Premium, Spacious Mobile Bar) */}
        <div className="detail-sticky-action-bar">
          <div className="action-bar-rent-summary">
            <span className="action-rent-label">Monthly Rent</span>
            <span className="action-rent-val">
              ₹{property.price.toLocaleString("en-IN")}
              <span className="action-rent-mo">/mo</span>
            </span>
          </div>

          <div className="action-bar-buttons">
            {/* Direct Phone Call */}
            <a
              href={`tel:${property.ownerPhone}`}
              className="btn-modal-call"
              title="Call Owner"
            >
              <Phone size={16} />
              <span>Call</span>
            </a>

            {/* Direct WhatsApp Chat */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-modal-whatsapp"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    {/* FULL SCREEN LIGHTBOX (Displays 720x1080p and any portrait photos at 100% full height with zero cropping) */}
    {isFullScreenPhoto && (
      <div
        className="photo-lightbox-overlay animate-fade-in"
        onClick={() => setIsFullScreenPhoto(false)}
      >
        <button
          className="lightbox-close-btn"
          onClick={() => setIsFullScreenPhoto(false)}
          aria-label="Close full view"
        >
          <X size={26} />
        </button>

        <div className="lightbox-header-info">
          <span className="lightbox-title">{property.title}</span>
          <span className="lightbox-counter" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Camera size={13} strokeWidth={2.2} />
            <span>{activePhotoIdx + 1} of {photos.length}</span>
          </span>
        </div>

        {/* The 720x1080 full image container */}
        <div
          className="lightbox-img-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={photos[activePhotoIdx]}
            alt={`${property.title} - Full Screen View`}
            fill
            sizes="100vw"
            className="lightbox-img-full"
            priority
            unoptimized
          />
        </div>

        {/* Fullscreen Navigation */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={handleNextPhoto}
              aria-label="Next photo"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
    )}
  </>
  );
}
