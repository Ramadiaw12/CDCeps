<?php
// ============================================================
// index.php
// Point d'entrée principal de l'interface PHP Admin
// Gère le routing : détermine quelle page afficher
// et quelle action exécuter selon les paramètres GET/POST
// 


// index.php
// Routeur adapté

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/controllers/RAGController.php';
require_once __DIR__ . '/controllers/CDCController.php';
require_once __DIR__ . '/controllers/ProjetController.php';
require_once __DIR__ . '/controllers/DashboardController.php';

$controller = $_GET['controller'] ?? 'dashboard';
$action = $_GET['action'] ?? 'index';
$id = $_GET['id'] ?? null;

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
    default:
        $ctrl = new DashboardController();
}

if ($id && method_exists($ctrl, $action)) {
    $ctrl->$action($id);
} else if (method_exists($ctrl, $action)) {
    $ctrl->$action();
} else {
    http_response_code(404);
    echo "Page non trouvée";
}