import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://oja-invoice.vercel.app";

// Only the marketing/onboarding pages are meant for crawlers — everything
// past onboarding is per-seller session state or a buyer-facing payment/
// receipt page tied to a specific invoice, none of which is useful (or
// appropriate) to index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/onboarding"],
      disallow: ["/chat", "/dashboard", "/review", "/share", "/receipt/", "/paid/", "/api/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
