# =============================================================================
#  API Express – Dockerfile multi-étapes
#   - cible « dev »  : utilisée par docker-compose (rechargement automatique tsx)
#   - cible « prod » : image légère, JavaScript compilé, utilisateur non-root
# =============================================================================

# ---------- base : Node + Chromium (génération PDF par Puppeteer) ----------
FROM node:20-alpine AS base
# Chromium + polices (accents, symboles ✉ ☎) pour le rendu des CV
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-liberation font-noto \
    && { [ -e /usr/bin/chromium-browser ] || ln -s /usr/bin/chromium /usr/bin/chromium-browser; }
# puppeteer-core n'a pas besoin de télécharger son propre Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /app

# ---------- dev ----------
FROM base AS dev
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Mode développement (rechargement automatique avec tsx)
CMD ["npm", "run", "dev"]

# ---------- build ----------
FROM dev AS build
RUN npm run build && npm prune --omit=dev

# ---------- prod ----------
FROM base AS prod
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "dist/index.js"]
