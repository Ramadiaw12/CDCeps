# ============================================================
# backend/Dockerfile
# Image Docker pour le serveur Node.js
# On part de l'image officielle Node.js version 20
# ============================================================

# Image de base légère
FROM node:20-alpine

# Installe pnpm globalement
RUN npm install -g pnpm

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie d'abord les fichiers de dépendances
# pour profiter du cache Docker
COPY package.json pnpm-lock.yaml ./

# Installe les dépendances
RUN pnpm install

# Copie tout le reste du code
COPY . .

# Expose le port du serveur Node.js
EXPOSE 3001

# Lance le serveur en mode production
CMD ["node", "server.js"]