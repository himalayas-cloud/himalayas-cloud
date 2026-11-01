"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Camera,
  Share2,
  Home,
} from "lucide-react";
import { PropertyDetail } from "@/components/PropertyDetailModal";

const PropertyDetailMap = dynamic(() => import("@/components/PropertyDetailMap"), {
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

function PropertyPageContent() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!propertyId) return;

    async function fetchProperty() {
      try {
        setLoading(true);
        const res = await fetch("/api/properties");
        if (res.ok) {
          const list = await res.json();
          const match = list.find((p: any) => p.id === propertyId);
          if (match) {
            setProperty({
              id: match.id,
              title: match.title,
              price: match.monthlyRent,
              area: match.areaSqft,
              furnished: match.furnished || "No Furnished",
              city: match.city,
              district: match.district,
              locality: match.locality,
              address: match.addressApprox || `${match.locality}, ${match.city}`,
              ownerName: match.ownerName,
              ownerPhone: match.ownerPhone,
              photos: match.photos && match.photos.length > 0 ? match.photos : [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              ],
              type: match.propertyType || "1 Room set",
              description: match.description,
              coordinates: match.coordinates,
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      }
      setLoading(false);
    }

    fetchProperty();
  }, [propertyId]);

  const handleShare = async () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this room for rent in ${property.locality}, ${property.city} on Rent Himalayas: ₹${property.price.toLocaleString("en-IN")}/mo`,
          url: currentUrl,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E2E8F0", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "#64748B", fontWeight: 600 }}>Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#F8FAFC", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#191E24", marginBottom: "8px" }}>Room Listing Not Found</h2>
        <p style={{ color: "#64748B", marginBottom: "20px", maxWidth: "400px" }}>This room listing may have expired or been removed by the owner.</p>
        <Link
          href="/"
          className="btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", padding: "10px 20px" }}
        >
          <Home size={16} />
          <span>Explore All Rooms in Himachal</span>
        </Link>
      </div>
    );
  }

  const photos = property.photos && property.photos.length > 0 ? property.photos : [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
  ];

  const cleanPhone = property.ownerPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=Hi%20${encodeURIComponent(
    property.ownerName
  )},%20I%20saw%20your%20listing%20"${encodeURIComponent(
    property.title
  )}"%20on%20Rent%20Himalayas%20and%20would%20like%20to%20know%20more%20details%20or%20visit.`;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingBottom: "100px" }}>
      {/* Top Floating App Bar */}
      <header className="property-modal-top-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
        <button
          type="button"
          className="property-modal-nav-back-btn"
          onClick={() => router.push("/")}
          aria-label="Back to listings"
        >
          <ChevronLeft size={20} />
          <span>All Rooms</span>
        </button>

        <div className="property-modal-top-actions">
          <button
            type="button"
            className="property-modal-action-circle-btn"
            onClick={handleShare}
            aria-label="Share property"
            title="Share room"
          >
            <Share2 size={17} />
          </button>
        </div>
      </header>

      {copiedLink && (
        <div className="share-toast-pill animate-fade-in" style={{ position: "fixed", top: "70px", zIndex: 120 }}>
          ✓ Link copied to clipboard!
        </div>
      )}

      {/* Main Container */}
      <main style={{ maxWidth: "780px", margin: "0 auto", background: "#ffffff", minHeight: "100vh", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        {/* Gallery */}
        <div className="detail-gallery-container" style={{ position: "relative" }}>
          <div className="detail-active-photo-wrapper" style={{ height: "360px" }}>
            <Image
              src={photos[activePhotoIdx]}
              alt={`${property.title} - Photo ${activePhotoIdx + 1}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 780px"
              className="detail-active-photo"
              unoptimized
            />

            <div className="detail-photo-badges">
              <span className="detail-city-badge">
                <MapPin size={13} style={{ display: "inline", verticalAlign: "-2px" }} />
                {property.city}
              </span>
              <span className="detail-type-badge">{property.type || "Room Set"}</span>
            </div>

            {photos.length > 1 && (
              <div className="detail-photo-counter" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Camera size={12} strokeWidth={2.2} />
                <span>{activePhotoIdx + 1} / {photos.length}</span>
              </div>
            )}

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="detail-photo-nav-btn prev"
                  onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="detail-photo-nav-btn next"
                  onClick={() => setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  aria-label="Next photo"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="detail-thumbnail-strip">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className={`detail-thumb ${idx === activePhotoIdx ? "active" : ""}`}
                  onClick={() => setActivePhotoIdx(idx)}
                >
                  <Image src={photo} alt={`Thumbnail ${idx + 1}`} fill sizes="72px" className="detail-thumb-img" unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="detail-content-body" style={{ padding: "24px 20px" }}>
          <div className="detail-header-row">
            <div>
              <div className="detail-rent-tag">
                <span className="rent-currency">₹</span>
                <span className="rent-amount">{property.price.toLocaleString("en-IN")}</span>
                <span className="rent-period">/ month</span>
              </div>
              <h1 className="detail-title">{property.title}</h1>
            </div>
          </div>

          <div className="detail-location-bar">
            <MapPin size={17} className="text-primary flex-shrink-0" />
            <span>{property.address || `${property.locality}, ${property.city}, Himachal Pradesh`}</span>
          </div>

          <div className="detail-highlights-grid">
            <div className="highlight-card">
              <span className="highlight-label">Property Type</span>
              <span className="highlight-value">{property.type || "Room Set"}</span>
            </div>

            <div className="highlight-card">
              <span className="highlight-label">Furnishing</span>
              <span className="highlight-value">{property.furnished || "No Furnished"}</span>
            </div>

            <div className="highlight-card" style={{ gridColumn: "span 2" }}>
              <span className="highlight-label">Status</span>
              <span className="highlight-value status-available">
                <CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Ready to Move in {property.city}
              </span>
            </div>
          </div>

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

          {/* Interactive Map */}
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
            <div className="detail-owner-avatar">{property.ownerName.charAt(0).toUpperCase()}</div>
            <div className="detail-owner-meta">
              <div className="detail-owner-name-row">
                <span className="detail-owner-name">{property.ownerName}</span>
                <span className="detail-verified-badge">
                  <ShieldCheck size={13} /> Verified Host
                </span>
              </div>
              <span className="detail-owner-phone-sub">{property.ownerPhone}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="detail-sticky-action-bar" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="action-bar-rent-summary">
          <span className="action-rent-label">Monthly Rent</span>
          <span className="action-rent-val">
            ₹{property.price.toLocaleString("en-IN")}
            <span className="action-rent-mo">/mo</span>
          </span>
        </div>

        <div className="action-bar-buttons">
          <a href={`tel:${property.ownerPhone}`} className="btn-modal-call" title="Call Owner">
            <Phone size={16} />
            <span>Call</span>
          </a>

          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-modal-whatsapp" title="Chat on WhatsApp">
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PropertyPageRoute() {
  return (
    <React.Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748B", fontWeight: 600 }}>Loading room details...</p>
          </div>
        </div>
      }
    >
      <PropertyPageContent />
    </React.Suspense>
  );
}
