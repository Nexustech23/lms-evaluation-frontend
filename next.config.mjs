import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["assets.aceternity.com"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    const API_URL = process.env.API_URL || "http://127.0.0.1:5050";
    return [
      // Exact base path: /:path* does not match zero segments in Next.js,
      // so GET /api/self-learner/roadmap and POST /api/self-learner/roadmap
      // require this explicit rule.
      {
        source: "/api/self-learner/roadmap",
        destination: `${API_URL}/api/self-learner/roadmap`,
      },
      // Sub-paths: preserves /api prefix so Flask blueprint (/api/self-learner/roadmap) matches.
      {
        source: "/api/self-learner/roadmap/:path*",
        destination: `${API_URL}/api/self-learner/roadmap/:path*`,
      },
      // All other API calls: strips /api prefix — non-roadmap Flask routes have no /api prefix.
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:5050/"}/:path*`,
        // destination: `${process.env.API_URL || "http://103.192.198.186:5050/"}/:path*`,
        destination: `${API_URL}/:path*`,

      },
    ];
  },

};

export default withNextIntl(nextConfig);
