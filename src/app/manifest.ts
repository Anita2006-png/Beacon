import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beacon — Digital Health Passport",
    short_name: "Beacon",
    description:
      "Store your critical medical information and share it safely in an emergency.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f1",
    theme_color: "#0d9488",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    categories: ["health", "medical", "utilities"],
  };
}
