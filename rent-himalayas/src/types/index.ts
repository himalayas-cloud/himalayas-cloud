import { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "owner" | "admin";

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type PropertyType = "1 Room set" | "2 Room set" | "3 room set" | "room" | "flat" | "pg" | "shared_room" | string;
export type ListingStatus = "draft" | "pending" | "published" | "rejected" | "rented";

export interface PropertyListing {
  id?: string;
  ownerUid: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  monthlyRent: number; // in INR
  deposit?: number;
  city: "Solan" | "Nahan" | "Shimla" | string;
  locality: string;
  addressApprox: string;
  areaSqft?: number;
  bedrooms?: number;
  furnished: "Yes" | "No" | "Semi";
  photos: string[];
  status: ListingStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ReportItem {
  id?: string;
  reportedByUid: string;
  propertyId: string;
  reason: string;
  details?: string;
  status: "open" | "resolved" | "dismissed";
  createdAt?: Timestamp;
}
