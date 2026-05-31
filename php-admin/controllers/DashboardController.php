<?php
// ============================================================
// controllers/DashboardController.php
// Contrôleur du tableau de bord principal
// Agrège les statistiques de tous les modèles
// ============================================================

class DashboardController {
    private Projet      $projet;
    private CDC         $cdc;
    private DocumentRAG $documentRAG;

    public function __construct() {
        $this->projet      = new Projet();
        $this->cdc         = new CDC();
        $this->documentRAG = new DocumentRAG();
    }

    //  Page principale du dashboard 
    public function index(): void {
        // Récupère toutes les statistiques
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

        // Charge la vue dashboard
        require_once __DIR__ . '/../views/layout.php';
    }
}