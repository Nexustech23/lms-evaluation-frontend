import path from "node:path";
import { fileURLToPath } from "node:url";

import createNextIntlPlugin from "next-intl/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained .next/standalone bundle (server + only the
  // node_modules actually traced as used). Smaller Docker image and faster
  // container cold-start; no runtime behaviour change. Deploy runs
  // `node .next/standalone/server.js` with .next/static + public copied in.
  output: "standalone",

  // Pin the tracing root to this project. Without it Next walks up and finds
  // an unrelated lockfile (C:\Users\vc964\package-lock.json), which makes dev
  // HMR and standalone file tracing slower/wrong.
  outputFileTracingRoot: __dirname,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.aceternity.com" },
    ],
  },

  // Next 16 no longer reads `eslint` from next.config.mjs; the key is
  // removed. Run `npx next lint`/ESLint separately.

  experimental: {
    // Next's rewrite proxy defaults to a 10MB request body cap, which silently
    // truncates larger course-material uploads before they reach FastAPI,
    // causing the backend to drop the connection (ECONNRESET / "socket hang up").
    proxyClientMaxBodySize: "50mb",
  },

  async rewrites() {
    // `uvicorn app.main:app --reload` listens on 8000 by default — keep the
    // fallback in sync with that so local dev works even without .env.
    const API_URL = process.env.API_URL || "http://127.0.0.1:8000";
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
      // All other API calls: strips /api prefix — non-prefixed backend
      // routers are mounted at root.
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },

};

export default withNextIntl(nextConfig);
