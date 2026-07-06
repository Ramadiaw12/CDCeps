# ============================================================
# php-admin/Dockerfile
# Image Docker pour l'interface PHP admin
# ============================================================

# ============================================================
# 1. IMAGE DE BASE - PHP avec Apache
# ============================================================
# On utilise l'image officielle PHP 8.3 avec Apache intégré.
# Apache est plus performant que le serveur intégré de PHP.
# ============================================================
FROM php:8.3-apache

# 2. INSTALLATION DES EXTENSIONS PHP

RUN docker-php-ext-install pdo pdo_pgsql pgsql

# 
# 3. INSTALLATION DES DÉPENDANCES SYSTÈME
# 
#   - libpq-dev : PostgreSQL client
#   - curl      : pour les appels à l'API Node.js
# 
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install curl \
    && rm -rf /var/lib/apt/lists/*

# 
# 4. ACTIVATION DE mod_rewrite (pour Apache)
# 
RUN a2enmod rewrite

# 
# 5. COPIE DU CODE SOURCE
# 
WORKDIR /var/www/html
COPY . .

# 6. CONFIGURATION D'APACHE (port 8000)

RUN sed -i 's/Listen 80/Listen 8000/g' /etc/apache2/ports.conf
RUN sed -i 's/:80/:8000/g' /etc/apache2/sites-available/000-default.conf

# 
# 7. EXPOSITION DU PORT
# 
EXPOSE 8000

# 
# 8. COMMANDE DE DÉMARRAGE
# 
CMD ["apache2-foreground"]