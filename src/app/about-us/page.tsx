import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Heart, Shield, Users, MapPin, Sparkles, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Rent Himalayas - Himachal's Direct Rental Marketplace",
  description:
    "Learn about Rent Himalayas, our mission to eliminate brokerage and connect tenants with verified room and flat owners across Sirmaur, Solan, and Shimla.",
};

export default function AboutUsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F3EFE9", color: "#191E24" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #E2E8F0",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#191E24",
            fontWeight: 800,
            fontSize: "1.2rem",
          }}
        >
          <Image src="/logo.png" alt="Rent Himalayas Logo" width={32} height={32} priority />
          <span>
            Rent<span style={{ color: "var(--primary, #F26A1B)" }}>Himalayas</span>
          </span>
        </Link>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--primary, #F26A1B)",
            textDecoration: "none",
            background: "#FFF4ED",
            padding: "8px 16px",
            borderRadius: "9999px",
            border: "1px solid #FFD5B8",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "50px 20px 30px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#FFF4ED",
            border: "1px solid #FFD5B8",
            color: "#DE590F",
            padding: "6px 14px",
            borderRadius: "9999px",
            fontSize: "0.82rem",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          <Sparkles size={14} />
          <span>Our Story & Mission</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          Connecting Himachal Tenants & Homeowners Directly
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#64748B",
            maxWidth: "720px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Rent Himalayas was founded with a singular purpose: simplify finding rental homes,
          flats, and student PGs across Himachal Pradesh without middlemen or commission fees.
        </p>
      </section>

      {/* Stats Cards */}
      <section
        style={{
          maxWidth: "1000px",
          margin: "20px auto 40px",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {[
          { num: "1,450+", label: "Verified Rooms & Flats", desc: "Across Sirmaur, Solan & Shimla" },
          { num: "0% Brokerage", label: "Direct Owner Connect", desc: "No agent or middleman fees" },
          { num: "3,800+", label: "Happy Tenants", desc: "Students, families & executives" },
          { num: "3 Key Districts", label: "Mountain Focus", desc: "Nahan, Solan Town & Shimla Hills" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              padding: "24px 20px",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "var(--primary, #F26A1B)",
                marginBottom: "4px",
              }}
            >
              {stat.num}
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#191E24" }}>{stat.label}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>{stat.desc}</div>
          </div>
        ))}
      </section>

      {/* Core Values */}
      <section
        style={{
          maxWidth: "1000px",
          margin: "40px auto 60px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            padding: "40px",
            borderRadius: "20px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Why We Built Rent Himalayas
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginTop: "24px",
            }}
          >
            <div style={{ display: "flex", gap: "14px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#FFF4ED",
                  color: "#F26A1B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "6px" }}>
                  Verified Local Landlords
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.5 }}>
                  Every property includes realistic coordinates, landmark directions, and genuine photos
                  of actual mountain rooms.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#FFF4ED",
                  color: "#F26A1B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "6px" }}>
                  Students & Working Professionals
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.5 }}>
                  Dedicated listings near Shoolini University, UHF Nauni, HPU Shimla, and industrial zones
                  in Baddi and Kala Amb.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#FFF4ED",
                  color: "#F26A1B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Heart size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "6px" }}>
                  Free for Everyone
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.5 }}>
                  Searching is 100% free with unlimited phone access to property owners. Listing your space
                  takes under 2 minutes.
                </p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "36px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary, #F26A1B)",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: "9999px",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(242, 106, 27, 0.35)",
              }}
            >
              <Home size={18} />
              <span>Explore Rooms in Sirmaur, Solan & Shimla</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
