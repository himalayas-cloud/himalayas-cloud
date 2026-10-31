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
} from "@/lib/properties";
import { getSafeCoordinates, parseValidCoordinates, CITY_BASE_COORDINATES } from "@/lib/localities";
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
        border: "1px dashed #CBD5E1",
        marginTop: "10px",
      }}
    >
      <span>🗺️ Loading Pinpoint Map...</span>
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
  const [permissionError, setPermissionError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Simplified Form State (Only the 5 required fields + Photos)
  const [ownerName, setOwnerName] = useState(displayName || user.displayName || "");
  const [ownerPhone, setOwnerPhone] = useState(user.phoneNumber || "");
  const [city, setCity] = useState<"Solan" | "Nahan" | "Shimla">("Solan");
  const [locationDetails, setLocationDetails] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const [propertyType, setPropertyType] = useState<"1 Room set" | "2 Room set" | "3 room set">("1 Room set");
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
  }, [isOpen, user.uid]);

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
    try {
      // 1. Upload photos from phone/PC
      const photoUrls = await uploadAllPhotos();

      // 2. Title generated cleanly from property type and city/locality
      const generatedTitle = `${propertyType} for Rent in ${city} (${locationDetails.trim()})`;

      // Always guaranteed valid coordinates [lat, lng] — never undefined or NaN!
      const safeCoordinates = parseValidCoordinates(
        selectedCoordinates,
        city,
        locationDetails.trim()
      );

      // 3. Save to Cloud Firestore
      await createPropertyListing({
        ownerUid: user.uid,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerEmail: user.email || undefined,
        title: generatedTitle,
        description: `${propertyType} available for rent in ${locationDetails.trim()}, ${city}. Contact owner directly for visit and details.`,
        propertyType,
        monthlyRent: Number(price),
        city,
        locality: locationDetails.trim(),
        addressApprox: `${locationDetails.trim()}, ${city}`,
        furnished: furnished === "Yes" ? "Furnished" : furnished === "Semi" ? "Semi-Furnished" : "No Furnished",
        photos: photoUrls,
        status: "published",
        coordinates: safeCoordinates,
      });

      setSuccessMsg("🎉 Your room has been published successfully and is now live on Rent Himalayas!");
      
      // Reset form
      setLocationDetails("");
      setSelectedCoordinates(null);
      setPrice("");
      setFurnished("No");
      setSelectedPhotos([]);
      
      // Switch to listings tab after a brief delay
      setTimeout(() => {
        setActiveTab("listings");
        setSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.error("Listing creation error:", err);
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
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog animate-slide-down"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px", maxHeight: "92vh" }}
      >
        <button className="modal-close-btn" onClick={onClose}>
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
              padding: "14px 16px",
              marginBottom: "16px",
              color: "#92400E",
              fontSize: "0.88rem",
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, marginBottom: "4px" }}>
              <AlertTriangle size={18} color="#D97706" />
              <span>Action Required in Firebase Console: Publish Security Rules</span>
            </div>
            <p style={{ margin: "4px 0" }}>
              Your Firestore Database is currently blocking requests because the production rules have not been published in the console yet.
            </p>
            <ol style={{ paddingLeft: "20px", marginTop: "6px", fontSize: "0.84rem" }}>
              <li>Open <strong>Firebase Console ➔ Firestore Database ➔ Rules</strong> tab.</li>
              <li>Replace existing content with:
                <pre style={{ background: "#FDE68A", padding: "6px", borderRadius: "6px", marginTop: "4px", fontSize: "0.78rem" }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                </pre>
              </li>
              <li>Click <strong>Publish</strong>. Once published, your listings will load immediately!</li>
            </ol>
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

              {/* Field 3: Proper Location (City + Address + Online Geocoding + Pinpoint Map) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>3. Proper Location & Locality *</span>
                  </span>
                  {(selectedCoordinates || (locationDetails.trim() ? getSafeCoordinates(locationDetails.trim(), city) : null)) && (
                    <span style={{ fontSize: "0.76rem", color: "#166534", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Check size={13} color="#166534" /> Pinpointed in {city} (
                      {(selectedCoordinates || getSafeCoordinates(locationDetails.trim(), city))[0].toFixed(3)}°N,{" "}
                      {(selectedCoordinates || getSafeCoordinates(locationDetails.trim(), city))[1].toFixed(3)}°E)
                    </span>
                  )}
                </label>
                
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px" }}>
                  <select
                    className="filter-select"
                    value={city}
                    onChange={(e) => {
                      const newCity = e.target.value as "Solan" | "Nahan" | "Shimla";
                      setCity(newCity);
                      setSelectedCoordinates(CITY_BASE_COORDINATES[newCity] || CITY_BASE_COORDINATES["Nahan"]);
                    }}
                  >
                    <option value="Solan">Solan</option>
                    <option value="Nahan">Nahan</option>
                    <option value="Shimla">Shimla</option>
                  </select>

                  <div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Location / Address (e.g. Near Jain Mandir, Naya Bazar)"
                      value={locationDetails}
                      onChange={(e) => setLocationDetails(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Interactive Pinpoint Map - Pinpoint manually or by enabling GPS location */}
                <div style={{ marginTop: "12px" }}>
                  <MiniLocationPicker
                    coordinates={selectedCoordinates || parseValidCoordinates(null, city, locationDetails.trim())}
                    onCoordinatesChange={(coords) => setSelectedCoordinates(coords)}
                    localityLabel={locationDetails || city}
                  />
                </div>
              </div>

              {/* Field 4: Property Type (1 Room set, 2 Room set, 3 room set) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={15} color="var(--primary)" />
                  <span>4. Property Type *</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {(["1 Room set", "2 Room set", "3 room set"] as const).map((typeOption) => (
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
                    border: "2px dashed var(--primary-border)",
                    borderRadius: "12px",
                    padding: "24px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "var(--primary-light)",
                    transition: "all 0.2s",
                  }}
                >
                  <Upload size={28} color="var(--primary)" style={{ margin: "0 auto 8px" }} />
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
                  padding: "40px 20px",
                  background: "#F8FAFC",
                  borderRadius: "12px",
                  border: "2px dashed var(--border-color)",
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
                        {prop.photos?.[0] && (
                          <Image
                            src={prop.photos[0]}
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
  );
}
