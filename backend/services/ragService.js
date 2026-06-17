// ============================================================
// services/ragService.js
// Module RAG (Retrieval Augmented Generation)
// Recherche les anciens CDC similaires pour enrichir
// la génération de nouveaux CDC
// 
// MIGRATION : MySQL → PostgreSQL avec pgvector
// MIGRATION : OpenAI → Google Gemini
// ============================================================

import pool from '../database/postgres.js';
import { generateEmbedding } from './gemini.js';

// ============================================================
// 1. FONCTION PRINCIPALE DU RAG
// ============================================================

/**
 * Recherche les documents les plus similaires à une description
 * @param {string} description - Description du projet
 * @param {string} typeProjet - Type de projet (ex: 'web', 'mobile')
 * @param {number} nbResultats - Nombre de résultats à retourner
 * @param {number} seuilSimilarite - Seuil minimum de similarité (0-1)
 * @returns {Promise<Array>} Liste des documents similaires
 */
export const rechercherDocumentsSimilaires = async (
    description, 
    typeProjet = null, 
    nbResultats = 3,
    seuilSimilarite = 0.5
) => {
    try {
        console.log(`🔍 RAG : Recherche de documents similaires...`);
        
        // Étape 1 : Convertir la description en vecteur avec Gemini
        const embeddingRequete = await generateEmbedding(description);
        
        if (!embeddingRequete) {
            console.warn('⚠️ RAG : Impossible de générer l\'embedding');
            return [];
        }

        console.log(`✅ Embedding généré (${embeddingRequete.length} dimensions)`);

        // Étape 2 : Construire la requête SQL avec pgvector
        // pgvector calcule directement la similarité cosinus avec <=>
        let sql = `
            SELECT 
                d.id,
                d.titre,
                d.contenu,
                d.type_projet,
                d.secteur,
                d.mots_cles,
                d.metadata,
                d.created_at,
                1 - (de.embedding <=> $1::vector) AS score_similarite
            FROM document_embeddings de
            JOIN documents d ON d.id = de.document_id
            WHERE d.actif = TRUE
        `;

        const params = [JSON.stringify(embeddingRequete)];

        // Filtrer par type de projet si spécifié
        if (typeProjet) {
            sql += ` AND (d.type_projet = $2 OR d.type_projet = 'autre')`;
            params.push(typeProjet);
        }

        // Trier par similarité et limiter les résultats
        sql += `
            ORDER BY de.embedding <=> $1::vector
            LIMIT $${params.length + 1}
        `;
        params.push(nbResultats * 2); // On prend plus pour filtrer après

        // Exécuter la requête
        const result = await pool.query(sql, params);
        
        // Filtrer par seuil de similarité
        const documents = result.rows
            .filter(doc => doc.score_similarite >= seuilSimilarite)
            .slice(0, nbResultats)
            .map(doc => ({
                id: doc.id,
                titre: doc.titre,
                contenu: doc.contenu,
                type_projet: doc.type_projet,
                secteur: doc.secteur,
                mots_cles: doc.mots_cles,
                metadata: doc.metadata,
                score: parseFloat(doc.score_similarite)
            }));

        console.log(`📚 RAG : ${documents.length} document(s) similaire(s) trouvé(s)`);
        
        if (documents.length > 0) {
            console.log(`   Meilleur score : ${(documents[0].score * 100).toFixed(1)}%`);
        }

        return documents;

    } catch (error) {
        console.error('❌ Erreur RAG :', error.message);
        // Le RAG est optionnel, on retourne un tableau vide
        return [];
    }
};

// ============================================================
// 2. INDEXATION D'UN NOUVEAU DOCUMENT
// ============================================================

/**
 * Indexe un nouveau document dans la base pour le RAG
 * @param {Object} document - Document à indexer
 * @param {string} document.titre - Titre du document
 * @param {string} document.contenu - Contenu du document
 * @param {string} document.type_projet - Type de projet
 * @param {string} document.secteur - Secteur d'activité
 * @param {Array} document.mots_cles - Mots-clés
 * @param {Object} document.metadata - Métadonnées additionnelles
 * @returns {Promise<number>} ID du document inséré
 */
export const indexerDocument = async ({
    titre,
    contenu,
    type_projet = 'autre',
    secteur = null,
    mots_cles = [],
    metadata = {}
}) => {
    const client = await pool.connect();
    
    try {
        console.log(`📝 Indexation du document : ${titre}`);
        
        // Vérifier que le contenu n'est pas vide
        if (!contenu || contenu.length < 10) {
            throw new Error('Le contenu du document est trop court');
        }

        // Générer l'embedding du contenu
        // On tronque à 8000 caractères pour Gemini
        const contenuTronque = contenu.substring(0, 8000);
        const embedding = await generateEmbedding(contenuTronque);
        
        if (!embedding) {
            throw new Error('Impossible de générer l\'embedding');
        }

        console.log(`✅ Embedding généré (${embedding.length} dimensions)`);

        await client.query('BEGIN');

        // Insérer le document dans la table principale
        const docResult = await client.query(
            `INSERT INTO documents (
                titre, 
                contenu, 
                type_projet, 
                secteur, 
                mots_cles, 
                metadata,
                actif
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
                titre,
                contenu,
                type_projet,
                secteur,
                JSON.stringify(mots_cles),
                JSON.stringify(metadata),
                true
            ]
        );

        const documentId = docResult.rows[0].id;

        // Insérer l'embedding dans la table vectorielle
        await client.query(
            `INSERT INTO document_embeddings (document_id, embedding)
             VALUES ($1, $2)`,
            [documentId, JSON.stringify(embedding)]
        );

        await client.query('COMMIT');
        
        console.log(`✅ Document indexé avec succès : ${titre} (ID: ${documentId})`);
        return documentId;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Erreur indexation : ${error.message}`);
        throw new Error(`Erreur indexation document : ${error.message}`);
    } finally {
        client.release();
    }
};

// ============================================================
// 3. FORMATAGE DU CONTEXTE RAG POUR LE PROMPT
// ============================================================

/**
 * Formate les documents trouvés en contexte pour le LLM
 * @param {Array} documents - Documents similaires
 * @param {number} maxCaracteres - Nombre max de caractères par document
 * @returns {string} Contexte formaté
 */
export const formaterContexteRAG = (documents, maxCaracteres = 1500) => {
    if (!documents || documents.length === 0) {
        return '';
    }

    let contexte = '=== ANCIENS CDC SIMILAIRES (référence) ===\n\n';

    documents.forEach((doc, index) => {
        const score = doc.score ? ` (similarité: ${(doc.score * 100).toFixed(1)}%)` : '';
        contexte += `--- Document ${index + 1} : ${doc.titre}${score} ---\n`;
        
        // Tronquer le contenu si nécessaire
        const contenuTronque = doc.contenu.length > maxCaracteres 
            ? doc.contenu.substring(0, maxCaracteres) + '...'
            : doc.contenu;
        
        contexte += contenuTronque;
        contexte += '\n\n';
    });

    contexte += '=== FIN DES RÉFÉRENCES ===\n\n';

    return contexte;
};

// ============================================================
// 4. FONCTIONS UTILITAIRES
// ============================================================

/**
 * Récupère un document par son ID
 * @param {number} id - ID du document
 * @returns {Promise<Object|null>} Document ou null
 */
export const getDocumentById = async (id) => {
    try {
        const result = await pool.query(
            `SELECT 
                d.id,
                d.titre,
                d.contenu,
                d.type_projet,
                d.secteur,
                d.mots_cles,
                d.metadata,
                d.created_at,
                d.updated_at
             FROM documents d
             WHERE d.id = $1 AND d.actif = TRUE`,
            [id]
        );
        
        if (result.rows.length === 0) return null;
        
        const doc = result.rows[0];
        return {
            ...doc,
            mots_cles: doc.mots_cles || [],
            metadata: doc.metadata || {}
        };
    } catch (error) {
        console.error('Erreur getDocumentById:', error.message);
        return null;
    }
};

/**
 * Supprime un document (soft delete)
 * @param {number} id - ID du document
 * @returns {Promise<boolean>} Succès ou non
 */
export const supprimerDocument = async (id) => {
    try {
        await pool.query(
            'UPDATE documents SET actif = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        console.log(`✅ Document ${id} supprimé (soft delete)`);
        return true;
    } catch (error) {
        console.error('Erreur supprimerDocument:', error.message);
        return false;
    }
};

/**
 * Récupère tous les documents indexés
 * @param {Object} filters - Filtres (type_projet, secteur, etc.)
 * @returns {Promise<Array>} Liste des documents
 */
export const listerDocuments = async (filters = {}) => {
    try {
        let sql = `
            SELECT 
                d.id,
                d.titre,
                d.type_projet,
                d.secteur,
                d.mots_cles,
                d.metadata,
                d.created_at,
                d.updated_at,
                LENGTH(d.contenu) AS taille_contenu
            FROM documents d
            WHERE d.actif = TRUE
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (filters.type_projet) {
            sql += ` AND d.type_projet = $${paramCount}`;
            params.push(filters.type_projet);
            paramCount++;
        }
        
        if (filters.secteur) {
            sql += ` AND d.secteur = $${paramCount}`;
            params.push(filters.secteur);
            paramCount++;
        }
        
        sql += ` ORDER BY d.created_at DESC`;
        
        const result = await pool.query(sql, params);
        
        return result.rows.map(doc => ({
            ...doc,
            mots_cles: doc.mots_cles || [],
            metadata: doc.metadata || {}
        }));
    } catch (error) {
        console.error('Erreur listerDocuments:', error.message);
        return [];
    }
};

// ============================================================
// 5. EXPORT
// ============================================================

export default {
    rechercherDocumentsSimilaires,
    indexerDocument,
    formaterContexteRAG,
    getDocumentById,
    supprimerDocument,
    listerDocuments
};