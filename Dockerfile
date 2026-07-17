# ── Stage 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances d'abord (meilleur cache Docker)
COPY package*.json ./
# --legacy-peer-deps : eslint-plugin-import n'a pas encore de release supportant eslint 10
# (eslint est un devDependency, uniquement utilisé pour `npm run lint`, pas pour `vite build`)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# URL du backend que le NAVIGATEUR utilisera (pas container-to-container)
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Builder l'app Vite → génère /app/dist
RUN npm run build

# ── Stage 2 : Servir avec Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copier le build statique
COPY --from=builder /app/dist /usr/share/nginx/html

# Config Nginx adaptée au SPA React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
