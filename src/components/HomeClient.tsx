"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check,
  CheckCircle2,
  ChevronRight,
  Menu,
  Building,
  Bed,
  Users as UsersIcon,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Star,
  Compass,
  Mail,
} from "lucide-react";
import OwnerDashboardModal from "@/components/OwnerDashboardModal";
import ProfileAvatar from "@/components/ProfileAvatar";
import { HIMACHAL_DISTRICT_DATA } from "@/lib/localities";
import { useInfiniteProperties, useListingsLiveRefresh } from "@/hooks/use-properties";
import type { PropertyListing } from "@/types";
import type { PropertiesPageResult } from "@/lib/properties";

export default function HomeClient({
  initialPage,
  initialProperties,
}: {
  initialPage?: PropertiesPageResult;
  initialProperties?: PropertyListing[];
}) {
  const router = useRouter();
  const { user, profile, loading, authError, clearError, loginWithGoogle, logout } = useAuth();

  const fallbackPage = initialPage ?? (initialProperties ? { items: initialProperties, nextCursor: null } : undefined);
  const { items: properties, isLoading, isLoadingMore, isReachingEnd, loadMore } = useInfiniteProperties(fallbackPage);
  useListingsLiveRefresh();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sliding City Transition (Nahan -> Solan -> Shimla)
  const BASE_CITIES = ["Nahan", "Solan", "Shimla"];
  const SLIDING_CITIES = ["Nahan", "Solan", "Shimla", "Nahan"];
  const [slidingCityIndex, setSlidingCityIndex] = useState(0);
  const [enableCityTransition, setEnableCityTransition] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationModalTab, setLocationModalTab] = useState("Sirmaur");

  // Smooth unidirectional visual transition between Nahan -> Solan -> Shimla
  useEffect(() => {
    const timer = setInterval(() => {
      setEnableCityTransition(true);
      setSlidingCityIndex((prev) => prev + 1);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (slidingCityIndex === BASE_CITIES.length) {
      // Reached the clone element (Nahan). Wait for CSS transition (550ms) to finish, then snap back to 0
      const snapTimer = setTimeout(() => {
        setEnableCityTransition(false);
        setSlidingCityIndex(0);
      }, 580);
      return () => clearTimeout(snapTimer);
    }
  }, [slidingCityIndex, BASE_CITIES.length]);

  const handleOpenAuth = () => {
    clearError();
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
    clearError();
  };

  return (
    <div className="app-container" style={{ overflowX: "hidden" }}>
      {/* 1. TOP NAVBAR (Roomster Reverse-Engineered Navigation) */}
      <nav className="roomster-navbar" aria-label="Main Navigation">
        <div className="roomster-navbar-inner">
          <Link href="/" className="roomster-nav-brand">
            <div style={{ width: 34, height: 34, position: "relative", display: "flex", alignItems: "center" }}>
              <Image src="/logo.png" alt="Rent Himalayas Logo" width={34} height={34} style={{ objectFit: "contain" }} priority />
            </div>
            <span>
              Rent<span className="brand-accent">Himalayas</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="roomster-nav-links">
            <Link href="/blog" className="roomster-nav-item">
              Blog Page
            </Link>
            <a href="#faq" className="roomster-nav-item">
              FAQ
            </a>
            <Link href="/about-us" className="roomster-nav-item">
              About Us
            </Link>
            <button
              type="button"
              className="roomster-nav-list-btn"
              onClick={() => router.push("/rooms-for-rent-in-sirmaur?listRoom=true")}
              title="List your room, flat, PG or hostel in Himachal"
            >
              <PlusCircle size={15} />
              <span>List Your Space</span>
            </button>
          </div>

          {/* Right Corner Actions */}
          <div className="roomster-nav-actions">
            <div
              className="location-pill mobile-nav-hide"
              onClick={() => setIsLocationModalOpen(true)}
              title="Click to switch location"
            >
              <MapPin size={15} className="text-primary" />
              <span className="location-pill-text">Nahan</span>
              <ChevronDown size={13} />
            </div>

            <div className="mobile-nav-hide">
              <ProfileAvatar
                isLoading={!isMounted || (loading && !profile)}
                isLoggedIn={Boolean(user || profile)}
                photoURL={profile?.photoURL}
                displayName={profile?.displayName || user?.displayName}
                email={profile?.email || user?.email}
                onAvatarClick={() => setIsProfileModalOpen(true)}
                onLoginClick={handleOpenAuth}
              />
            </div>

            <button
              type="button"
              className="roomster-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE SLIDE-OUT DRAWER */}
      {isMobileMenuOpen && (
        <div className="roomster-mobile-drawer-overlay animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="roomster-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="roomster-drawer-header">
              <Link href="/" className="roomster-nav-brand" onClick={() => setIsMobileMenuOpen(false)}>
                <Image src="/logo.png" alt="Logo" width={28} height={28} />
                <span>
                  Rent<span className="brand-accent">Himalayas</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: "#F1F5F9", border: "none", borderRadius: "50%", padding: "6px", cursor: "pointer", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>

            <ul className="roomster-drawer-links">
              <li>
                <Link href="/rooms-for-rent-in-sirmaur" className="roomster-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Find room</span>
                  <ChevronRight size={16} color="#94A3B8" />
                </Link>
              </li>
              <li>
                <a href="#faq" className="roomster-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>FAQ</span>
                  <ChevronRight size={16} color="#94A3B8" />
                </a>
              </li>
              <li>
                <Link href="/blog" className="roomster-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Blogs</span>
                  <ChevronRight size={16} color="#94A3B8" />
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="roomster-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>About Us</span>
                  <ChevronRight size={16} color="#94A3B8" />
                </Link>
              </li>
            </ul>

            <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #E2E8F0" }}>
              {user || profile ? (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: "100%", padding: "11px", justifyContent: "center" }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                >
                  My Profile ({profile?.displayName || user?.email?.split("@")[0] || "User"})
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%", padding: "11px", justifyContent: "center" }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenAuth();
                  }}
                >
                  Log In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ROOMSTER HERO SECTION (Sliding Sirmaur -> Solan -> Shimla Visual Transition) */}
      <section className="roomster-hero-wrap">
        <div className="roomster-hero-container">
          {/* Heading with Slick Vertical Sliding Transition */}
          <h1 className="roomster-hero-heading">
            Rooms for Rent & Roommate Finder in{" "}
            <span className="sliding-city-wrapper">
              <span
                className="sliding-city-track"
                style={{
                  transform: `translateY(-${slidingCityIndex * 1.25}em)`,
                  transition: enableCityTransition
                    ? "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "none",
                }}
              >
                {SLIDING_CITIES.map((cityName, idx) => (
                  <span key={`${cityName}-${idx}`} className="sliding-city-item">
                    {cityName}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className="roomster-hero-sub">
            Find verified rooms to rent, 1BHK/2BHK flats, PGs and roommates across Himachal Pradesh.
            Zero brokerage, 100% direct owner contact.
          </p>

          <ul className="roomster-hero-stats">
            <li>
              <strong>100+</strong> rooms & flats for rent right now
            </li>
            <li>•</li>
            <li>
              <strong>100+</strong> people looking for a roommate
            </li>
          </ul>

          {/* Quick Action CTA Buttons */}
          <div className="roomster-cta-buttons">
            <button
              type="button"
              className="roomster-cta-btn primary"
              onClick={() => router.push("/rooms-for-rent-in-sirmaur?listRoom=true")}
            >
              <PlusCircle size={18} />
              <span>List a room</span>
            </button>
            <Link href="/rooms-for-rent-in-sirmaur" className="roomster-cta-btn secondary">
              <Search size={18} />
              <span>Find a room</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. DIRECT RENTAL TRUST & VALUE HIGHLIGHTS */}
      <section className="roomster-press-strip" aria-label="Direct Rental Highlights">
        <div className="roomster-press-inner">
          <p className="roomster-press-title">Direct & Verified Rentals</p>
          <div className="roomster-press-logos">
            <span className="roomster-press-item" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} /> Zero Brokerage
            </span>
            <span className="roomster-press-item" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} /> Direct Landlord Contact
            </span>
            <span className="roomster-press-item" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} /> Verified Mountain Homes
            </span>
            <span className="roomster-press-item" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} /> Instant WhatsApp Chat
            </span>
            <span className="roomster-press-item" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} /> 100% Free Listing
            </span>
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPOSITION SECTION */}
      <section className="roomster-features-section" aria-label="Why Choose Rent Himalayas">
        <div className="roomster-section-header">
          <h2 className="roomster-section-title">Rent Himalayas brings mountain homes & people together</h2>
          <p className="roomster-section-sub">
            The simplest, most reliable way to find rooms, flats, and roommates in Himachal Pradesh
          </p>
        </div>

        <div className="roomster-features-grid">
          <div className="roomster-feature-card">
            <div className="roomster-feature-icon-circle">
              <ShieldCheck size={26} />
            </div>
            <h3 className="roomster-feature-title">0% Brokerage Guarantee</h3>
            <p className="roomster-feature-desc">
              Connect directly with verified local landlords across Nahan, Solan, and Shimla. Speak or
              WhatsApp directly without paying middleman fees or broker commissions.
            </p>
          </div>

          <div className="roomster-feature-card">
            <div className="roomster-feature-icon-circle">
              <Compass size={26} />
            </div>
            <h3 className="roomster-feature-title">Verified Mountain Locations</h3>
            <p className="roomster-feature-desc">
              Accurate GPS coordinates, landmark directions, sunny mountain views, 24/7 clean water supply
              details, and dedicated road/parking accessibility.
            </p>
          </div>

          <div className="roomster-feature-card">
            <div className="roomster-feature-icon-circle">
              <UsersIcon size={26} />
            </div>
            <h3 className="roomster-feature-title">Student & Industrial PGs</h3>
            <p className="roomster-feature-desc">
              Tailored student accommodations and PGs near Shoolini University, Dr. YSP UHF Nauni, HPU
              Shimla, and corporate housing in Baddi & Kala Amb pharma hubs.
            </p>
          </div>
        </div>
      </section>

      {/* 6. SEO FAQ ACCORDION SECTION */}
      <section id="faq" className="roomster-faq-section" aria-label="Frequently Asked Questions">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "@id": "https://renthimalayas.com/#faq",
              name: "Frequently Asked Questions - Rent Himalayas",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How do I find a room for rent in Nahan, Solan, or Shimla?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Click on any city (like Nahan, Solan, or Shimla) to view our dedicated rental page. Filter by room type, budget, or locality and contact the homeowner directly.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is Rent Himalayas free to search and list properties?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Searching for rental properties, viewing landlord contact numbers, and chatting on WhatsApp is 100% free with zero brokerage.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I contact the property owner directly?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Open any listing to find direct 'Call Owner' and 'WhatsApp' buttons with the owner's phone number.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can students find PGs near universities?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, we feature verified PGs near Shoolini University, UHF Nauni, and HPU Shimla with meals, WiFi, and laundry.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How can I list my vacant room, flat, or PG?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Click 'List Your Space' or '+ List a room', sign in with Google, enter your room details and photos, and publish for free.",
                  },
                },
              ],
            }),
          }}
        />

        <div className="roomster-section-header">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#FFF4ED",
              color: "#DE590F",
              padding: "4px 14px",
              borderRadius: "9999px",
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2 className="roomster-section-title">Frequently Asked Questions</h2>
          <p className="roomster-section-sub">
            Learn more about renting rooms, flats, and student PGs across Himachal Pradesh
          </p>
        </div>

        <div className="roomster-faq-list">
          {[
            {
              q: "How do I find a room for rent in Nahan, Solan, or Shimla?",
              a: "Click on any city (like Nahan, Solan, or Shimla) to view our dedicated rental page. Filter by room type, budget, or locality and contact the homeowner directly.",
            },
            {
              q: "Is Rent Himalayas free to search and list properties?",
              a: "Yes! Searching for rental properties, viewing landlord contact numbers, and chatting on WhatsApp is 100% free with zero brokerage.",
            },
            {
              q: "How do I contact the property owner directly?",
              a: "Open any listing to find direct 'Call Owner' and 'WhatsApp' buttons with the owner's phone number.",
            },
            {
              q: "Can students find PGs near universities?",
              a: "Yes, we feature verified PGs near Shoolini University, UHF Nauni, and HPU Shimla with meals, WiFi, and laundry.",
            },
            {
              q: "How can I list my vacant room, flat, or PG?",
              a: "Click 'List Your Space' or '+ List a room', sign in with Google, enter your room details and photos, and publish for free.",
            },
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className={`roomster-faq-item ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="roomster-faq-question"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <div className="roomster-faq-indicator">
                    <ChevronDown size={16} />
                  </div>
                </button>
                {isOpen && <div className="roomster-faq-answer animate-fade-in">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. APP & MOBILE DIRECT CONNECT BANNER */}
      <section style={{ maxWidth: "1200px", margin: "30px auto 60px", padding: "0 20px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #FFF9F5 0%, #FFFFFF 50%, #FFF4ED 100%)",
            color: "#191E24",
            border: "1px solid #FFE4D3",
            borderRadius: "24px",
            padding: "44px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "28px",
            boxShadow: "0 16px 40px -8px rgba(242, 106, 27, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#FFF0E6",
                border: "1px solid #FFD4BC",
                color: "#DE590F",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "0.84rem",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              <Star size={14} fill="#F26A1B" color="#F26A1B" />
              <span>Direct Owner Contact • 100% Zero Brokerage</span>
            </div>
            <h3
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
                fontWeight: 800,
                color: "#191E24",
                marginBottom: "12px",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              Find Your Next Mountain Home on Rent Himalayas
            </h3>
            <p style={{ fontSize: "1rem", color: "#64748B", lineHeight: 1.6, marginBottom: "24px" }}>
              Connect directly with verified room and flat owners across Nahan, Solan, and Shimla. Call with one tap,
              chat on WhatsApp, and visit properties without paying any broker commission.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href="/rooms-for-rent-in-sirmaur"
                className="btn-primary"
                style={{
                  padding: "12px 24px",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(242, 106, 27, 0.3)",
                }}
              >
                <span>Browse Nahan Rooms</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #FFE4D3",
              borderRadius: "20px",
              padding: "28px 24px",
              textAlign: "center",
              minWidth: "240px",
              boxShadow: "0 8px 24px rgba(242, 106, 27, 0.08)",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "#FFF4ED",
                borderRadius: "16px",
                margin: "0 auto 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                border: "1px solid #FFD5B8",
              }}
            >
              <Image src="/logo.png" alt="Rent Himalayas" width={58} height={58} style={{ objectFit: "contain" }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#191E24" }}>Rent Himalayas</div>
            <div style={{ fontSize: "0.85rem", color: "#DE590F", fontWeight: 600, marginTop: "4px" }}>
              Direct Himachal Rentals
            </div>
            <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: "6px" }}>
              Zero Brokerage • Fast & Verified
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMPREHENSIVE FOOTER */}
      <footer className="roomster-footer">
        <div className="roomster-footer-inner">
          <div className="roomster-footer-col">
            <Link href="/" className="roomster-nav-brand" style={{ color: "#FFFFFF", marginBottom: "14px", display: "inline-flex" }}>
              <Image src="/logo.png" alt="Rent Himalayas Logo" width={30} height={30} />
              <span>
                Rent<span className="brand-accent">Himalayas</span>
              </span>
            </Link>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "#94A3B8", maxWidth: "340px", margin: "0 0 16px" }}>
              Himachal Pradesh's dedicated direct-owner rental marketplace connecting tenants with verified rooms,
              flats, and student PGs across Nahan, Solan, and Shimla.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#64748B" }}>
              Zero Commission • Direct Landlord Contact • 100% Free Search
            </p>
          </div>

          <div className="roomster-footer-col">
            <h4>Quick Links</h4>
            <ul className="roomster-footer-links">
              <li>
                <Link href="/blog">Blog & Rental Guides</Link>
              </li>
              <li>
                <a href="#faq">FAQ & Help Center</a>
              </li>
              <li>
                <Link href="/about-us">About Us</Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => router.push("/rooms-for-rent-in-sirmaur?listRoom=true")}
                  style={{ background: "transparent", border: "none", padding: 0, color: "#94A3B8", cursor: "pointer", fontSize: "0.88rem", textAlign: "left" }}
                >
                  List Your Space
                </button>
              </li>
            </ul>
          </div>

          <div className="roomster-footer-col">
            <h4>Contact Us</h4>
            <ul className="roomster-footer-links">
              <li>
                <a
                  href="mailto:renthimalayas@gmail.com"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#94A3B8" }}
                  title="Email Rent Himalayas"
                >
                  <Mail size={15} style={{ color: "#F26A1B", flexShrink: 0 }} />
                  <span style={{ wordBreak: "break-all" }}>renthimalayas@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/rent_himalayas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#94A3B8" }}
                  title="Follow us on Instagram"
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span>@rent_himalayas</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/rent-himalayas/home/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#94A3B8" }}
                  title="Connect on LinkedIn"
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                  <span>LinkedIn Page</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="roomster-footer-bottom">
          <div>© 2026 Rent Himalayas. All rights reserved. Built for Himachal Pradesh.</div>
          <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
            <a
              href="mailto:renthimalayas@gmail.com"
              style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.85rem" }}
            >
              Email Us
            </a>
            <a
              href="https://www.instagram.com/rent_himalayas/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.85rem" }}
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/rent-himalayas/home/?viewAsMember=true"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.85rem" }}
            >
              LinkedIn
            </a>
            <Link href="/about-us" style={{ color: "#64748B", textDecoration: "none", fontSize: "0.85rem" }}>
              About Us
            </Link>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {isAuthModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={handleCloseAuth}>
          <div
            className="modal-dialog animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "410px", padding: "32px 26px", textAlign: "center" }}
          >
            <button type="button" className="modal-close-btn" onClick={handleCloseAuth}>
              <X size={20} />
            </button>

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
              <Image src="/logo.png" alt="Rent Himalayas" width={32} height={32} style={{ objectFit: "contain" }} />
            </div>

            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "8px", color: "#191E24" }}>
              Welcome to Rent Himalayas
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "22px" }}>
              Sign in with Google to view landlord phone numbers, save favorites, and post verified rentals.
            </p>

            {authError && <div className="alert-error" style={{ textAlign: "left", marginBottom: "16px" }}>{authError}</div>}

            <button
              type="button"
              className="google-btn"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                  handleCloseAuth();
                } catch {
                  // handled
                }
              }}
              disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </button>
          </div>
        </div>
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

      {/* TWO-TIER LOCATION MODAL */}
      {isLocationModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setIsLocationModalOpen(false)}>
          <div className="modal-dialog animate-slide-down" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "20px" }}>
            <button type="button" className="modal-close-btn" onClick={() => setIsLocationModalOpen(false)}>
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ background: "var(--primary-light)", padding: "8px", borderRadius: "8px", color: "var(--primary)" }}>
                <MapPin size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#191E24" }}>
                  Select Location in Himachal
                </h2>
                <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                  Choose District and specific town
                </p>
              </div>
            </div>

            {/* District Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px", marginBottom: "14px" }}>
              {["Sirmaur", "Solan", "Shimla"].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setLocationModalTab(dist)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "9999px",
                    border: "none",
                    background: locationModalTab === dist ? "var(--primary)" : "#F1F5F9",
                    color: locationModalTab === dist ? "#FFFFFF" : "#475569",
                    fontWeight: 700,
                    fontSize: "0.86rem",
                    cursor: "pointer",
                  }}
                >
                  {dist}
                </button>
              ))}
            </div>

            {/* Towns Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
              {(HIMACHAL_DISTRICT_DATA[locationModalTab]?.towns || []).map((t) => (
                <div
                  key={t.name}
                  onClick={() => {
                    setIsLocationModalOpen(false);
                    if (locationModalTab === "Solan") router.push("/rooms-for-rent-in-solan");
                    else if (locationModalTab === "Shimla") router.push("/rooms-for-rent-in-shimla");
                    else router.push("/rooms-for-rent-in-sirmaur");
                  }}
                  style={{
                    height: "46px",
                    padding: "0 14px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.86rem", color: "#191E24" }}>{t.name}</span>
                  <ChevronRight size={14} color="#94A3B8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

