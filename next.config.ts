import type { NextConfig } from "next";

const publicR2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
const publicR2RemotePattern = publicR2Url
  ? (() => {
      const url = new URL(publicR2Url);

      return {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: `${url.pathname.replace(/\/$/, "")}/**`,
      };
    })()
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: publicR2RemotePattern ? [publicR2RemotePattern] : [],
  },
};

export default nextConfig;
