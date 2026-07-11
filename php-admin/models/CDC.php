<?php
// ============================================================
// models/CDC.php
// Modèle pour la gestion des cahiers des charges
// ============================================================

require_once __DIR__ . '/../config/database.php';

class CDC {
    private PDO $db;

    // 
    // CONSTRUCTEUR
    // Initialise la connexion PDO à la base de données
    // Utilise le pattern Singleton pour éviter plusieurs connexions
    // 
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // 
    // RÉCUPÈRE TOUS LES CDC AVEC LEURS MÉTADONNÉES
    // Jointure avec projets et clients pour avoir toutes les infos
    // Tri par date de création décroissante (les plus récents d'abord)
    // 
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

    // 
    // RÉCUPÈRE UN CDC SPÉCIFIQUE PAR SON ID
    // Retourne toutes les colonnes du CDC + infos projet et client
    // Les sections_manquantes sont automatiquement décodées du JSON
    // 
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
            // Convertit la chaîne JSON en tableau PHP
            $cdc['sections_manquantes'] = json_decode(
                $cdc['sections_manquantes'] ?? '[]',
                true
            );
        }

        return $cdc;
    }

    // 
    // STATISTIQUES POUR LE DASHBOARD
    // - Total des CDC générés
    // - Score moyen de complétude
    // - Répartition par statut (brouillon, finalise, etc.)
    // 
    public function getStats(): array {
        // Total CDC générés
        $total = $this->db->query(
            "SELECT COUNT(*) FROM cahiers_des_charges"
        )->fetchColumn();

        // Score moyen de complétude (arrondi à 1 décimale)
        $scoreMoyen = $this->db->query(
            "SELECT ROUND(AVG(score_completude), 1)
             FROM cahiers_des_charges"
        )->fetchColumn();

        // Répartition par statut
        $parStatut = $this->db->query(
            "SELECT statut, COUNT(*) as total
             FROM cahiers_des_charges
             GROUP BY statut"
        )->fetchAll();

        return [
            'total'       => (int)$total,
            'score_moyen' => (float)($scoreMoyen ?? 0),
            'par_statut'  => $parStatut
        ];
    }

    // 
    // FINALISE UN CDC (passe le statut à 'finalise')
    // Utilisé par l'action "finaliser" du contrôleur
    // 
    public function finaliser(int $id): bool {
        $stmt = $this->db->prepare(
            "UPDATE cahiers_des_charges
             SET statut = 'finalise'
             WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }
}