<?php
// ============================================================
// index.php
// Point d'entrée principal de l'interface PHP Admin
// Gère le routing : détermine quelle page afficher
// et quelle action exécuter selon les paramètres GET/POST
// ============================================================

// ============================================================
// 1. INCLUSION DES CONFIGURATIONS ET CONTROLEURS
// ============================================================
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Inclusion des modèles (nécessaires pour les contrôleurs)
require_once __DIR__ . '/models/Projet.php';
require_once __DIR__ . '/models/CDC.php';
require_once __DIR__ . '/models/DocumentRAG.php';

// Inclusion des contrôleurs
require_once __DIR__ . '/controllers/DashboardController.php';
require_once __DIR__ . '/controllers/ProjetController.php';
require_once __DIR__ . '/controllers/CDCController.php';
require_once __DIR__ . '/controllers/RAGController.php';

// ============================================================
// 2. ROUTEUR PRINCIPAL
// Détermine quel contrôleur et quelle action exécuter
// ============================================================

// Récupère les paramètres de l'URL
// Exemple: ?controller=projet&action=voir&id=5
$controller = $_GET['controller'] ?? 'dashboard';
$action = $_GET['action'] ?? 'index';
$id = $_GET['id'] ?? null;

// ============================================================
// 3. INSTANCIATION DU CONTRÔLEUR
// ============================================================
switch ($controller) {
    case 'rag':
        $ctrl = new RAGController();
        break;
    case 'cdc':
        $ctrl = new CDCController();
        break;
    case 'projet':
        $ctrl = new ProjetController();
        break;
    case 'dashboard':
    default:
        $ctrl = new DashboardController();
        break;
}

// ============================================================
// 4. EXÉCUTION DE L'ACTION
// Vérifie si la méthode existe avant de l'appeler
// ============================================================
if ($id && method_exists($ctrl, $action)) {
    // Action avec paramètre ID (ex: voir, modifier, supprimer)
    $ctrl->$action($id);
} else if (method_exists($ctrl, $action)) {
    // Action sans paramètre (ex: index, create, store)
    $ctrl->$action();
} else {
    // Erreur 404 si la méthode n'existe pas
    http_response_code(404);
    echo "❌ Page non trouvée - Action '$action' introuvable dans le contrôleur '$controller'";
}