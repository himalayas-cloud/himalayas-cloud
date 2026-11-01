"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  AuthError,
  GoogleAuthProvider,
  linkWithPopup,
  linkWithCredential,
  AuthCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { UserProfile } from "@/types";

const CACHE_PROFILE_KEY = "rh_user_profile_cache";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  isGoogleLinked: boolean;
  isPasswordLinked: boolean;
  clearError: () => void;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (newName: string) => Promise<void>;
  updateProfileData: (updates: { displayName?: string; phoneNumber?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Synchronously hydrate profile from localStorage so it renders instantly on page load
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_PROFILE_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingGoogleCred, setPendingGoogleCred] = useState<AuthCredential | null>(null);

  const clearError = () => {
    setAuthError(null);
  };

  const isGoogleLinked = Boolean(user?.providerData?.some((p) => p.providerId === "google.com"));
  const isPasswordLinked = Boolean(user?.providerData?.some((p) => p.providerId === "password"));

  // Helper to map Firebase errors to clear, user-friendly messages
  const parseAuthError = (err: unknown): string => {
    const error = err as AuthError;
    if (!error.code) return error.message || "An unexpected error occurred.";
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password. Please verify your credentials.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists. Please log in instead.";
      case "auth/account-exists-with-different-credential":
        return "An account with this email already exists with password. Please sign in with your password to link your Google account.";
      case "auth/credential-already-in-use":
        return "This Google account is already linked to another user account.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      case "auth/unauthorized-domain":
        return "This website domain is not authorized in Firebase Console. Please add your Vercel domain to Firebase Console -> Authentication -> Settings -> Authorized domains.";
      case "permission-denied":
        return "Permission denied by Firestore Security Rules.";
      default:
        return error.message;
    }
  };

  // Sync or create user profile in Firestore (with automatic email-based profile inheritance)
  const syncUserProfile = async (firebaseUser: User, explicitName?: string) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // If user signs in with Google after email/password (or vice-versa), inherit existing profile
        let inheritedData: Partial<UserProfile> = {};
        if (firebaseUser.email) {
          try {
            const q = query(
              collection(db, "users"),
              where("email", "==", firebaseUser.email)
            );
            const existingSnap = await getDocs(q);
            if (!existingSnap.empty) {
              const oldData = existingSnap.docs[0].data() as UserProfile;
              inheritedData = {
                displayName: oldData.displayName,
                phoneNumber: oldData.phoneNumber,
                photoURL: oldData.photoURL,
                role: oldData.role || "user",
              };
            }
          } catch (e) {
            console.warn("Could not query existing profile by email:", e);
          }
        }

        const newProfileData: Record<string, unknown> = {
          uid: firebaseUser.uid,
          displayName: explicitName || inheritedData.displayName || firebaseUser.displayName || null,
          email: firebaseUser.email || null,
          phoneNumber: inheritedData.phoneNumber || firebaseUser.phoneNumber || null,
          photoURL: inheritedData.photoURL || firebaseUser.photoURL || null,
          role: inheritedData.role || "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfileData);
      } else {
        await updateDoc(userRef, {
          updatedAt: serverTimestamp(),
          ...(firebaseUser.displayName && { displayName: firebaseUser.displayName }),
          ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
          ...(firebaseUser.phoneNumber && { phoneNumber: firebaseUser.phoneNumber }),
        });
      }
    } catch (err) {
      console.error("Error syncing profile to Firestore:", err);
    }
  };

  // Listen to Auth State and Firestore Profile document
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError(null);

      if (currentUser) {
        // Sync to Firestore
        await syncUserProfile(currentUser);

        // Real-time snapshot listener on user's profile
        const userRef = doc(db, "users", currentUser.uid);
        unsubscribeProfile = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile(data);
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem(CACHE_PROFILE_KEY, JSON.stringify(data));
                } catch {}
              }
            }
          },
          (err) => {
            console.error("Firestore snapshot error:", err);
          }
        );
      } else {
        setProfile(null);
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(CACHE_PROFILE_KEY);
          } catch {}
        }
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // 1. Email/Password Signup
  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user && name) {
        await updateFirebaseProfile(res.user, { displayName: name });
        await syncUserProfile(res.user, name);
      }
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Email/Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      // If there was a pending Google credential from a previous attempt, link it now
      if (pendingGoogleCred && res.user) {
        try {
          await linkWithCredential(res.user, pendingGoogleCred);
          setPendingGoogleCred(null);
          await syncUserProfile(res.user);
        } catch (linkErr) {
          console.warn("Could not automatically link pending Google credential:", linkErr);
        }
      }
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Google Sign-In
  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code === "auth/account-exists-with-different-credential") {
        const cred = GoogleAuthProvider.credentialFromError(err);
        if (cred) setPendingGoogleCred(cred);
        const emailHint = err.customData?.email || "your email";
        const msg = `An account for ${emailHint} already exists with password. Please sign in with your email & password to link your Google account.`;
        setAuthError(msg);
        throw new Error(msg);
      }
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3b. One-Click Link Google Account (when already logged in with email/password)
  const linkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error("User must be logged in to link account.");
    setLoading(true);
    setAuthError(null);
    try {
      const res = await linkWithPopup(auth.currentUser, googleProvider);
      setUser(res.user);
      await syncUserProfile(res.user);
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Sign Out
  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(CACHE_PROFILE_KEY);
        } catch {}
      }
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } catch (err) {
      setAuthError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 5. Update Profile Data (Name, Phone Number, Avatar URL)
  const updateProfileData = async (updates: {
    displayName?: string;
    phoneNumber?: string;
    photoURL?: string;
  }) => {
    if (!user) throw new Error("User must be logged in.");
    setLoading(true);
    setAuthError(null);
    try {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName !== undefined) authUpdates.displayName = updates.displayName;
      // Firebase Auth photoURL attribute has a strict 2048-char limit.
      // Data URLs are stored in Firestore users/{uid} document, which has no 2KB limit.
      if (updates.photoURL !== undefined && updates.photoURL.length < 2000 && !updates.photoURL.startsWith("data:")) {
        authUpdates.photoURL = updates.photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateFirebaseProfile(user, authUpdates);
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      setProfile((prev) => {
        const next = prev ? { ...prev, ...updates } : null;
        if (typeof window !== "undefined" && next) {
          try {
            localStorage.setItem(CACHE_PROFILE_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayName = async (newName: string) => {
    return updateProfileData({ displayName: newName });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        isGoogleLinked,
        isPasswordLinked,
        clearError,
        signupWithEmail,
        loginWithEmail,
        loginWithGoogle,
        linkGoogleAccount,
        logout,
        updateDisplayName,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
