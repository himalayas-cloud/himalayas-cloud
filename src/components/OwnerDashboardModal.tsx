import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X,
  PlusCircle,
  Home,
  Trash2,
  Check,
  MapPin,
  Upload,
  Image as ImageIcon,
  Phone,
  User as UserIcon,
  IndianRupee,
  Layers,
  AlertTriangle,
  RotateCw,
  Search,
  Loader2,
  Compass,
} from "lucide-react";
import { PropertyListing, ListingStatus } from "@/types";
import {
  createPropertyListing,
  subscribeOwnerProperties,
  updatePropertyListing,
  deletePropertyListing,
  migrateOwnerEmailListings,
} from "@/lib/properties";
import { prepareListingImages } from "@/lib/image-compress";
import {
  getSafeCoordinates,
  parseValidCoordinates,
  CITY_BASE_COORDINATES,
  HIMACHAL_DISTRICTS,
  getTownsForDistrict,
} from "@/lib/localities";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "firebase/auth";

// Dynamic import of interactive Leaflet Pinpoint Mini Map
const MiniLocationPicker = dynamic(() => import("./MiniLocationPicker"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "140px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        color: "#64748B",
        fontSize: "0.85rem",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        marginTop: "10px",
      }}
    >
      <span>Loading Pinpoint Map...</span>
    </div>
  ),
});

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  displayName: string;
}

interface ImageUploadItem {
  file?: File;
  previewUrl: string;
  isUploaded: boolean;
}

export default function OwnerDashboardModal({
  isOpen,
  onClose,
  user,
  displayName,
}: OwnerDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "create">("create");
  const [myProperties, setMyProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublishingScreen, setIsPublishingScreen] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [ownerName, setOwnerName] = useState(displayName || user.displayName || "");
  const [ownerPhone, setOwnerPhone] = useState(user.phoneNumber || "");
  const [district, setDistrict] = useState("Sirmaur");
  const [town, setTown] = useState("Nahan");
  const [isCustomTown, setIsCustomTown] = useState(false);
  const [customTownName, setCustomTownName] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(
    CITY_BASE_COORDINATES["Nahan"] || [30.5599, 77.2955]
  );
  const [propertyType, setPropertyType] = useState<"1 Room set" | "2 Room set" | "3 room set" | "PG / Hostel">("1 Room set");
  const [furnished, setFurnished] = useState<"No" | "Semi" | "Yes">("No");
  const [price, setPrice] = useState<number | "">("");
  
  // Multiple Photo Upload State
  const [selectedPhotos, setSelectedPhotos] = useState<ImageUploadItem[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to owner properties
  useEffect(() => {
    if (!isOpen || !user.uid) return;
    setPermissionError(false);
    setError(null);

    if (user.email) {
      migrateOwnerEmailListings(user.uid, user.email).catch(() => {});
    }

    const unsubscribe = subscribeOwnerProperties(
      user.uid,
      (props) => {
        setMyProperties(props);
        setPermissionError(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        if (err.message.includes("permission") || err.message.includes("Missing or insufficient")) {
          setPermissionError(true);
        } else {
          setError(err.message);
        }
      }
    );

    return () => unsubscribe();
  }, [isOpen, user.uid, user.email]);

  if (!isOpen) return null;

  if (!isOpen) return null;

  // Handle file selection from phone or PC
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newItems: ImageUploadItem[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isUploaded: false,
    }));

    setSelectedPhotos((prev) => [...prev, ...newItems]);
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove a photo from list
  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Fast client-side image compressor: Resizes and optimizes photos to ~80KB-120KB
  // This allows multiple photos to be stored directly without requiring a paid Firebase Blaze plan or credit card!
  const compressImageFile = (file: File, maxWidth = 1000, quality = 0.72): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Upload photos directly with zero credit card / zero Blaze plan requirement
  const uploadAllPhotos = async (): Promise<string[]> => {
    if (selectedPhotos.length === 0) {
      return ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"];
    }

    const processedUrls: string[] = [];
    setIsUploadingPhotos(true);

    for (const item of selectedPhotos) {
      if (!item.file) {
        processedUrls.push(item.previewUrl);
        continue;
      }

      try {
        // Compress photo to lightweight crisp JPEG (~80KB)
        const compressed = await compressImageFile(item.file);
        processedUrls.push(compressed);
      } catch (err) {
        console.warn("Compression error, using original preview:", err);
        processedUrls.push(item.previewUrl);
      }
    }

    setIsUploadingPhotos(false);
    return processedUrls;
  };

  // Submit Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!ownerName.trim()) {
      setError("Please enter the Owner Name.");
      return;
    }
    if (!ownerPhone.trim()) {
      setError("Please enter the Owner Contact Number.");
      return;
    }
    if (!locationDetails.trim()) {
      setError("Please enter the proper location / address.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Please enter a valid monthly rent price.");
      return;
    }

    setLoading(true);
    setIsPublishingScreen(true);
    const publishStartTime = Date.now();

    try {
      // 1. Prepare listing images: thumbs for listing card carousel + full-size images for propertyImages
      const selectedFiles = selectedPhotos
        .map((p) => p.file || p.previewUrl)
        .filter(Boolean) as (File | string)[];
      let thumbs: string[] = [];
      let images: string[] = [];
      let coverThumb = "";

      if (selectedFiles.length > 0) {
        const prepared = await prepareListingImages(selectedFiles);
        thumbs = prepared.thumbs;
        images = prepared.images;
        coverThumb = prepared.coverThumb;
      } else {
        const fallbackUrl =
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
        thumbs = [fallbackUrl];
        images = [fallbackUrl];
        coverThumb = fallbackUrl;
      }

      const effectiveTown = isCustomTown ? (customTownName.trim() || "Local Area") : town;
      const effectiveCity = effectiveTown;

      // 2. Title generated cleanly from property type, town, district and locality
      const generatedTitle = `${propertyType} for Rent in ${effectiveCity}, ${district} (${locationDetails.trim()})`;

      // Always guaranteed valid coordinates [lat, lng] — never undefined or NaN!
      const safeCoordinates = parseValidCoordinates(
        selectedCoordinates,
        effectiveCity,
        locationDetails.trim()
      );

      // 3. Save to Cloud Firestore
      await createPropertyListing(
        {
          ownerUid: user.uid,
          ownerName: ownerName.trim(),
          ownerPhone: ownerPhone.trim(),
          ownerEmail: user.email || undefined,
          title: generatedTitle,
          description: `${propertyType} available for rent in ${locationDetails.trim()}, ${effectiveCity}, Distt. ${district}. Contact owner directly for visit and details.`,
          propertyType,
          monthlyRent: Number(price),
          district,
          city: effectiveCity,
          locality: locationDetails.trim(),
          addressApprox: `${locationDetails.trim()}, ${effectiveCity}, Distt. ${district}`,
          furnished: furnished === "Yes" ? "Furnished" : furnished === "Semi" ? "Semi-Furnished" : "No Furnished",
          coverThumb,
          photos: thumbs,
          status: "published",
          coordinates: safeCoordinates,
        },
        thumbs,
        images
      );

      // Ensure blinking logo displays for at least 2 seconds
      const elapsed = Date.now() - publishStartTime;
      if (elapsed < 2000) {
        await new Promise((resolve) => setTimeout(resolve, 2000 - elapsed));
      }

      setSuccessMsg("Your room has been published successfully and is now live on Rent Himalayas!");
      
      // Reset form
      setLocationDetails("");
      setSelectedCoordinates(null);
      setPropertyType("1 Room set");
      setPrice("");
      setFurnished("No");
      setSelectedPhotos([]);
      
      setIsPublishingScreen(false);
      setActiveTab("listings");
    } catch (err) {
      console.error("Listing creation error:", err);
      setIsPublishingScreen(false);
      const msg = (err as Error).message;
      if (msg.includes("permission") || msg.includes("Missing or insufficient")) {
        setPermissionError(true);
      } else {
        setError("Error creating listing: " + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (prop: PropertyListing) => {
    if (!prop.id) return;
    const newStatus: ListingStatus = prop.status === "published" ? "draft" : "published";
    try {
      await updatePropertyListing(prop.id, { status: newStatus });
    } catch (err) {
      setError("Failed to update status: " + (err as Error).message);
    }
  };

  const handleDeleteListing = async (propertyId?: string) => {
    if (!propertyId) return;
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deletePropertyListing(propertyId);
    } catch (err) {
      setError("Failed to delete listing: " + (err as Error).message);
    }
  };

  return (
    <>
      {/* BLINKING LOGO PUBLISHING OVERLAY - TRANSPARENT BACKDROP */}
      {isPublishingScreen && (
        <div className="publishing-fullscreen-overlay">
          <div className="publishing-logo-container">
            <Image
              src="/logo.png"
              alt="Rent Himalayas Logo"
              width={48}
              height={48}
              className="publishing-blinking-logo"
              priority
            />
          </div>
        </div>
      )}

      <div className="modal-overlay animate-fade-in" onClick={onClose}>
        <div
          className="modal-dialog animate-slide-down"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "680px", maxHeight: "92vh" }}
        >
          <button className="modal-close-btn" onClick={onClose} disabled={isPublishingScreen}>
            <X size={20} />
          </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              background: "var(--primary-light)",
              padding: "10px",
              borderRadius: "10px",
              color: "var(--primary)",
            }}
          >
            <Home size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>List Your Room for Rent</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Add your room set in Nahan, Solan, or Shimla to connect directly with tenants.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="auth-tabs" style={{ marginTop: "14px", marginBottom: "18px" }}>
          <button
            className={`auth-tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            + Add Property
          </button>
          <button
            className={`auth-tab-btn ${activeTab === "listings" ? "active" : ""}`}
            onClick={() => setActiveTab("listings")}
          >
            My Listings ({myProperties.length})
          </button>
        </div>

        {/* FIRESTORE RULES NOTICE IF PERMISSIONS WERE BLOCKED */}
        {permissionError && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FCD34D",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#92400E",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <span>Unable to publish listing. Please check your internet connection and try again.</span>
          </div>
        )}

        {error && <div className="alert-error">{error}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        {/* TAB 1: ADD PROPERTY (SIMPLE 5 FIELDS + PHOTOS) */}
        {activeTab === "create" && (
          <form onSubmit={handleCreateListing}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Field 1: Owner Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UserIcon size={15} color="var(--primary)" />
                  <span>1. Owner Name *</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Thakur"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>

              {/* Field 2: Owner Contact Number */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={15} color="var(--primary)" />
                  <span>2. Owner Contact Number (Phone / WhatsApp) *</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98160 12345"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  required
                />
              </div>

              {/* Field 3: Two-Tier Location: District -> Town -> Exact Locality + Pinpoint Map */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>3. Location (District & Town) *</span>
                  </span>
                  {selectedCoordinates && (
                    <span style={{ fontSize: "0.76rem", color: "#166534", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Check size={13} color="#166534" /> Pinpointed: {isCustomTown ? customTownName || "Custom" : town}, {district}
                    </span>
                  )}
                </label>
                
                {/* Tier 1: District & Tier 2: Town */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                      Select District
                    </label>
                    <select
                      className="filter-select"
                      style={{ width: "100%" }}
                      value={district}
                      onChange={(e) => {
                        const newDistrict = e.target.value;
                        setDistrict(newDistrict);
                        const districtTowns = getTownsForDistrict(newDistrict);
                        const defaultTown = districtTowns.length > 0 ? districtTowns[0].name : "Main Town";
                        setTown(defaultTown);
                        setIsCustomTown(false);
                        setCustomTownName("");
                        const targetCoords = (districtTowns.length > 0 ? districtTowns[0].coordinates : null) || CITY_BASE_COORDINATES[newDistrict] || [30.5599, 77.2955];
                        setSelectedCoordinates(targetCoords);
                      }}
                    >
                      {HIMACHAL_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          Distt. {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                      Town / Sub-Division
                    </label>
                    <select
                      className="filter-select"
                      style={{ width: "100%" }}
                      value={isCustomTown ? "__other__" : town}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__other__") {
                          setIsCustomTown(true);
                        } else {
                          setIsCustomTown(false);
                          setTown(val);
                          const townCoords = CITY_BASE_COORDINATES[val] || CITY_BASE_COORDINATES[district] || [30.5599, 77.2955];
                          setSelectedCoordinates(townCoords);
                        }
                      }}
                    >
                      {getTownsForDistrict(district).map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                      <option value="__other__">+ Other Town / Village</option>
                    </select>
                  </div>
                </div>

                {/* Custom Town / Village name if chosen */}
                {isCustomTown && (
                  <div style={{ marginBottom: "10px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your Town, Tehsil, or Village name (e.g. Haripurdhar, Trilokpur, etc.)"
                      value={customTownName}
                      onChange={(e) => {
                        setCustomTownName(e.target.value);
                        const matchedCoord = CITY_BASE_COORDINATES[e.target.value.trim()];
                        if (matchedCoord) setSelectedCoordinates(matchedCoord);
                      }}
                      required
                    />
                  </div>
                )}

                {/* Street / Mohalla / Landmark address */}
                <div>
                  <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                    Street Address / Mohalla / Landmark
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Near Gurudwara Sahib, Badripur, Ward No. 3"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    required
                  />
                </div>

                {/* Interactive Pinpoint Map - Pinpoint manually or by enabling GPS location */}
                <div style={{ marginTop: "12px" }}>
                  <MiniLocationPicker
                    coordinates={selectedCoordinates || parseValidCoordinates(null, isCustomTown ? customTownName : town, locationDetails.trim())}
                    onCoordinatesChange={(coords) => setSelectedCoordinates(coords)}
                    localityLabel={`${locationDetails || (isCustomTown ? customTownName : town)}, ${district}`}
                  />
                </div>
              </div>

              {/* Field 4: Property Type (1 Room set, 2 Room set, 3 room set, PG / Hostel) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={15} color="var(--primary)" />
                  <span>4. Property Type *</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))", gap: "10px" }}>
                  {(["1 Room set", "2 Room set", "3 room set", "PG / Hostel"] as const).map((typeOption) => (
                    <button
                      key={typeOption}
                      type="button"
                      onClick={() => setPropertyType(typeOption)}
                      style={{
                        padding: "12px 10px",
                        borderRadius: "10px",
                        border: propertyType === typeOption ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                        background: propertyType === typeOption ? "var(--primary-light)" : "#FFFFFF",
                        color: propertyType === typeOption ? "var(--primary)" : "var(--text-main)",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {typeOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Price (Monthly rent in INR) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <IndianRupee size={15} color="var(--primary)" />
                  <span>5. Monthly Rent (Price in ₹) *</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 8500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  min={500}
                  required
                />
              </div>

              {/* Field: Furnishing Status (Default: No Furnished) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Home size={15} color="var(--primary)" />
                  <span>6. Furnishing Status *</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "No Furnished", value: "No" },
                    { label: "Semi-Furnished", value: "Semi" },
                    { label: "Furnished", value: "Yes" },
                  ].map((fOption) => (
                    <button
                      key={fOption.value}
                      type="button"
                      onClick={() => setFurnished(fOption.value as "No" | "Semi" | "Yes")}
                      style={{
                        padding: "11px 6px",
                        borderRadius: "10px",
                        border: furnished === fOption.value ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                        background: furnished === fOption.value ? "var(--primary-light)" : "#FFFFFF",
                        color: furnished === fOption.value ? "var(--primary)" : "var(--text-main)",
                        fontWeight: 700,
                        fontSize: "0.86rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "center",
                      }}
                    >
                      {fOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 7: Multi-Photo Upload from Phone or PC */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ImageIcon size={15} color="var(--primary)" />
                    <span>7. Property Photos (Upload several photos from phone or PC)</span>
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    {selectedPhotos.length} photo{selectedPhotos.length === 1 ? "" : "s"} selected
                  </span>
                </label>

                {/* Upload Button Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "1.5px solid #CBD5E1",
                    borderRadius: "14px",
                    padding: "24px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#F8FAFC",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "#FFF7ED";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#CBD5E1";
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    }}
                  >
                    <Upload size={22} color="var(--primary)" />
                  </div>
                  <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Tap to Select Photos from Phone or PC
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Supports JPG, PNG, WEBP (Select multiple photos at once)
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Preview Thumbnail Grid */}
                {selectedPhotos.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >
                    {selectedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          height: "80px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid var(--border-color)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Image
                          src={photo.previewUrl}
                          alt={`Uploaded photo ${idx + 1}`}
                          fill
                          sizes="90px"
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(0,0,0,0.65)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          title="Remove photo"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || isUploadingPhotos}
                style={{ padding: "14px", marginTop: "8px", fontSize: "1rem" }}
              >
                {isUploadingPhotos ? (
                  <>
                    <RotateCw className="animate-spin" size={18} />
                    <span>Uploading Photos...</span>
                  </>
                ) : loading ? (
                  <>
                    <RotateCw className="animate-spin" size={18} />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    <span>Publish Room Set</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MY LISTED ROOMS */}
        {activeTab === "listings" && (
          <div>
            {myProperties.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "44px 20px",
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <Home size={38} color="#94A3B8" style={{ margin: "0 auto 10px" }} />
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>
                  No Rooms Listed Yet
                </h4>
                <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Fill out the 5 simple fields above to list your room set in Himachal!
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "auto", display: "inline-flex", padding: "10px 20px" }}
                  onClick={() => setActiveTab("create")}
                >
                  <PlusCircle size={16} />
                  <span>Add Your First Room</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myProperties.map((prop) => (
                  <div
                    key={prop.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      background: "#FFFFFF",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "64px",
                          height: "54px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                          background: "#E2E8F0",
                          flexShrink: 0,
                        }}
                      >
                        {(prop.coverThumb || prop.photos?.[0] || (prop as any).images?.[0]) && (
                          <Image
                            src={prop.coverThumb || prop.photos?.[0] || (prop as any).images?.[0]}
                            alt={prop.title}
                            fill
                            sizes="64px"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        )}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h4 style={{ fontSize: "0.98rem", fontWeight: 700 }}>
                            {prop.propertyType || "Room Set"} in {prop.city}
                          </h4>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              background:
                                prop.status === "published"
                                  ? "#DCFCE7"
                                  : prop.status === "rented"
                                  ? "#DBEAFE"
                                  : "#F3F4F6",
                              color:
                                prop.status === "published"
                                  ? "#166534"
                                  : prop.status === "rented"
                                  ? "#1E40AF"
                                  : "#4B5563",
                            }}
                          >
                            {prop.status}
                          </span>
                        </div>

                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          <MapPin size={12} style={{ display: "inline", verticalAlign: "-2px" }} />{" "}
                          {prop.locality} •{" "}
                          <strong style={{ color: "var(--text-main)" }}>
                            ₹{prop.monthlyRent.toLocaleString("en-IN")}/mo
                          </strong>{" "}
                          • Contact: {prop.ownerPhone}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(prop)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          background: "#F8FAFC",
                          cursor: "pointer",
                        }}
                      >
                        {prop.status === "published" ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteListing(prop.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #FCA5A5",
                          background: "#FEF2F2",
                          color: "#DC2626",
                          cursor: "pointer",
                        }}
                        title="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
