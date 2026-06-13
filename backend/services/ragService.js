// ============================================================
// services/ragService.js
// Module RAG (Retrieval Augmented Generation)
// Recherche les anciens CDC similaires pour enrichir
// la génération de nouveaux CDC
// ============================================================

import pool from '../database/mysql.js';
import { genererEmbedding } from './openaiService.js';

//  Fonction principale du RAG 

// Prend la description d'un projet et retourne les anciens
// CDC les plus similaires depuis la base de données
export const rechercherDocumentsSimilaires = async (description, typeProjet, nbResultats = 3) => {
    try {
        // Étape 1 : Convertir la description en vecteur numérique
        // Ex: "application web de gestion RH" devient
        // [0.023, -0.156, 0.891, ...] (1536 nombres)
        const embeddingRequete = await genererEmbedding(description);

        // Étape 2 : Récupérer tous les documents RAG de la base
        // On filtre par type de projet si possible pour
        // avoir des résultats plus pertinents
        const [documents] = await pool.execute(
            `SELECT id, titre, contenu, type_projet, mots_cles, embedding
             FROM documents_rag
             WHERE actif = TRUE
             AND (type_projet = ? OR type_projet = 'autre')`,
            [typeProjet]
        );

        // Si aucun document trouvé, retourne un tableau vide
        if (documents.length === 0) {
            console.log('Aucun document RAG disponible en base');
            return [];
        }

        // Étape 3 : Calculer la similarité entre la requête
        // et chaque document de la base
        const documentsAvecScore = documents
            .filter(doc => doc.embedding) // Ignore les docs sans embedding
            .map(doc => {
                // Parse le JSON de l'embedding stocké en base
                const embeddingDoc = JSON.parse(doc.embedding);

                // Calcule la similarité cosinus entre les deux vecteurs
                // Score entre 0 et 1 : plus c'est proche de 1,
                // plus les deux textes sont similaires
                const score = similariteCosinus(embeddingRequete, embeddingDoc);

                return {
                    id: doc.id,
                    titre: doc.titre,
                    contenu: doc.contenu,
                    type_projet: doc.type_projet,
                    score: score
                };
            });

        // Étape 4 : Trier par score décroissant et prendre les N meilleurs
        const meilleurs = documentsAvecScore
            .sort((a, b) => b.score - a.score)
            .slice(0, nbResultats)
            .filter(doc => doc.score > 0.5); // Seuil minimum de similarité

        console.log(`📚 RAG : ${meilleurs.length} document(s) similaire(s) trouvé(s)`);

        return meilleurs;

    } catch (error) {
        // Le RAG est optionnel, si ça échoue on continue sans lui
        console.error('Erreur RAG :', error.message);
        return [];
    }
};

// Indexation d'un nouveau document

// Quand on ajoute un ancien CDC en base,
// on génère et stocke son embedding pour les futures recherches
export const indexerDocument = async (titre, contenu, typeProjet, secteur, motsCles) => {
    try {
        // Génère l'embedding du contenu du document
        // On tronque à 8000 caractères pour ne pas dépasser
        // la limite de tokens d'OpenAI
        const contenuTronque = contenu.substring(0, 8000);
        const embedding = await genererEmbedding(contenuTronque);

        // Stocke le document avec son embedding en base
        const [result] = await pool.execute(
            `INSERT INTO documents_rag 
             (titre, contenu, type_projet, secteur, mots_cles, embedding)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                titre,
                contenu,
                typeProjet,
                secteur,
                JSON.stringify(motsCles),
                JSON.stringify(embedding)  // Stocke le vecteur en JSON
            ]
        );

        console.log(`Document indexé avec succès : ${titre}`);
        return result.insertId;

    } catch (error) {
        throw new Error(`Erreur indexation document : ${error.message}`);
    }
};

// Formater le contexte RAG pour le prompt

// Prend les documents trouvés et les formate en texte
// pour les injecter dans le prompt des agents
export const formaterContexteRAG = (documents) => {
    if (documents.length === 0) {
        return ''; // Pas de contexte RAG disponible
    }

    let contexte = '=== ANCIENS CDC SIMILAIRES (référence) ===\n\n';

    documents.forEach((doc, index) => {
        contexte += `--- Document ${index + 1} : ${doc.titre} ---\n`;

        // On ne prend que les 1500 premiers caractères de chaque doc
        // pour ne pas dépasser la fenêtre de contexte du LLM
        contexte += doc.contenu.substring(0, 1500);
        contexte += '\n\n';
    });

    contexte += '=== FIN DES RÉFÉRENCES ===\n\n';

    return contexte;
};

// Algorithme de similarité cosinus

// Mesure la similarité entre deux vecteurs
// C'est la formule mathématique de base du RAG
// Résultat entre -1 et 1 (on obtient généralement entre 0 et 1)
const similariteCosinus = (vecteurA, vecteurB) => {
    // Vérifie que les deux vecteurs ont la même dimension
    if (vecteurA.length !== vecteurB.length) {
        return 0;
    }

    // Calcule le produit scalaire (numérateur)
    let produitScalaire = 0;
    for (let i = 0; i < vecteurA.length; i++) {
        produitScalaire += vecteurA[i] * vecteurB[i];
    }

    // Calcule la norme de chaque vecteur (dénominateur)
    const normeA = Math.sqrt(vecteurA.reduce((sum, val) => sum + val * val, 0));
    const normeB = Math.sqrt(vecteurB.reduce((sum, val) => sum + val * val, 0));

    // Évite la division par zéro
    if (normeA === 0 || normeB === 0) return 0;

    // Retourne le cosinus de l'angle entre les deux vecteurs
    return produitScalaire / (normeA * normeB);
};