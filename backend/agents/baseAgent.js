// ============================================================
// agents/baseAgent.js
// Classe de base pour tous les agents du système
// Chaque agent hérite de cette classe et implémente sa propre méthode "executer()"
// ============================================================

import pool from '../database/postgres.js';
import { appelLLM } from '../services/openaiService.js';

class BaseAgent {
    // Constructeur
    // Chaque agent a un nom et un rôle (prompt système)
    // Le prompt système définit le comportement de l'agent
    constructor(nom, promptSysteme) {
        this.nom = nom;
        this.promptSysteme = promptSysteme;
    }

    // Méthode principale
    // Appelle le LLM avec le prompt système de l'agent
    // et le message de l'utilisateur
    async appelerLLM(messageUtilisateur, options = {}) {
        const messages = [
            {
                // Le prompt système définit qui est l'agent
                // et comment il doit se comporter
                role: 'system',
                content: this.promptSysteme
            },
            {
                // Le message contient les données à traiter
                role: 'user',
                content: messageUtilisateur
            }
        ];

        return await appelLLM(messages, options);
    }

    // Mise à jour du statut en base
    // Met à jour le statut de l'agent dans la table
    // sessions_agents pour que le frontend puisse
    // afficher la progression en temps réel
    async mettreAJourStatut(sessionId, statut) {
    // Détermine quelle colonne mettre à jour
    // selon le nom de l'agent
    const colonnes = {
        'CollecteAgent':    'statut_agent_collecte',
        'AnalyseAgent':     'statut_agent_analyse',
        'GenerationAgent':  'statut_agent_generation',
        'ValidationAgent':  'statut_agent_validation'
    };

    const colonne = colonnes[this.nom];
    if (!colonne) return;

    try {
        await pool.query(
            `UPDATE sessions_agents SET ${colonne} = $1 WHERE id = $2`,
            [statut, sessionId]
        );
        console.log(`${this.nom} → statut : ${statut}`);
    } catch (error) {
        console.error(`Erreur mise à jour statut ${this.nom}:`, error.message);
    }
}

    // Notification temps réel
    // Envoie une mise à jour au frontend via Socket.io
    // pour afficher la progression de l'agent
    notifierProgression(io, sessionUuid, message) {
        io.to(sessionUuid).emit('progression_agent', {
            agent: this.nom,
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    // Méthode à implémenter par chaque agent
    // Chaque agent doit implémenter cette méthode
    // avec sa propre logique
    async executer(donnees, sessionId, io, sessionUuid) {
        throw new Error(`L'agent ${this.nom} doit implémenter la méthode executer()`);
    }
}

export default BaseAgent;