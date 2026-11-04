import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Calendar, Clock, MapPin, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Rental Guides | Rent Himalayas",
  description:
    "Expert rental tips, cost of living guides, and student accommodation advice for Nahan, Solan, and Shimla in Himachal Pradesh.",
};

const BLOG_POSTS = [
  {
    slug: "guide-to-renting-rooms-in-sirmaur-nahan",
    title: "Complete Guide to Renting a Room or Flat in Sirmaur & Nahan",
    summary:
      "Everything you need to know about water supply, road accessibility, average rents in Gunnu Ghat & Ranital, and zero-brokerage owner contacts.",
    district: "Sirmaur",
    readTime: "5 min read",
    date: "November 2026",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "student-pg-flats-near-shoolini-university-solan",
    title: "Best Areas to Rent PGs & 1BHKs Near Shoolini University & Solan Town",
    summary:
      "A student's breakdown of Oachghat, Chambaghat, and Mall Road rentals, including mess facilities, WiFi availability, and budget options.",
    district: "Solan",
    readTime: "6 min read",
    date: "October 2026",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "shimla-rental-market-sanjauli-ridge-kasumpti",
    title: "Living in Shimla: Comparing Rentals in Sanjauli, Kasumpti & Chotta Shimla",
    summary:
      "Finding sun-facing warm rooms, managing heating costs during winter, and public transit connectivity to The Ridge and Mall Road.",
    district: "Shimla",
    readTime: "7 min read",
    date: "September 2026",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BlogPage() {
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
          <BookOpen size={14} />
          <span>Himalayan Rental Guides & Advice</span>
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
          Insights & Guides for Renting in Himachal Pradesh
        </h1>
        <p
          style={{
            fontSize: "1.08rem",
            color: "#64748B",
            maxWidth: "680px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Practical advice from local residents on negotiating rent, checking winter water supply,
          and finding genuine zero-brokerage landlords in Sirmaur, Solan, and Shimla.
        </p>
      </section>

      {/* Blog Cards Grid */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "20px auto 60px",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
              <img
                src={post.image}
                alt={post.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: "rgba(25, 30, 36, 0.85)",
                  backdropFilter: "blur(4px)",
                  color: "#FFFFFF",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <MapPin size={12} />
                <span>{post.district}</span>
              </div>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  fontSize: "0.78rem",
                  color: "#94A3B8",
                  marginBottom: "12px",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={13} /> {post.date}
                </span>
                <span>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={13} /> {post.readTime}
                </span>
              </div>

              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#191E24",
                  lineHeight: 1.35,
                  marginBottom: "10px",
                }}
              >
                {post.title}
              </h2>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#64748B",
                  lineHeight: 1.55,
                  marginBottom: "20px",
                  flex: 1,
                }}
              >
                {post.summary}
              </p>

              <Link
                href={`/?city=${post.district}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--primary, #F26A1B)",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                }}
              >
                <span>Browse {post.district} Rooms &rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
