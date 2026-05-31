<?php
// ============================================================
// controllers/RAGController.php
// Contrôleur pour la gestion des documents RAG
// Permet d'ajouter, activer/désactiver et supprimer
// des documents de la base RAG via l'API Node.js
// ============================================================

class RAGController {
    private DocumentRAG $documentRAG;

    public function __construct() {
        $this->documentRAG = new DocumentRAG();
    }

    // ── Liste tous les documents RAG ─────────────────────────
    public function index(): void {
        $documents = $this->documentRAG->getTous();
        $stats     = $this->documentRAG->getStats();
        $vue       = 'rag';
        require_once __DIR__ . '/../views/layout.php';
    }

    // ── Ajoute un document RAG via l'API Node.js ─────────────
    // On passe par l'API Node.js pour que l'embedding
    // soit généré automatiquement par OpenAI
    public function ajouter(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $titre      = trim($_POST['titre'] ?? '');
            $contenu    = trim($_POST['contenu'] ?? '');
            $typeProjet = $_POST['type_projet'] ?? '';
            $secteur    = $_POST['secteur'] ?? '';
            $motsCles   = array_filter(
                array_map('trim', explode(',', $_POST['mots_cles'] ?? ''))
            );

            if (!$titre || !$contenu || !$typeProjet) {
                $_SESSION['erreur'] = 'Champs obligatoires manquants';
                header('Location: index.php?page=rag');
                exit;
            }

            // Appel à l'API Node.js pour indexer le document
            // Node.js va générer l'embedding via OpenAI
            $donnees = json_encode([
                'titre'       => $titre,
                'contenu'     => $contenu,
                'type_projet' => $typeProjet,
                'secteur'     => $secteur,
                'mots_cles'   => array_values($motsCles)
            ]);

            $ch = curl_init(API_URL . '/documents/rag');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $donnees,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/json',
                    'Content-Length: ' . strlen($donnees)
                ],
                CURLOPT_TIMEOUT        => 30
            ]);

            $reponse   = curl_exec($ch);
            $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 201) {
                $_SESSION['message'] = 'Document indexé avec succès';
            } else {
                $_SESSION['erreur'] = 'Erreur indexation — vérifiez que Node.js tourne';
            }
        }

        header('Location: index.php?page=rag');
        exit;
    }

    // ── Active ou désactive un document ─────────────────────
    public function toggleActif(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = (int) ($_POST['id'] ?? 0);
            if ($id > 0) {
                $this->documentRAG->toggleActif($id);
                $_SESSION['message'] = 'Statut du document mis à jour';
            }
        }

        header('Location: index.php?page=rag');
        exit;
    }

    // Supprime un document
    public function supprimer(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = (int) ($_POST['id'] ?? 0);
            if ($id > 0) {
                $this->documentRAG->supprimer($id);
                $_SESSION['message'] = 'Document supprimé';
            }
        }

        header('Location: index.php?page=rag');
        exit;
    }
}