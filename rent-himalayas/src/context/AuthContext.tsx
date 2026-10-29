"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile as updateFirebaseProfile,
  AuthError,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  clearError: () => void;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  setupRecaptcha: (elementId: string) => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, verifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (newName: string) => Promise<void>;
  testAdminPrivilegeEscalation: () => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = () => setAuthError(null);

  // Helper to map Firebase errors to clear, beginner-friendly messages
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
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/invalid-phone-number":
        return "Invalid phone number format. Please include country code (e.g., +91 99999 99999).";
      case "auth/code-expired":
        return "The OTP code has expired. Please request a new one.";
      case "auth/invalid-verification-code":
        return "Incorrect OTP code. Please check and try again.";
      case "auth/quota-exceeded":
        return "SMS quota exceeded. Please use the configured test phone number for development (+91 99999 99999).";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      case "permission-denied":
        return "Permission denied by Firestore Security Rules.";
      default:
        return error.message;
    }
  };

  // Sync or create user profile in Firestore
  const syncUserProfile = async (firebaseUser: User, explicitName?: string) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newProfileData: Record<string, unknown> = {
          uid: firebaseUser.uid,
          displayName: explicitName || firebaseUser.displayName || null,
          email: firebaseUser.email || null,
          phoneNumber: firebaseUser.phoneNumber || null,
          photoURL: firebaseUser.photoURL || null,
          role: "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfileData);
      } else {
        await updateDoc(userRef, {
          updatedAt: serverTimestamp(),
          // update displayName or photo if they changed in provider
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
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        }, (err) => {
          console.error("Firestore snapshot error:", err);
        });
      } else {
        setProfile(null);
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
      await signInWithEmailAndPassword(auth, email, pass);
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
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Setup Recaptcha for Phone Auth
  const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
    if (typeof window === "undefined") {
      throw new Error("Recaptcha can only be initialized on the client side.");
    }
    // Clear any existing recaptcha widget
    const container = document.getElementById(elementId);
    if (container) container.innerHTML = "";

    const verifier = new RecaptchaVerifier(auth, elementId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        setAuthError("reCAPTCHA expired. Please retry.");
      },
    });
    return verifier;
  };

  // 5. Send Phone OTP
  const sendPhoneOtp = async (phoneNumber: string, verifier: RecaptchaVerifier) => {
    setLoading(true);
    setAuthError(null);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      return confirmationResult;
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 6. Verify Phone OTP
  const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await confirmationResult.confirm(otp);
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 7. Sign Out
  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } catch (err) {
      setAuthError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 8. Update Display Name
  const updateDisplayName = async (newName: string) => {
    if (!user) throw new Error("User must be logged in.");
    setLoading(true);
    setAuthError(null);
    try {
      await updateFirebaseProfile(user, { displayName: newName });
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: newName,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      const msg = parseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 9. Security Rule Verification Test: Attempt Admin Escalation
  // This verifies that Firestore Security Rules actively reject unauthorized role modifications.
  const testAdminPrivilegeEscalation = async () => {
    if (!user) return { success: false, message: "Please log in first to test security rules." };
    try {
      const userRef = doc(db, "users", user.uid);
      // Attempt to maliciously escalate role to admin
      await updateDoc(userRef, {
        role: "admin",
      });
      return {
        success: false,
        message: "SECURITY WARNING: Privilege escalation succeeded! Rules need hardening.",
      };
    } catch (err) {
      return {
        success: true,
        message: "PASSED: Firestore Security Rules blocked the admin escalation attempt (" + (err as Error).message + ").",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
