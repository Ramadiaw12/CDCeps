<?php
// ============================================================
// config/database.php
// Configuration de la base de données PostgreSQL
// ============================================================

// ============================================================
// INCLUSION DE LA CONFIGURATION GÉNÉRALE
// ============================================================
require_once __DIR__ . '/config.php';

// ============================================================
// DÉFINITION DE LA CLASSE DATABASE UNIQUEMENT SI ELLE N'EXISTE PAS
// ============================================================
if (!class_exists('Database')) {

    class Database {
        private static $instance = null;
        private $connection;
        
        // ============================================================
        // CONSTRUCTEUR PRIVÉ (SINGLETON)
        // Utilise les constantes définies dans config.php
        // ============================================================
        private function __construct() {
            try {
                $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
                $this->connection = new PDO($dsn, DB_USER, DB_PASSWORD);
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $this->connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            } catch (PDOException $e) {
                die("❌ Erreur de connexion à la base de données : " . $e->getMessage());
            }
        }
        
        // ============================================================
        // RÉCUPÈRE L'INSTANCE UNIQUE (SINGLETON)
        // ============================================================
        public static function getInstance() {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            return self::$instance;
        }
        
        // ============================================================
        // RÉCUPÈRE LA CONNEXION PDO
        // ============================================================
        public function getConnection() {
            return $this->connection;
        }
        
        private function __clone() {}
        public function __wakeup() {}
    }
}