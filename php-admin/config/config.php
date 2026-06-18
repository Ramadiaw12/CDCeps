<?php
// ============================================================
// config/config.php
// Configuration générale de l'interface PHP admin
// ============================================================


// config/config.php
// ✅ Configuration PostgreSQL

// Base de données
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');          // Port PostgreSQL
define('DB_NAME', 'rag_db');
define('DB_USER', 'cdcuser');
define('DB_PASSWORD', 'votre_mot_de_passe');

// API Node.js (pour le RAG)
define('API_URL', 'http://localhost:3001/api');

// Autres configurations
define('SITE_NAME', 'CDCEPS - Gestion CDC');
define('UPLOAD_DIR', __DIR__ . '/../uploads/');