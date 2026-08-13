// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc", // For testimonial avatars
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // For course thumbnails
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // 👈 ADD THIS for Google Profile Pics
      },
    ],
  },
};

export default nextConfig;
