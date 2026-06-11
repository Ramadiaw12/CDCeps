# ============================================================
# frontend/Dockerfile
# Image Docker pour le frontend React
# Build en deux étapes : build puis serve
# ============================================================

#  Étape 1 : Build de l'application React 
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Build la version de production
RUN pnpm build

#  Étape 2 : Serveur nginx pour servir les fichiers 
FROM nginx:alpine

# Copie les fichiers buildés vers nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]