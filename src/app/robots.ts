import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/admin/", "/api/revalidate"],
      },
    ],
    sitemap: "https://renthimalayas.com/sitemap.xml",
  };
}

