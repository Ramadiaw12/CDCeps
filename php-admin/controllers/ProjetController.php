<?php
// ============================================================
// controllers/ProjetController.php
// Contrôleur pour la gestion des projets
// ============================================================

class ProjetController {
    private Projet $projet;

    public function __construct() {
        $this->projet = new Projet();
    }

    // Liste tous les projets 
    public function index(): void {
        $projets = $this->projet->getTous();
        $vue = 'projets';
        require_once __DIR__ . '/../views/layout.php';
    }

    // Met à jour le statut d'un projet 
    public function updateStatut(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id     = (int) ($_POST['id'] ?? 0);
            $statut = $_POST['statut'] ?? '';

            $statuts_valides = [
                'soumis', 'en_analyse',
                'cdc_genere', 'valide', 'archive'
            ];

            if ($id > 0 && in_array($statut, $statuts_valides)) {
                $this->projet->updateStatut($id, $statut);
                $_SESSION['message'] = 'Statut mis à jour avec succès';
            }
        }

        // Redirige vers la liste des projets
        header('Location: index.php?page=projets');
        exit;
    }
}