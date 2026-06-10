import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy route from the "Owner Command Center Lite" era — the offer is
      // now the Managed AI Workspace (client-owned tools, not a platform).
      {
        source: "/command-center",
        destination: "/managed-workspace",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
