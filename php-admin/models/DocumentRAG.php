<?php
// ============================================================
// config/database.php
// Configuration de la base de données PostgreSQL
// ============================================================

class Database {
    private static $instance = null;
    private $connection;
    
    private $host = 'localhost';
    private $port = '5432';
    private $dbname = 'rag_db';
    private $user = 'cdcuser';
    private $password = 'cdcEPS26';
    
    private function __construct() {
        try {
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->dbname}";
            $this->connection = new PDO($dsn, $this->user, $this->password);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die("Erreur de connexion à la base de données : " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Éviter le clonage de l'instance
    private function __clone() {}
    
    // Éviter la désérialisation
    public function __wakeup() {}

        // ============================================================
    // STATISTIQUES POUR LE DASHBOARD
    // ============================================================
    public function getStats(): array {
        // Nombre total de documents
        $total = $this->db->query(
            "SELECT COUNT(*) FROM documents WHERE actif = TRUE"
        )->fetchColumn();

        // Documents par type de projet
        $parType = $this->db->query(
            "SELECT type_projet, COUNT(*) as total
             FROM documents
             WHERE actif = TRUE
             GROUP BY type_projet
             ORDER BY total DESC"
        )->fetchAll();

        // Documents ajoutés ce mois-ci
        $ceMois = $this->db->query(
            "SELECT COUNT(*) FROM documents
             WHERE actif = TRUE
             AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
             AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())"
        )->fetchColumn();

        return [
            'total'      => (int)$total,
            'par_type'   => $parType,
            'ce_mois'    => (int)$ceMois
        ];
    }
}

// Définir l'URL de l'API Node.js (pour les appels)
define('API_URL', 'http://localhost:3001/api');
?>