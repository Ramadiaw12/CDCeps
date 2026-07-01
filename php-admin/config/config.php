<?php
// ============================================================
// config/config.php
// Configuration générale de l'interface PHP admin
// ============================================================

// 
// 1. BASE DE DONNÉES POSTGRESQL
// 
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'rag_db');
define('DB_USER', 'cdcuser');
define('DB_PASSWORD', 'cdcEPS26');

// 
// 2. API NODE.JS (pour le RAG)
// 
define('API_URL', 'http://localhost:3001/api');

// 
// 3. INFORMATIONS GÉNÉRALES
// 
define('SITE_NAME', 'CDCEPS - Gestion CDC');
define('APP_NAME', 'CDCEPS');
define('COMPANY_NAME', 'EPS SARL');

// 
// 4. CHEMINS
// 
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('BASE_URL', 'http://localhost:8000');

// 
// 5. ENVIRONNEMENT
// 
define('ENVIRONMENT', 'development');
define('DEBUG_MODE', true);

// 
// 6. SESSION
// 
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}