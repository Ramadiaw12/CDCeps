<?php
// ============================================================
// models/Projet.php
// Modèle pour la gestion des projets
// Toutes les requêtes liées aux projets passent par ici
// ============================================================

class Projet {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Récupère tous les projets
    public function getTous(): array {
        $stmt = $this->db->prepare(
            "SELECT p.id, p.titre, p.type_projet, p.statut,
                    p.budget_estime, p.delai_souhaite,
                    p.created_at,
                    c.nom, c.prenom, c.email, c.entreprise,
                    COUNT(cdc.id) as nb_cdc
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             LEFT JOIN cahiers_des_charges cdc ON p.id = cdc.projet_id
             GROUP BY p.id
             ORDER BY p.created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Récupère un projet par son ID
    public function getById(int $id): array|false {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.nom, c.prenom, c.email,
                    c.telephone, c.entreprise, c.secteur
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             WHERE p.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Statistiques pour le dashboard
    public function getStats(): array {
        // Nombre total de projets
        $total = $this->db->query(
            "SELECT COUNT(*) FROM projets"
        )->fetchColumn();

        // Projets par statut
        $parStatut = $this->db->query(
            "SELECT statut, COUNT(*) as total
             FROM projets
             GROUP BY statut"
        )->fetchAll();

        // Projets par type
        $parType = $this->db->query(
            "SELECT type_projet, COUNT(*) as total
             FROM projets
             GROUP BY type_projet
             ORDER BY total DESC"
        )->fetchAll();

        // Projets ce mois-ci
        $cemois = $this->db->query(
            "SELECT COUNT(*) FROM projets
             WHERE MONTH(created_at) = MONTH(NOW())
             AND YEAR(created_at) = YEAR(NOW())"
        )->fetchColumn();

        return [
            'total'      => $total,
            'par_statut' => $parStatut,
            'par_type'   => $parType,
            'ce_mois'    => $cemois
        ];
    }

    // Met à jour le statut d'un projet
    public function updateStatut(int $id, string $statut): bool {
        $stmt = $this->db->prepare(
            "UPDATE projets SET statut = ? WHERE id = ?"
        );
        return $stmt->execute([$statut, $id]);
    }
}