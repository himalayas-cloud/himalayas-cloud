"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  Building2,
  CheckCircle,
  MessageCircle,
  PlusCircle,
} from "lucide-react";
import { ConfirmationResult } from "firebase/auth";
import OwnerDashboardModal from "@/components/OwnerDashboardModal";
import { subscribePublishedProperties } from "@/lib/properties";

interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  furnished: "Yes" | "No" | "Semi";
  city: "Solan" | "Nahan" | "Shimla";
  locality: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  imageUrl: string;
  type: "flat" | "room" | "pg";
}

const DUMMY_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "2BHK for Rent in Nahan",
    price: 15000,
    area: 1200,
    furnished: "Yes",
    city: "Nahan",
    locality: "Near Landmark",
    address: "Complete Address, Near Landmark, Nahan",
    ownerName: "Vishal Kumar",
    ownerPhone: "+91 98160 12345",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    type: "flat",
  },
  {
    id: "prop-2",
    title: "Spacious 2BHK for Rent in Nahan",
    price: 18000,
    area: 1500,
    furnished: "Semi",
    city: "Nahan",
    locality: "Prime Location",
    address: "Another Address, Prime Location, Nahan",
    ownerName: "Kishan Gupta",
    ownerPhone: "+91 98170 54321",
    imageUrl: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
    type: "flat",
  },
  {
    id: "prop-3",
    title: "Modern 1BHK in Solan Heights",
    price: 12000,
    area: 800,
    furnished: "No",
    city: "Solan",
    locality: "Mall Road",
    address: "Solan Heights, Mall Road, Solan",
    ownerName: "Anjali Sharma",
    ownerPhone: "+91 98050 98765",
    imageUrl: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80",
    type: "flat",
  },
  {
    id: "prop-4",
    title: "Cozy Studio 1RK in Shimla Hills",
    price: 9500,
    area: 550,
    furnished: "Yes",
    city: "Shimla",
    locality: "Lakkar Bazaar",
    address: "Near The Ridge & Lakkar Bazaar, Shimla",
    ownerName: "Rohit Verma",
    ownerPhone: "+91 98820 11223",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    type: "room",
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
  const [rentOrBuy, setRentOrBuy] = useState<"Rent" | "Buy">("Rent");
  const [searchQuery, setSearchQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"email" | "phone">("email");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [selectedPropertyForContact, setSelectedPropertyForContact] = useState<Property | null>(null);
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
        furnished: l.furnished,
        city: (l.city as "Solan" | "Nahan" | "Shimla") || "Solan",
        locality: l.locality,
        address: l.addressApprox || `${l.locality}, ${l.city}`,
        ownerName: l.ownerName,
        ownerPhone: l.ownerPhone,
        imageUrl:
          l.photos?.[0] ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        type: (l.propertyType as any) || "1 Room set",
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
      !prop.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (typeFilter !== "all" && prop.type !== typeFilter) return false;
    if (budgetFilter === "under10k" && prop.price > 10000) return false;
    if (budgetFilter === "10k-15k" && (prop.price < 10000 || prop.price > 15000)) return false;
    if (budgetFilter === "15k-20k" && (prop.price < 15000 || prop.price > 20000)) return false;
    return true;
  });

  return (
    <div className="app-container">
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container"></div>

      {/* 1. Header */}
      <header className="app-header">
        <div className="logo-group">
          <a href="#" className="brand-logo">
            <span className="brand-icon">
              <Building2 size={26} strokeWidth={2.4} />
            </span>
            <span>RentHimalayas</span>
          </a>

          {/* City Switcher Pill */}
          <div className="location-pill" onClick={() => {
            const cities = ["All", "Solan", "Nahan", "Shimla"];
            const nextIdx = (cities.indexOf(selectedCity) + 1) % cities.length;
            setSelectedCity(cities[nextIdx]);
          }}>
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
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>Loading...</span>
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

      {/* 2. Hero Card Section */}
      <section className="hero-card">
        {/* Buy / Rent pill toggle */}
        <div className="toggle-group">
          <button
            className={`toggle-btn ${rentOrBuy === "Buy" ? "active" : ""}`}
            onClick={() => setRentOrBuy("Buy")}
          >
            Buy
          </button>
          <button
            className={`toggle-btn ${rentOrBuy === "Rent" ? "active" : ""}`}
            onClick={() => setRentOrBuy("Rent")}
          >
            Rent
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-input-group">
            <span className="city-badge">{selectedCity === "All" ? "Nahan" : selectedCity}</span>
            <input
              type="text"
              placeholder="Add Something..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="all">Rooms</option>
            <option value="1rk">1 RK</option>
            <option value="1bhk">1 BHK</option>
            <option value="2bhk">2 BHK</option>
            <option value="3bhk">3 BHK</option>
          </select>

          <select
            className="filter-select"
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
          >
            <option value="all">Budget</option>
            <option value="under10k">Under ₹10,000</option>
            <option value="10k-15k">₹10,000 - ₹15,000</option>
            <option value="15k-20k">₹15,000 - ₹20,000</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Type (All)</option>
            <option value="1 Room set">1 Room Set</option>
            <option value="2 Room set">2 Room Set</option>
            <option value="3 room set">3 Room Set</option>
          </select>

          <button className="btn-search">
            <Search size={18} />
            <span>Search</span>
          </button>
        </div>

        {/* Hero Tagline */}
        <h1 className="hero-heading">Move In. Feel at Home</h1>
      </section>

      {/* 3. Property Grid Section */}
      <section className="content-section">
        <h2 className="section-title">Top Picks Just For You</h2>

        <div className="listings-grid">
          {filteredProperties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-img-wrapper">
                <Image
                  src={property.imageUrl}
                  alt={property.title}
                  className="property-img"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <span className="property-badge">{property.city}</span>
              </div>

              <div className="property-info">
                <h3 className="property-title">{property.title}</h3>

                <p className="property-details">
                  Price: <strong>₹{property.price.toLocaleString("en-IN")}/month</strong> | Area:{" "}
                  <strong>{property.area} sqft</strong> | Furnished: <strong>{property.furnished}</strong>
                </p>

                <p className="property-address">{property.address}</p>

                <div className="property-footer">
                  <div className="owner-info">
                    <UserIcon size={16} />
                    <span>{property.ownerName}</span>
                  </div>

                  <button
                    className="btn-contact"
                    onClick={() => setSelectedPropertyForContact(property)}
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="app-footer">
        <p>© 2026 RentHimalayas. All rights reserved.</p>
        <p>Your premium partner for finding homes in the Himalayas.</p>
      </footer>

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

      {/* CONTACT OWNER MODAL */}
      {selectedPropertyForContact && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setSelectedPropertyForContact(null)}
        >
          <div
            className="modal-dialog animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px" }}
          >
            <button className="modal-close-btn" onClick={() => setSelectedPropertyForContact(null)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "4px" }}>
              Contact Property Owner
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              {selectedPropertyForContact.title}
            </p>

            <div className="profile-card" style={{ marginBottom: "20px" }}>
              <div className="profile-field-row">
                <span className="profile-field-label">Owner</span>
                <span className="profile-field-value">{selectedPropertyForContact.ownerName}</span>
              </div>
              <div className="profile-field-row">
                <span className="profile-field-label">Location</span>
                <span className="profile-field-value">{selectedPropertyForContact.city}</span>
              </div>
              <div className="profile-field-row">
                <span className="profile-field-label">Monthly Rent</span>
                <span className="profile-field-value">
                  ₹{selectedPropertyForContact.price.toLocaleString("en-IN")}/mo
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={`tel:${selectedPropertyForContact.ownerPhone}`}
                className="btn-primary"
                style={{ textDecoration: "none" }}
              >
                <Phone size={18} />
                <span>Call {selectedPropertyForContact.ownerPhone}</span>
              </a>

              <a
                href={`https://wa.me/${selectedPropertyForContact.ownerPhone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(
                  selectedPropertyForContact.ownerName
                )},%20I%20am%20interested%20in%20your%20rental%20listing:%20${encodeURIComponent(
                  selectedPropertyForContact.title
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ textDecoration: "none", background: "#E8F5E9", color: "#1B5E20", borderColor: "#C8E6C9" }}
              >
                <MessageCircle size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
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
    </div>
  );
}
