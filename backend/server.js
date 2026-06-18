// ============================================================
// server.js
// Point d'entrée principal du backend Node.js
// 

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
// Remplacer mysql par postgres
import { testConnection } from './database/postgres.js';

// Import des routes
import routesProjets    from './routes/projets.js';
import routesAgents     from './routes/agents.js';
import routesDocuments  from './routes/documents.js';


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env avec chemin absolu
const envPath = path.resolve(__dirname, '.env');
console.log(`📂 Chargement du .env depuis: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Erreur chargement .env:', result.error.message);
} else {
    console.log('✅ .env chargé avec succès');
}
dotenv.config();

    
// Initialisation 
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        transports: ['websocket', 'polling'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    // ✅ Ajouter ces options pour plus de stabilité
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Socket.io 
io.on('connection', (socket) => {
    console.log(`Client connecté : ${socket.id}`);

    // Le frontend envoie le sessionUuid pour s'abonner
    // aux événements de SA session uniquement
    socket.on('rejoindre_session', (sessionUuid) => {
        socket.join(sessionUuid);
        console.log(`Session rejointe : ${sessionUuid}`);
    });

    socket.on('disconnect', () => {
        console.log(`Client déconnecté : ${socket.id}`);
    });
});

// Rend io accessible depuis toutes les routes
app.set('io', io);

//  Routes 

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

// Gestion des routes inexistantes 
app.use((req, res) => {
    res.status(404).json({
        succes: false,
        message: `Route introuvable : ${req.method} ${req.url}`
    });
});

// Gestion globale des erreurs 
app.use((err, req, res, next) => {
    console.error('Erreur serveur :', err.message);
    res.status(500).json({
        succes: false,
        message: 'Erreur interne du serveur',
        erreur: err.message
    });
});

// Démarrage
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    
    // Test de connexion PostgreSQL
    const connected = await testConnection();
    if (connected) {
        console.log('Base de données PostgreSQL connectée');
    } else {
        console.log('Base de données PostgreSQL non disponible');
    }
    
    console.log(`Routes disponibles :`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/projets`);
    console.log(`   GET  /api/projets`);
    console.log(`   POST /api/agents/generer/:projetId`);
    console.log(`   GET  /api/documents/cdc`);
    console.log(`   GET  /api/documents/cdc/:id/pdf`);
    console.log(`   GET  /api/documents/cdc/:id/markdown`);
});

