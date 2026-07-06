# ============================================================
# frontend/Dockerfile
# Image Docker pour le frontend React avec pnpm
# Build en deux étapes : build → serveur nginx
# ============================================================

# ============================================================
# ÉTAPE 1 : Build de l'application React
# ============================================================
FROM node:20-alpine AS builder

# Installer pnpm globalement
RUN npm install -g pnpm

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec pnpm
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build la version de production
RUN pnpm build

# ============================================================
# ÉTAPE 2 : Serveur nginx pour servir les fichiers statiques
# ============================================================
FROM nginx:alpine

# Copier les fichiers buildés depuis l'étape builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]