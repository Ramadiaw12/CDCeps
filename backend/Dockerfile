# ============================================================
# backend/Dockerfile
# Image Docker pour le serveur Node.js
# On part de l'image officielle Node.js version 20
# ============================================================


FROM node:22-alpine

# Installer les dépendances système (pour Puppeteer)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Variables d'environnement pour Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Créer le dossier de l'application
WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "run", "dev"]