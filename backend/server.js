// ============================================================
// server.js
// Point d'entrée principal du backend Node.js
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './database/postgres.js';

// Import des routes
import routesProjets    from './routes/projets.js';
import routesAgents     from './routes/agents.js';
import routesDocuments  from './routes/documents.js';

dotenv.config();

// Initialisation 
const app = express();
const httpServer = createServer(app);

// CORS CORRECTEMENT CONFIGURÉ (sans app.options)
const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Appliquer CORS à toutes les routes
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SOCKET.IO AVEC BONNE CONFIGURATION
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
        transports: ['websocket', 'polling']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// GESTION DES CONNEXIONS SOCKET.IO
io.on('connection', (socket) => {
    console.log(`Client connecté : ${socket.id}`);

    // 1. Envoyer une confirmation immédiate
    socket.emit('connect_confirme', { 
        message: 'Connexion Socket.IO établie',
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });

    // 2. Rejoindre une session
    socket.on('rejoindre_session', (sessionUuid) => {
        if (!sessionUuid) {
            console.warn('Tentative de rejoindre une session sans UUID');
            socket.emit('erreur', { message: 'Session UUID manquant' });
            return;
        }
        
        socket.join(sessionUuid);
        console.log(`Session rejointe : ${sessionUuid} par ${socket.id}`);
        
        socket.emit('session_jointe', { 
            sessionUuid, 
            status: 'ok',
            message: 'Session rejointe avec succès'
        });
    });

    // 3. Lancer le pipeline (si besoin)
    socket.on('lancer_pipeline', async (data) => {
        console.log(`Lancement du pipeline pour projet ${data.projetId}`);
        // Ici vous pouvez appeler l'orchestrateur
    });

    // 4. Déconnexion
    socket.on('disconnect', () => {
        console.log(`❌ Client déconnecté : ${socket.id}`);
    });

    // 5. Gestion des erreurs
    socket.on('error', (error) => {
        console.error(`❌ Erreur socket ${socket.id}:`, error);
    });
});

// Rend io accessible depuis toutes les routes
app.set('io', io);

// ============================================================
// ROUTES
// ============================================================

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        statut: 'ok',
        message: 'Serveur CDCEPS opérationnel',
        timestamp: new Date().toISOString()
    });
});

// Routes métier
app.use('/api/projets', routesProjets);
app.use('/api/agents', routesAgents);
app.use('/api/documents', routesDocuments);

// Gestion des routes inexistantes
app.use((req, res) => {
    res.status(404).json({
        succes: false,
        message: `Route introuvable : ${req.method} ${req.url}`
    });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur :', err.message);
    res.status(500).json({
        succes: false,
        message: 'Erreur interne du serveur',
        erreur: err.message
    });
});

// ============================================================
// DÉMARRAGE
// ============================================================

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
    console.log('=' .repeat(50));
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Socket.IO prêt sur http://localhost:${PORT}`);
    console.log('=' .repeat(50));
    
    // Test de connexion PostgreSQL
    const connected = await testConnection();
    if (connected) {
        console.log('✅ Base de données PostgreSQL connectée');
    } else {
        console.log('⚠️ Base de données PostgreSQL non disponible');
    }
    
    console.log('\n Routes disponibles :');
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   POST http://localhost:${PORT}/api/projets`);
    console.log(`   GET  http://localhost:${PORT}/api/projets`);
    console.log(`   POST http://localhost:${PORT}/api/agents/generer/:projetId`);
    console.log(`   GET  http://localhost:${PORT}/api/documents/cdc`);
    console.log(`   GET  http://localhost:${PORT}/api/documents/cdc/:id/pdf`);
    console.log(`   GET  http://localhost:${PORT}/api/documents/cdc/:id/markdown`);
    console.log('=' .repeat(50));
});