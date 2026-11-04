"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";

type ProfileAvatarProps = {
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  isLoggedIn: boolean;
  isLoading?: boolean;
  size?: number;
  onAvatarClick?: () => void;
  onLoginClick?: () => void;
};

export function getInitial(displayName?: string | null, email?: string | null) {
  const source = displayName?.trim() || email?.trim() || "";
  return source ? source.charAt(0).toUpperCase() : "U";
}

export default function ProfileAvatar({
  photoURL,
  displayName,
  email,
  isLoggedIn,
  isLoading = false,
  size = 36,
  onAvatarClick,
  onLoginClick,
}: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = Boolean(photoURL) && !imageFailed;
  const initial = getInitial(displayName, email);

  if (isLoading) {
    return (
      <div className="header-profile-corner">
        <div
          className="avatar-skeleton"
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="header-profile-corner">
        <button
          type="button"
          className="user-login-only-btn"
          onClick={onLoginClick}
          title="Login or Sign Up"
          aria-label="Login or Sign Up"
          style={{ width: size, height: size }}
        >
          <UserIcon size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="header-profile-corner">
      <button
        type="button"
        className="user-avatar-only-btn"
        onClick={onAvatarClick}
        title="Click to view & edit your profile"
        aria-label="Open profile"
      >
        <span
          className={`user-avatar-circle ${showPhoto ? "has-photo" : ""}`}
          style={{ width: size, height: size, fontSize: size * 0.42 }}
        >
          {showPhoto ? (
            <img
              src={photoURL as string}
              alt={displayName || "Profile photo"}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span aria-hidden="true">{initial}</span>
          )}
        </span>
      </button>
    </div>
  );
}

