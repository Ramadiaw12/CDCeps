// ============================================================
// server.js
// Point d'entrée principal du backend Node.js
// Ce fichier démarre le serveur Express et configure
// tous les middlewares et routes
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './database/mysql.js';

// Charge les variables d'environnement
dotenv.config();

// ── Initialisation ──────────────────────────────────────────

const app = express();

// createServer wrape Express pour que Socket.io
// puisse utiliser le même port que l'API REST
const httpServer = createServer(app);

// Initialise Socket.io sur le même serveur HTTP
// Le frontend React se connectera à cette instance
// pour recevoir la progression des agents en temps réel
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173', // Port de Vite (React)
        methods: ['GET', 'POST']
    }
});

// ── Middlewares ──────────────────────────────────────────────

// Autorise React (port 5173) à appeler cette API (port 3001)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Parse le JSON dans le body des requêtes
app.use(express.json());

// Parse les données de formulaires
app.use(express.urlencoded({ extended: true }));

// ── Socket.io ────────────────────────────────────────────────

// Quand un client React se connecte via WebSocket
io.on('connection', (socket) => {
    console.log(`🔌 Client connecté : ${socket.id}`);

    // Quand le client rejoint une session de génération
    // il envoie son session_uuid pour recevoir
    // uniquement les mises à jour de SA session
    socket.on('rejoindre_session', (sessionUuid) => {
        socket.join(sessionUuid);
        console.log(`📎 Socket ${socket.id} a rejoint la session ${sessionUuid}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client déconnecté : ${socket.id}`);
    });
});

// Rend io accessible depuis les routes et services
// en l'attachant à l'objet app
app.set('io', io);

// ── Routes ───────────────────────────────────────────────────

// Route de test pour vérifier que le serveur tourne
app.get('/api/health', (req, res) => {
    res.json({
        statut: 'ok',
        message: 'Serveur CDCEPS opérationnel',
        timestamp: new Date().toISOString()
    });
});

// ── Démarrage ────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    
    // Teste la connexion MySQL au démarrage
    await testConnection();
});