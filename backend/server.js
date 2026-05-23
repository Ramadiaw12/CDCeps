// ============================================================
// server.js
// Point d'entrée principal du backend Node.js
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './database/mysql.js';

// Import des routes
import routesProjets    from './routes/projets.js';
import routesAgents     from './routes/agents.js';
import routesDocuments  from './routes/documents.js';

dotenv.config();

// ── Initialisation ───────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// ── Middlewares ──────────────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Socket.io ────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`🔌 Client connecté : ${socket.id}`);

    // Le frontend envoie le sessionUuid pour s'abonner
    // aux événements de SA session uniquement
    socket.on('rejoindre_session', (sessionUuid) => {
        socket.join(sessionUuid);
        console.log(`📎 Session rejointe : ${sessionUuid}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client déconnecté : ${socket.id}`);
    });
});

// Rend io accessible depuis toutes les routes
app.set('io', io);

// ── Routes ───────────────────────────────────────────────────

// Route de santé — teste que le serveur tourne
app.get('/api/health', (req, res) => {
    res.json({
        statut: 'ok',
        message: 'Serveur CDCEPS opérationnel',
        timestamp: new Date().toISOString()
    });
});

// Routes métier
app.use('/api/projets',    routesProjets);
app.use('/api/agents',     routesAgents);
app.use('/api/documents',  routesDocuments);

// ── Gestion des routes inexistantes ─────────────────────────
app.use((req, res) => {
    res.status(404).json({
        succes: false,
        message: `Route introuvable : ${req.method} ${req.url}`
    });
});

// ── Gestion globale des erreurs ──────────────────────────────
app.use((err, req, res, next) => {
    console.error('Erreur serveur :', err.message);
    res.status(500).json({
        succes: false,
        message: 'Erreur interne du serveur',
        erreur: err.message
    });
});

// ── Démarrage ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    await testConnection();
    console.log(`📡 Routes disponibles :`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/projets`);
    console.log(`   GET  /api/projets`);
    console.log(`   POST /api/agents/generer/:projetId`);
    console.log(`   GET  /api/documents/cdc`);
    console.log(`   GET  /api/documents/cdc/:id/pdf`);
    console.log(`   GET  /api/documents/cdc/:id/markdown`);
});