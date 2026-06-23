<?php
// ============================================================
// controllers/DashboardController.php
// Contrôleur du tableau de bord principal
// Agrège les statistiques de tous les modèles
// ============================================================

// ============================================================
// INCLUSION DES MODÈLES
// Chaque modèle est inclus pour pouvoir être utilisé
// ============================================================
require_once __DIR__ . '/../models/Projet.php';
require_once __DIR__ . '/../models/CDC.php';
require_once __DIR__ . '/../models/DocumentRAG.php';

// ============================================================
// CLASSE DASHBOARDCONTROLLER
// Gère l'affichage du tableau de bord avec toutes les stats
// ============================================================
class DashboardController {
    private Projet      $projet;
    private CDC         $cdc;
    private DocumentRAG $documentRAG;

    // ============================================================
    // CONSTRUCTEUR
    // Initialise les trois modèles pour récupérer les données
    // ============================================================
    public function __construct() {
        // Instancie les modèles pour interagir avec la base
        $this->projet      = new Projet();
        $this->cdc         = new CDC();
        $this->documentRAG = new DocumentRAG();
    }

    // ============================================================
    // PAGE PRINCIPALE DU DASHBOARD
    // Récupère toutes les statistiques et les affiche
    // ============================================================
    public function index(): void {
        // Récupère toutes les statistiques des différents modèles
        $stats = [
            'projets'  => $this->projet->getStats(),
            'cdc'      => $this->cdc->getStats(),
            'rag'      => $this->documentRAG->getStats(),
        ];

        // Récupère les 5 derniers projets
        $derniersProjets = array_slice(
            $this->projet->getTous(), 0, 5
        );

        // Récupère les 5 derniers CDC
        $derniersCDC = array_slice(
            $this->cdc->getTous(), 0, 5
        );

        // Charge la vue du layout qui affichera toutes les données
        require_once __DIR__ . '/../views/layout.php';
    }
}