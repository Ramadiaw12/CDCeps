<?php
// ============================================================
// config/database.php
// Connexion à la base de données MySQL
// Compatible local ET Docker via variables d'environnement
// ============================================================

class Database {
    private static $instance = null;

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            try {
                // Lit les variables d'environnement
                // En local : utilise les valeurs par défaut
                // Sous Docker : utilise les variables du docker-compose
                $host = getenv('DB_HOST') ?: 'localhost';
                $user = getenv('DB_USER') ?: 'cdceps_user';
                $pass = getenv('DB_PASSWORD') ?: 'cdceps2024';
                $name = getenv('DB_NAME') ?: 'cdceps';

                $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";

                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);

            } catch (PDOException $e) {
                die(json_encode([
                    'erreur' => 'Connexion base de données impossible',
                    'detail' => $e->getMessage()
                ]));
            }
        }

        return self::$instance;
    }
}