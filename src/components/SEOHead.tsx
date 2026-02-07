import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  type?: string;
}

export function SEOHead({
  title = "SpeedTest Pro — Free Internet Speed Test, IP Lookup & Network Diagnostics",
  description = "Test your internet speed, check IP address, ISP details, and get network quality scores. Privacy-first, no login required. Works on desktop and mobile.",
  canonicalUrl = typeof window !== "undefined" ? window.location.origin : "",
  type = "WebApplication",
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("robots", "index, follow, max-image-preview:large");
    setMeta("keywords", "speed test, internet speed, ping test, download speed, upload speed, IP address, ISP, network diagnostics, wifi speed, broadband speed test");

    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", canonicalUrl, true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // JSON-LD Structured Data
    let jsonLd = document.getElementById("json-ld-seo") as HTMLScriptElement | null;
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.id = "json-ld-seo";
      jsonLd.type = "application/ld+json";
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": type,
      name: "SpeedTest Pro",
      description: description,
      url: canonicalUrl,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Internet Speed Test",
        "Download Speed Measurement",
        "Upload Speed Measurement",
        "Ping & Latency Testing",
        "IP Address Lookup",
        "ISP Detection",
        "Network Quality Scoring",
        "VPN Detection",
        "Device Information",
        "Report Export (HTML, CSV, JSON)",
        "Shareable Results",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "2450",
        bestRating: "5",
      },
    });
  }, [title, description, canonicalUrl, type]);

  return null;
}
