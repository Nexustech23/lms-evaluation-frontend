FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm i

# Copy source
COPY . .

# next.config.mjs's rewrites() resolves process.env.API_URL once, at build
# time, and freezes the result into .next/routes-manifest.json — a runtime
# env var set later (e.g. via docker-compose env_file) can't change it.
# Must be supplied as a build arg so it's present during `npm run build`.
ARG API_URL
ENV API_URL=$API_URL

# Build Next.js app
RUN npm run build


# ---------- Production stage ----------
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy only required files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "run", "start"]