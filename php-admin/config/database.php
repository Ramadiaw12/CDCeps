<?php
// ============================================================
// config/database.php
// Connexion à la base de données PosgreSQL
// Compatible local ET Docker via variables d'environnement
// 


// Adaptation pour PostgreSQL

class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            // PostgreSQL 
            $this->pdo = new PDO(
                'pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME,
                DB_USER,
                DB_PASSWORD
            );
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die('Erreur de connexion PostgreSQL : ' . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->pdo;
    }
}