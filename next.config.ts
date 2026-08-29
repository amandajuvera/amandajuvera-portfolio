import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The workspace lived at /v2 while it was being built alongside the old
  // editorial site. It's the site itself now, so keep the old path working
  // for anything already linking to it.
  async redirects() {
    return [{ source: "/v2", destination: "/", permanent: true }];
  },
};

export default nextConfig;
