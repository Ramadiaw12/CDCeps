// ============================================================
// database/mysql.js
// Gestion de la connexion à la base de données MySQL
// On utilise un "pool" de connexions : au lieu d'ouvrir et
// fermer une connexion à chaque requête, on maintient un
// groupe de connexions réutilisables. C'est plus performant.
// ============================================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charge les variables du fichier .env
dotenv.config();

// Crée un pool de connexions avec les infos du .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,         // localhost
    user: process.env.DB_USER,         
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,    
    
    // Nombre maximum de connexions simultanées
    connectionLimit: 10,
    
    // Reconnecte automatiquement si la connexion est perdue
    waitForConnections: true,
    
    // File d'attente si toutes les connexions sont occupées
    queueLimit: 0
});

// Fonction de test de connexion
// On l'appelle au démarrage du serveur pour vérifier
// que la base est bien accessible
export const testConnection = async () => {
    try {
        // Prend une connexion du pool et envoie un ping
        const connection = await pool.getConnection();
        console.log('Connexion MySQL établie avec succès');
        
        // Libère la connexion pour qu'elle retourne dans le pool
        connection.release();
    } catch (error) {
        console.error('Erreur de connexion MySQL :', error.message);
        
        // Si on ne peut pas se connecter à la base,
        // inutile de continuer  on arrête le serveur
        process.exit(1);
    }
};

// On exporte le pool pour l'utiliser dans tout le projet
export default pool;