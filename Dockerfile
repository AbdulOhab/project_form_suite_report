# Single-image build for the whole app: build the React SPA, then run it from
# the Express server (same origin — the API and the SPA share one container).

# ---------- Stage 1: build the React client ----------
FROM node:22-bookworm-slim AS client-build
WORKDIR /client

# Empty API base URL => the SPA calls the API on its own origin (relative URLs),
# which is exactly where Express serves it from in the final image.
ENV REACT_APP_API_BASE_URL=""
ENV NODE_OPTIONS=--max-old-space-size=4096

COPY client-side/package.json client-side/package-lock.json ./
RUN npm ci
COPY client-side/ ./
RUN npm run build

# ---------- Stage 2: install server deps (compiles native bcrypt) ----------
FROM node:22-bookworm-slim AS server-deps
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY server-side/package.json server-side/package-lock.json ./
RUN npm ci --omit=dev

# ---------- Stage 3: runtime ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5053
# Where the server looks for the built SPA (see server-side/index.js).
ENV CLIENT_BUILD_PATH=/app/public

# Server dependencies and application code.
COPY --from=server-deps /app/node_modules ./node_modules
COPY server-side/ ./

# The built SPA, served as static files by Express.
COPY --from=client-build /client/build ./public

# Multer writes uploaded CSVs here (server-side/router/routes/usersCreateUpdateRoutes.js).
RUN mkdir -p /app/uploads

EXPOSE 5053
CMD ["node", "index.js"]
