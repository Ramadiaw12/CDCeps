<?php
// ============================================================
// models/DocumentRAG.php
// Modèle pour la gestion des documents RAG
// ============================================================

class DocumentRAG {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Récupère tous les documents RAG
    public function getTous(): array {
        $stmt = $this->db->prepare(
            "SELECT id, titre, type_projet, secteur,
                    mots_cles, actif, created_at,
                    LENGTH(contenu) as taille_contenu
             FROM documents_rag
             ORDER BY created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Active ou désactive un document
    public function toggleActif(int $id): bool {
        $stmt = $this->db->prepare(
            "UPDATE documents_rag
             SET actif = NOT actif
             WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }

    // Supprime un document
    public function supprimer(int $id): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM documents_rag WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }

    // Statistiques RAG 
    public function getStats(): array {
        $total = $this->db->query(
            "SELECT COUNT(*) FROM documents_rag"
        )->fetchColumn();

        $actifs = $this->db->query(
            "SELECT COUNT(*) FROM documents_rag WHERE actif = TRUE"
        )->fetchColumn();

        $parType = $this->db->query(
            "SELECT type_projet, COUNT(*) as total
             FROM documents_rag
             GROUP BY type_projet"
        )->fetchAll();

        return [
            'total'    => $total,
            'actifs'   => $actifs,
            'par_type' => $parType
        ];
    }
}