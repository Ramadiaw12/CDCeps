// ============================================================
// services/socket.js
// Gestion de la connexion Socket.io
// ============================================================

import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

// Création du socket avec options optimales
const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// ============================================================
// ÉVÉNEMENTS DE CONNEXION
// ============================================================

let isConnecting = false;

socket.on('connect', () => {
    console.log('Socket.IO connecté ! ID:', socket.id);
    isConnecting = false;
});

socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion Socket.IO:', error.message);
    isConnecting = false;
});

socket.on('connect_confirme', (data) => {
    console.log('Confirmation de connexion:', data);
});

socket.on('disconnect', (reason) => {
    console.log(`❌ Socket.IO déconnecté: ${reason}`);
    if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('🔄 Tentative de reconnexion...');
        setTimeout(() => {
            if (!socket.connected) {
                socket.connect();
            }
        }, 2000);
    }
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnecté (tentative ${attemptNumber})`);
});

socket.on('reconnect_error', (error) => {
    console.error('❌ Erreur de reconnexion:', error.message);
});

// 
// FONCTIONS EXPORTÉES
// 

/**
 * Connecte le socket et rejoint une session
 */
export const rejoindreSession = (sessionUuid) => {
    console.log(`rejoindreSession appelé avec: ${sessionUuid}`);
    
    if (!sessionUuid) {
        console.error('❌ Session UUID manquant');
        return;
    }

    // Si pas connecté, on se connecte
    if (!socket.connected && !isConnecting) {
        console.log('🔌 Connexion Socket.IO en cours...');
        isConnecting = true;
        socket.connect();
        
        // Attendre la connexion puis rejoindre
        socket.once('connect', () => {
            console.log(`Emit rejoindre_session: ${sessionUuid}`);
            socket.emit('rejoindre_session', sessionUuid);
        });
    } else if (socket.connected) {
        console.log(`Emit rejoindre_session: ${sessionUuid}`);
        socket.emit('rejoindre_session', sessionUuid);
    } else {
        console.log('Connexion en cours, attente...');
        socket.once('connect', () => {
            console.log(`Emit rejoindre_session (après connexion): ${sessionUuid}`);
            socket.emit('rejoindre_session', sessionUuid);
        });
    }
};

/**
 * Déconnecte le socket proprement
 */
export const quitterSession = () => {
    console.log('Déconnexion Socket.IO...');
    isConnecting = false;
    if (socket.connected) {
        socket.disconnect();
    }
};

/**
 * Écoute un événement
 */
export const ecouterEvenement = (evenement, callback) => {
    if (!evenement || typeof callback !== 'function') {
        console.warn('⚠️ Arguments invalides pour ecouterEvenement');
        return;
    }
    socket.off(evenement);
    socket.on(evenement, callback);
    console.log(`Écoute de l'événement: ${evenement}`);
};

/**
 * Arrête d'écouter un événement
 */
export const arreterEcoute = (evenement) => {
    if (!evenement) return;
    socket.off(evenement);
    console.log(`Arrêt de l'écoute: ${evenement}`);
};

/**
 * Vérifie si le socket est connecté
 */
export const estConnecte = () => socket.connected;

/**
 * Récupère l'ID du socket
 */
export const getSocketId = () => socket.id || null;

/**
 * Envoie un événement au serveur
 */
export const envoyerEvenement = (evenement, data) => {
    if (socket.connected) {
        socket.emit(evenement, data);
        console.log(`Émission: ${evenement}`, data);
    } else {
        console.warn(`Socket non connecté, impossible d'émettre: ${evenement}`);
        // Tentative de reconnexion
        if (!isConnecting) {
            isConnecting = true;
            socket.connect();
            socket.once('connect', () => {
                socket.emit(evenement, data);
                console.log(`Émission après reconnexion: ${evenement}`, data);
            });
        }
    }
};

// ============================================================
// EXPORT PAR DÉFAUT
// ============================================================

export default socket;