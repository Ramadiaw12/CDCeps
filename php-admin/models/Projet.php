<?php
// ============================================================
// models/Projet.php
// Modèle pour la gestion des projets
// Toutes les requêtes liées aux projets passent par ici
// ============================================================

require_once __DIR__ . '/../config/database.php';

class Projet {
    private PDO $db;

    // ============================================================
    // CONSTRUCTEUR
    // Initialise la connexion à la base de données
    // On récupère l'instance PDO via Database::getInstance()->getConnection()
    // ============================================================
    public function __construct() {
        // Récupère la connexion PDO pour interagir avec la base
        $this->db = Database::getInstance()->getConnection();
    }

    // ============================================================
    // RÉCUPÈRE TOUS LES PROJETS AVEC LEURS CLIENTS
    // ============================================================
    public function getTous(): array {
        // Requête avec jointure sur clients et count des CDC
        $stmt = $this->db->prepare(
            "SELECT p.id, p.titre, p.type_projet, p.statut,
                    p.budget_estime, p.delai_souhaite,
                    p.created_at,
                    c.nom, c.prenom, c.email, c.entreprise,
                    COUNT(cdc.id) as nb_cdc
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             LEFT JOIN cahiers_des_charges cdc ON p.id = cdc.projet_id
             GROUP BY p.id, c.id
             ORDER BY p.created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // ============================================================
    // RÉCUPÈRE UN PROJET SPÉCIFIQUE PAR SON ID
    // ============================================================
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

    // ============================================================
    // STATISTIQUES POUR LE DASHBOARD
    // ============================================================
    public function getStats(): array {
        // Nombre total de projets
        $total = $this->db->query(
            "SELECT COUNT(*) FROM projets"
        )->fetchColumn();

        // Répartition des projets par statut
        $parStatut = $this->db->query(
            "SELECT statut, COUNT(*) as total
             FROM projets
             GROUP BY statut"
        )->fetchAll();

        // Répartition des projets par type
        $parType = $this->db->query(
            "SELECT type_projet, COUNT(*) as total
             FROM projets
             GROUP BY type_projet
             ORDER BY total DESC"
        )->fetchAll();

        // Nombre de projets créés ce mois-ci
        $cemois = $this->db->query(
            "SELECT COUNT(*) FROM projets
             WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
             AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())"
        )->fetchColumn();

        return [
            'total'      => (int)$total,
            'par_statut' => $parStatut,
            'par_type'   => $parType,
            'ce_mois'    => (int)$cemois
        ];
    }

    // ============================================================
    // MET À JOUR LE STATUT D'UN PROJET
    // ============================================================
    public function updateStatut(int $id, string $statut): bool {
        $stmt = $this->db->prepare(
            "UPDATE projets SET statut = :statut WHERE id = :id"
        );
        return $stmt->execute(['statut' => $statut, 'id' => $id]);
    }
}