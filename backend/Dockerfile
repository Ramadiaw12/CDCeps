# ============================================================
# backend/Dockerfile
# Image Docker pour le serveur Node.js (backend CDCEPS)
# 
# But : Conteneuriser l'API Node.js avec toutes ses dépendances
#       pour faciliter le déploiement et l'exécution en production.
# ============================================================

# ============================================================
# 1. IMAGE DE BASE
# ============================================================
# On utilise l'image officielle Node.js en version 20 sur Alpine Linux.
# Alpine est une distribution Linux ultra-légère (~5 Mo) idéale pour Docker.
# ============================================================
FROM node:20-alpine

# ============================================================
# 2. INSTALLATION DE PNPM
# ============================================================
# Pnpm est plus rapide et efficace que npm pour l'installation des dépendances.
# Il utilise un système de "hard links" pour partager les paquets entre projets.
# ============================================================
RUN npm install -g pnpm

# ============================================================
# 3. RÉPERTOIRE DE TRAVAIL
# ============================================================
# On définit /app comme répertoire de travail à l'intérieur du conteneur.
# Toutes les commandes suivantes seront exécutées depuis ce dossier.
# ============================================================
WORKDIR /app

# ============================================================
# 4. COPIE DES FICHIERS DE DÉPENDANCES
# ============================================================
# On copie d'abord package.json et pnpm-lock.yaml.
# Cette étape est optimisée pour profiter du cache Docker :
#   - Si les fichiers de dépendances n'ont pas changé, Docker réutilise le cache.
#   - Cela évite de réinstaller toutes les dépendances à chaque build.
# ============================================================
COPY package.json pnpm-lock.yaml ./

# ============================================================
# 5. INSTALLATION DES DÉPENDANCES
# ============================================================
# On installe les dépendances avec pnpm.
#   - --frozen-lockfile : vérifie que pnpm-lock.yaml est à jour.
#   - --prod : installe uniquement les dépendances de production (optionnel).
# ============================================================
RUN pnpm install --frozen-lockfile

# ============================================================
# 6. COPIE DU CODE SOURCE
# ============================================================
# On copie tout le reste du code source dans le conteneur.
# Cette étape est placée après l'installation des dépendances pour optimiser le cache.
# ============================================================
COPY . .

# ============================================================
# 7. INSTALLATION DES DÉPENDANCES SYSTÈME POUR PUPPETEER
# ============================================================
# Puppeteer a besoin de Chromium pour générer les PDF.
# Sur Alpine Linux, il faut installer les paquets système nécessaires.
# ============================================================
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# ============================================================
# 8. VARIABLES D'ENVIRONNEMENT POUR PUPPETEER
# ============================================================
# On indique à Puppeteer le chemin du binaire Chromium installé.
# Cela évite qu'il ne télécharge son propre Chromium à chaque exécution.
# ============================================================
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# ============================================================
# 9. EXPOSITION DU PORT
# ============================================================
# Le serveur Node.js écoute sur le port 3001.
# On expose ce port pour que le conteneur puisse recevoir des requêtes.
# ============================================================
EXPOSE 3001

# ============================================================
# 10. COMMANDE DE DÉMARRAGE
# ============================================================
# On lance le serveur en mode production.
# En développement, on pourra utiliser "pnpm dev" en écrasant cette commande.
# ============================================================
CMD ["node", "server.js"]