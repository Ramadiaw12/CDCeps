<?php
// ============================================================
// models/CDC.php
// Modèle pour la gestion des cahiers des charges
// ============================================================

class CDC {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Récupère tous les CDC
    public function getTous(): array {
        $stmt = $this->db->prepare(
            "SELECT cdc.id, cdc.score_completude, cdc.statut,
                    cdc.version, cdc.created_at,
                    p.titre as projet_titre, p.type_projet,
                    c.nom, c.prenom, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             ORDER BY cdc.created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Récupère un CDC complet
    public function getById(int $id): array|false {
        $stmt = $this->db->prepare(
            "SELECT cdc.*,
                    p.titre as projet_titre, p.type_projet,
                    p.description_brute,
                    c.nom, c.prenom, c.email, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             WHERE cdc.id = ?"
        );
        $stmt->execute([$id]);
        $cdc = $stmt->fetch();

        if ($cdc) {
            // Parse les sections manquantes JSON
            $cdc['sections_manquantes'] = json_decode(
                $cdc['sections_manquantes'] ?? '[]',
                true
            );
        }

        return $cdc;
    }

    // Statistiques CDC
    public function getStats(): array {
        // Total CDC générés
        $total = $this->db->query(
            "SELECT COUNT(*) FROM cahiers_des_charges"
        )->fetchColumn();

        // Score moyen
        $scoreMoyen = $this->db->query(
            "SELECT ROUND(AVG(score_completude), 1)
             FROM cahiers_des_charges"
        )->fetchColumn();

        // CDC par statut
        $parStatut = $this->db->query(
            "SELECT statut, COUNT(*) as total
             FROM cahiers_des_charges
             GROUP BY statut"
        )->fetchAll();

        return [
            'total'       => $total,
            'score_moyen' => $scoreMoyen ?? 0,
            'par_statut'  => $parStatut
        ];
    }

    // Finalise un CDC
    public function finaliser(int $id): bool {
        $stmt = $this->db->prepare(
            "UPDATE cahiers_des_charges
             SET statut = 'finalise'
             WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }
}