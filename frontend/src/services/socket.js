// ============================================================
// services/socket.js
// Gestion de la connexion Socket.io
// Permet de recevoir la progression des agents en temps réel
// sans avoir à rafraîchir la page
// ============================================================

import { io } from 'socket.io-client';

// URL du serveur Socket.io (même port que l'API)
const SOCKET_URL = 'http://localhost:3001';

// Crée la connexion Socket.io avec les bonnes options
const socket = io(SOCKET_URL, {
    autoConnect: false,           // On se connecte manuellement
    transports: ['websocket', 'polling'],
    withCredentials: true,        // Pour les cookies CORS
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
});

// ÉVÉNEMENTS DE CONNEXION 
// 

socket.on('connect', () => {
    console.log('Socket.IO connecté ! ID:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion Socket.IO:', error.message);
    console.error('Détails:', error);
});

socket.on('connect_confirme', (data) => {
    console.log('Confirmation de connexion:', data);
});

socket.on('disconnect', (reason) => {
    console.log(`❌ Socket.IO déconnecté: ${reason}`);
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnexion Socket.IO (tentative ${attemptNumber})`);
});

socket.on('reconnect_error', (error) => {
    console.error('❌ Erreur de reconnexion:', error.message);
});

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Connecte le socket et rejoint une session spécifique
 * Appelé quand la page de génération s'ouvre
 * @param {string} sessionUuid - UUID de la session à rejoindre
 */
export const rejoindreSession = (sessionUuid) => {
    console.log(`rejoindreSession appelé avec: ${sessionUuid}`);
    
    // Si pas connecté, on se connecte
    if (!socket.connected) {
        console.log('🔌 Connexion Socket.IO en cours...');
        socket.connect();
    }
    
    // Si déjà connecté, on rejoint directement
    if (socket.connected) {
        console.log(`Emit rejoindre_session: ${sessionUuid}`);
        socket.emit('rejoindre_session', sessionUuid);
    } else {
        // Sinon on attend la connexion
        console.log('Attente de la connexion pour rejoindre la session...');
        socket.once('connect', () => {
            console.log(`Emit rejoindre_session (après connexion): ${sessionUuid}`);
            socket.emit('rejoindre_session', sessionUuid);
        });
    }
};

/**
 * Déconnecte le socket proprement
 * Appelé quand la page de génération se ferme
 */
export const quitterSession = () => {
    console.log('Déconnexion Socket.IO...');
    if (socket.connected) {
        socket.disconnect();
        console.log('Socket.IO déconnecté proprement');
    } else {
        console.log('Socket.IO déjà déconnecté');
    }
};

/**
 * Écoute un événement et appelle le callback
 * @param {string} evenement - Nom de l'événement
 * @param {function} callback - Fonction à appeler
 */
export const ecouterEvenement = (evenement, callback) => {
    // Supprime l'écoute précédente pour éviter les doublons
    socket.off(evenement);
    // Ajoute la nouvelle écoute
    socket.on(evenement, callback);
    console.log(`Écoute de l'événement: ${evenement}`);
};

/**
 * Arrête d'écouter un événement
 * Important pour éviter les fuites mémoire
 * @param {string} evenement - Nom de l'événement
 */
export const arreterEcoute = (evenement) => {
    socket.off(evenement);
    console.log(`Arrêt de l'écoute: ${evenement}`);
};

/**
 * Envoie un événement au serveur
 * @param {string} evenement - Nom de l'événement
 * @param {*} data - Données à envoyer
 */
export const envoyerEvenement = (evenement, data) => {
    if (socket.connected) {
        socket.emit(evenement, data);
        console.log(`Émission: ${evenement}`, data);
    } else {
        console.warn(`Socket non connecté, impossible d'émettre: ${evenement}`);
    }
};

/**
 * Vérifie si le socket est connecté
 * @returns {boolean}
 */
export const estConnecte = () => {
    return socket.connected;
};

/**
 * Récupère l'ID du socket
 * @returns {string|null}
 */
export const getSocketId = () => {
    return socket.id || null;
};

// ============================================================
// ÉVÉNEMENTS PRÉDÉFINIS POUR LE PIPELINE
// ============================================================

/**
 * Écoute les événements du pipeline
 * @param {Object} handlers - Objet avec les handlers des événements
 */
export const ecouterPipeline = (handlers) => {
    const {
        onDemarre,
        onAgentActif,
        onAgentEtape,
        onTermine,
        onErreur,
        onProgres,
    } = handlers;

    if (onDemarre) {
        ecouterEvenement('pipeline_demarre', onDemarre);
    }
    if (onAgentActif) {
        ecouterEvenement('agent_actif', onAgentActif);
    }
    if (onAgentEtape) {
        ecouterEvenement('agent_etape', onAgentEtape);
    }
    if (onTermine) {
        ecouterEvenement('pipeline_termine', onTermine);
    }
    if (onErreur) {
        ecouterEvenement('pipeline_erreur', onErreur);
    }
    if (onProgres) {
        ecouterEvenement('progres', onProgres);
    }
};

/**
 * Arrête l'écoute des événements du pipeline
 */
export const arreterEcoutePipeline = () => {
    const evenements = [
        'pipeline_demarre',
        'agent_actif',
        'agent_etape',
        'pipeline_termine',
        'pipeline_erreur',
        'progres'
    ];
    evenements.forEach(e => arreterEcoute(e));
};

// ============================================================
// EXPORT PAR DÉFAUT
// ============================================================

export default socket;