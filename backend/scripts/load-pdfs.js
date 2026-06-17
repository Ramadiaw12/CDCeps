// scripts/load-pdfs.js
// Script pour charger tous les PDFs dans la base de données

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import { insertDocumentWithEmbedding } from '../database/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour lire un PDF
async function readPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error(`❌ Erreur lecture PDF ${filePath}:`, error.message);
        return null;
    }
}

// Fonction pour générer un embedding (à remplacer par votre méthode)
// Pour l'instant, on utilise un embedding aléatoire pour tester
function generateMockEmbedding(text) {
    // Dans la vraie vie, utilisez un modèle réel
    // Exemple avec OpenAI ou Transformers
    return new Array(384).fill(0).map(() => Math.random() * 0.1);
}

// Charger tous les PDFs d'un dossier
async function loadAllPDFs(pdfFolder = './pdfs') {
    console.log(`Lecture du dossier: ${pdfFolder}`);
    
    // Vérifier que le dossier existe
    if (!fs.existsSync(pdfFolder)) {
        console.error(`Le dossier ${pdfFolder} n'existe pas`);
        return;
    }
    
    // Récupérer tous les fichiers PDF
    const files = fs.readdirSync(pdfFolder)
        .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (files.length === 0) {
        console.log(`  Aucun fichier PDF trouvé dans ${pdfFolder}`);
        return;
    }
    
    console.log(` ${files.length} fichiers PDF trouvés\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Traiter chaque PDF
    for (const file of files) {
        const filePath = path.join(pdfFolder, file);
        console.log(` Traitement: ${file}`);
        
        const text = await readPDF(filePath);
        
        if (text) {
            // Nettoyer le texte
            const cleanText = text
                .replace(/\s+/g, ' ')  // Supprimer les espaces multiples
                .trim();
            
            // Générer l'embedding
            const embedding = generateMockEmbedding(cleanText);
            
            try {
                // Insérer dans la base
                const id = await insertDocumentWithEmbedding(
                    file.replace('.pdf', ''),  // Titre = nom du fichier
                    cleanText,
                    embedding,
                    {
                        source: file,
                        type: 'pdf',
                        size: fs.statSync(filePath).size,
                        loadedAt: new Date().toISOString(),
                        pages: cleanText.split('\f').length  // Approximation du nombre de pages
                    }
                );
                
                console.log(`Document inséré avec l'ID: ${id}`);
                console.log(`   ${cleanText.length} caractères`);
                successCount++;
            } catch (error) {
                console.error(`Erreur insertion: ${error.message}`);
                failCount++;
            }
        } else {
            failCount++;
        }
        
        console.log('');  // Ligne vide pour la lisibilité
    }
    
    // Résumé
    console.log('='.repeat(50));
    console.log(`Résumé:`);
    console.log(`    Succès: ${successCount}`);
    console.log(`    Échecs: ${failCount}`);
    console.log(`    Total: ${files.length}`);
}

// Exécuter
const pdfFolder = process.argv[2] || './pdfs';
loadAllPDFs(pdfFolder)
    .then(() => {
        console.log('\n Chargement terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erreur:', error);
        process.exit(1);
    });