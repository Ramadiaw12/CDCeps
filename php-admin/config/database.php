<?php
// ============================================================
// config/database.php
// Connexion à la base de données MySQL
// Utilise PDO pour une connexion sécurisée
// ============================================================

class Database {
    // Paramètres de connexion
    private $host     = 'localhost';
    private $dbname   = 'cdceps';
    private $username = 'cdceps_user';
    private $password = 'cdceps2024';
    private $charset  = 'utf8mb4';

    // Instance PDO partagée (singleton)
    private static $instance = null;

    //  Singleton 
    // On crée une seule connexion et on la réutilise
    // dans tout le projet PHP
    public static function getInstance(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host=localhost;dbname=cdceps;charset=utf8mb4";

                self::$instance = new PDO($dsn, 'cdceps_user', 'cdceps2024', [
                    // Lève des exceptions en cas d'erreur SQL
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    // Retourne les résultats sous forme de tableaux associatifs
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    // Désactive l'émulation des requêtes préparées
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);

            } catch (PDOException $e) {
                // En production, ne jamais afficher le mot de passe
                die(json_encode([
                    'erreur' => 'Connexion base de données impossible',
                    'detail' => $e->getMessage()
                ]));
            }
        }

        return self::$instance;
    }
}