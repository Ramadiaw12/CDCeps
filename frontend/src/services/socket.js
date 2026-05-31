// ============================================================
// services/socket.js
// Gestion de la connexion Socket.io
// Permet de recevoir la progression des agents en temps réel
// sans avoir à rafraîchir la page
// ============================================================

import { io } from 'socket.io-client';

// URL du serveur Socket.io (même port que l'API)
const SOCKET_URL = 'http://localhost:3001';

// Crée la connexion Socket.io
// autoConnect: false = on se connecte manuellement
// quand on en a besoin
const socket = io(SOCKET_URL, {
    autoConnect: false
});

//  Fonctions utilitaires 

// Connecte le socket et rejoint une session spécifique
// Appelé quand la page de génération s'ouvre
export const rejoindreSession = (sessionUuid) => {
    // Connecte si pas déjà connecté
    if (!socket.connected) {
        socket.connect();
    }

    // Rejoint la room de cette session
    // pour recevoir uniquement ses événements
    socket.emit('rejoindre_session', sessionUuid);
};

// Déconnecte le socket proprement
// Appelé quand la page de génération se ferme
export const quitterSession = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

// Écoute un événement et appelle le callback
export const ecouterEvenement = (evenement, callback) => {
    socket.on(evenement, callback);
};

// Arrête d'écouter un événement
// Important pour éviter les fuites mémoire
export const arreterEcoute = (evenement) => {
    socket.off(evenement);
};

export default socket;