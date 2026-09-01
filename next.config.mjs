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

  experimental: {
    // Next's rewrite proxy defaults to a 10MB request body cap, which silently
    // truncates larger course-material uploads before they reach FastAPI,
    // causing the backend to drop the connection (ECONNRESET / "socket hang up").
    proxyClientMaxBodySize: "50mb",
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
      // Self-learner course material upload (roadmap-creation grounding) —
      // its own router is registered WITH an /api/self-learner/course-material
      // prefix, same reasoning as the roadmap rule above. Exact base path
      // needed too: POST /api/self-learner/course-material has zero extra
      // segments, which :path* does not match on its own.
      {
        source: "/api/self-learner/course-material",
        destination: `${API_URL}/api/self-learner/course-material`,
      },
      {
        source: "/api/self-learner/course-material/:path*",
        destination: `${API_URL}/api/self-learner/course-material/:path*`,
      },
      // ai_tutor.py's router is also registered WITH an /api/ai-tutor prefix
      // (unlike most other routers, which mount at root) — same reasoning
      // as the roadmap rule above, must come before the generic catch-all.
      {
        source: "/api/ai-tutor/:path*",
        destination: `${API_URL}/api/ai-tutor/:path*`,
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
