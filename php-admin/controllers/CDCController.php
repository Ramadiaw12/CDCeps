<?php
// ============================================================
// controllers/CDCController.php
// Contrôleur pour la gestion des CDC
// ============================================================

class CDCController {
    private CDC $cdc;

    public function __construct() {
        $this->cdc = new CDC();
    }

    // ── Liste tous les CDC ───────────────────────────────────
    public function index(): void {
        $cdcs = $this->cdc->getTous();
        $vue  = 'cdcs';
        require_once __DIR__ . '/../views/layout.php';
    }

    // ── Détail d'un CDC ──────────────────────────────────────
    public function detail(): void {
        $id  = (int) ($_GET['id'] ?? 0);
        $cdc = $this->cdc->getById($id);

        if (!$cdc) {
            $_SESSION['erreur'] = 'CDC introuvable';
            header('Location: index.php?page=cdcs');
            exit;
        }

        $vue = 'cdc_detail';
        require_once __DIR__ . '/../views/layout.php';
    }

    // ── Finalise un CDC ──────────────────────────────────────
    public function finaliser(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = (int) ($_POST['id'] ?? 0);

            if ($id > 0) {
                $this->cdc->finaliser($id);
                $_SESSION['message'] = 'CDC finalisé avec succès';
            }
        }

        header('Location: index.php?page=cdcs');
        exit;
    }

    // ── Export Markdown ──────────────────────────────────────
    public function exportMarkdown(): void {
        $id  = (int) ($_GET['id'] ?? 0);
        $cdc = $this->cdc->getById($id);

        if (!$cdc) {
            die('CDC introuvable');
        }

        // Nom de fichier propre
        $nomFichier = preg_replace(
            '/[^a-z0-9]/', '_',
            strtolower($cdc['projet_titre'])
        );

        // Force le téléchargement
        header('Content-Type: text/markdown; charset=utf-8');
        header("Content-Disposition: attachment; filename=cdc_{$nomFichier}.md");

        echo $cdc['contenu_markdown'];
        exit;
    }
}