"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";

interface PropertyImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
  aspectRatio?: string;
}

export default function PropertyImageCarousel({
  images,
  title,
  className = "",
  aspectRatio = "4 / 3",
}: PropertyImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const validImages = images && images.length > 0 ? images : ["/placeholder.svg"];
  const total = validImages.length;

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(index, total - 1));
    const targetLeft = clamped * container.clientWidth;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
    setCurrentIndex(clamped);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToIndex(currentIndex - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToIndex(currentIndex + 1);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToIndex(index);
  };

  // Sync index when user swipes on mobile / trackpad
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || container.clientWidth === 0) return;
    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < total) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div
      className={`property-carousel-root ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        overflow: "hidden",
        borderRadius: "inherit",
        backgroundColor: "#E2E8F0",
      }}
    >
      {/* Scrollable Snap Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {validImages.map((src, i) => (
          <div
            key={i}
            style={{
              flex: "0 0 100%",
              width: "100%",
              height: "100%",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              position: "relative",
            }}
          >
            <img
              src={src}
              alt={`${title} - Photo ${i + 1}`}
              width={480}
              height={360}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Desktop Prev / Next Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous photo"
            style={{
              position: "absolute",
              top: "50%",
              left: "8px",
              transform: "translateY(-50%)",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#1E293B",
              border: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              opacity: isHovered && currentIndex > 0 ? 1 : 0,
              pointerEvents: isHovered && currentIndex > 0 ? "auto" : "none",
              transition: "opacity 0.2s ease, transform 0.15s ease",
              zIndex: 3,
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            aria-label="Next photo"
            style={{
              position: "absolute",
              top: "50%",
              right: "8px",
              transform: "translateY(-50%)",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#1E293B",
              border: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentIndex === total - 1 ? "not-allowed" : "pointer",
              opacity: isHovered && currentIndex < total - 1 ? 1 : 0,
              pointerEvents: isHovered && currentIndex < total - 1 ? "auto" : "none",
              transition: "opacity 0.2s ease, transform 0.15s ease",
              zIndex: 3,
            }}
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Slide Dots Indicator */}
      {total > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            zIndex: 3,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            padding: "3px 7px",
            borderRadius: "999px",
            pointerEvents: "auto",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {validImages.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              aria-label={`Go to photo ${dotIdx + 1}`}
              onClick={(e) => handleDotClick(e, dotIdx)}
              style={{
                width: dotIdx === currentIndex ? "14px" : "5px",
                height: "5px",
                borderRadius: "999px",
                backgroundColor:
                  dotIdx === currentIndex ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Photo Counter Pill (e.g. 1/5) */}
      {total > 1 && (
        <span
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            color: "#FFFFFF",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "999px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <Camera size={11} strokeWidth={2.4} />
          <span>
            {currentIndex + 1}/{total}
          </span>
        </span>
      )}
    </div>
  );
}

