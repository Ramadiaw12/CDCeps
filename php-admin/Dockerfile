# ============================================================
# php-admin/Dockerfile
# Image Docker pour l'interface PHP admin
# ============================================================

FROM php:8.3-cli

# Installe les extensions PHP nécessaires
RUN docker-php-ext-install pdo pdo_mysql

# Installe curl pour les appels à l'API Node.js
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    && docker-php-ext-install curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

EXPOSE 8080

# Lance le serveur PHP intégré
CMD ["php", "-S", "0.0.0.0:8080", "index.php"]