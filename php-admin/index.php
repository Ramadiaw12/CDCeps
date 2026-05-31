<?php
// ============================================================
// index.php
// Point d'entrée principal de l'interface PHP Admin
// Gère le routing : détermine quelle page afficher
// et quelle action exécuter selon les paramètres GET/POST
// ============================================================

// Charge la configuration globale
// (session, autoload, connexion DB, constantes)
require_once __DIR__ . '/config/config.php';

// Routing des actions
// Les actions sont des opérations POST (créer, modifier, supprimer)
// Elles redirigent après exécution
$action = $_GET['action'] ?? null;

if ($action) {
    switch ($action) {

        // Projets
        case 'update_statut':
            $controller = new ProjetController();
            $controller->updateStatut();
            break;

        // CDC
        case 'cdc_finaliser':
            $controller = new CDCController();
            $controller->finaliser();
            break;

        case 'export_md':
            $controller = new CDCController();
            $controller->exportMarkdown();
            break;

        // RAG
        case 'rag_ajouter':
            $controller = new RAGController();
            $controller->ajouter();
            break;

        case 'rag_toggle':
            $controller = new RAGController();
            $controller->toggleActif();
            break;

        case 'rag_supprimer':
            $controller = new RAGController();
            $controller->supprimer();
            break;

        default:
            // Action inconnue — redirige vers le dashboard
            header('Location: index.php');
            exit;
    }
}

// Routing des pages
// Les pages sont des vues GET (afficher du contenu)
$page = $_GET['page'] ?? 'dashboard';

switch ($page) {

    case 'dashboard':
        $controller = new DashboardController();
        $controller->index();
        break;

    case 'projets':
        $controller = new ProjetController();
        $controller->index();
        break;

    case 'cdcs':
        // Réutilise le ProjetController avec vue CDC
        $controller = new CDCController();
        $controller->index();
        break;

    case 'cdc_detail':
        $controller = new CDCController();
        $controller->detail();
        break;

    case 'rag':
        $controller = new RAGController();
        $controller->index();
        break;

    default:
        // Page inconnue — redirige vers le dashboard
        header('Location: index.php');
        exit;
}