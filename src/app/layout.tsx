import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Rent Himalayas | Rooms, Flats & PGs for Rent in Nahan, Solan, Shimla",
  description:
    "Find verified rental homes, 1BHK/2BHK flats, and rooms in Himachal Pradesh across Nahan, Solan, and Shimla with direct owner contact.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="6cad8032-aa4a-4078-85dd-a4985db54790"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
