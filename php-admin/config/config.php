<?php
// ============================================================
// config/config.php
// Configuration générale de l'interface PHP admin
// ============================================================

// URL de l'API Node.js
define('API_URL', 'http://localhost:3001/api');

// Nom de l'application
define('APP_NAME', 'CDCEPS Admin');

// Version
define('APP_VERSION', '1.0.0');

// Entreprise
define('COMPANY_NAME', 'EPS SARL');

// Timezone
date_default_timezone_set('Africa/Algiers');

// Autoload simple des classes
// Charge automatiquement les fichiers models et controllers
spl_autoload_register(function($classe) {
    $chemins = [
        __DIR__ . '/../models/',
        __DIR__ . '/../controllers/',
    ];

    foreach ($chemins as $chemin) {
        $fichier = $chemin . $classe . '.php';
        if (file_exists($fichier)) {
            require_once $fichier;
            return;
        }
    }
});

// Démarre la session PHP
session_start();

// Inclut la connexion base de données
require_once __DIR__ . '/database.php';