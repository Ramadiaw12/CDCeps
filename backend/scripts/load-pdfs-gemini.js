// scripts/load-pdfs-gemini.js
// Charge les PDFs dans la base avec des embeddings Gemini

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import dotenv from 'dotenv';
import { insertDocumentWithEmbedding } from '../database/postgres.js';
import { generateEmbedding } from '../services/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Vérifier la clé API (GOOGLE_API_KEY)
if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY non définie dans .env');
    process.exit(1);
}

console.log('🔑 GOOGLE_API_KEY chargée');

// Fonction pour lire un PDF
async function readPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error(`❌ Erreur lecture ${filePath}:`, error.message);
        return null;
    }
}

// Fonction pour découper un long texte en chunks (Gemini a une limite)
function chunkText(text, maxLength = 8000) {
    if (text.length <= maxLength) return [text];
    
    const chunks = [];
    const sentences = text.split('. ');
    let currentChunk = '';
    
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    
    return chunks;
}

// Charger tous les PDFs
async function loadAllPDFs(pdfFolder = './pdfs') {
    console.log('🚀 Chargement des PDFs avec Gemini\n');
    console.log('=' .repeat(50));
    
    // Vérifier que le dossier existe
    if (!fs.existsSync(pdfFolder)) {
        console.error(`❌ Le dossier ${pdfFolder} n'existe pas`);
        return;
    }
    
    // Récupérer tous les fichiers PDF
    const files = fs.readdirSync(pdfFolder)
        .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (files.length === 0) {
        console.log(`⚠️  Aucun fichier PDF trouvé dans ${pdfFolder}`);
        return;
    }
    
    console.log(`📄 ${files.length} fichiers PDF trouvés\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Traiter chaque PDF
    for (const file of files) {
        const filePath = path.join(pdfFolder, file);
        console.log(`📖 Traitement: ${file}`);
        
        const text = await readPDF(filePath);
        
        if (text) {
            // Nettoyer le texte
            const cleanText = text
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log(`   📝 ${cleanText.length} caractères`);
            
            try {
                // Gemini a une limite de tokens, on découpe si besoin
                const chunks = chunkText(cleanText, 8000);
                
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    const isFirstChunk = i === 0;
                    
                    console.log(`   🔄 Génération embedding (chunk ${i + 1}/${chunks.length})...`);
                    
                    // Générer l'embedding avec Gemini
                    const embedding = await generateEmbedding(chunk);
                    
                    if (!embedding) {
                        console.log(`   ❌ Échec de l'embedding pour ${file}`);
                        failCount++;
                        continue;
                    }
                    
                    // Titre = nom du fichier + numéro de chunk si multiple
                    const title = chunks.length > 1 
                        ? `${file.replace('.pdf', '')} (partie ${i + 1})`
                        : file.replace('.pdf', '');
                    
                    // Insérer dans la base
                    const id = await insertDocumentWithEmbedding(
                        title,
                        chunk,
                        embedding,
                        {
                            source: file,
                            type: 'pdf',
                            chunk: chunks.length > 1 ? i + 1 : undefined,
                            totalChunks: chunks.length > 1 ? chunks.length : undefined,
                            loadedAt: new Date().toISOString(),
                        }
                    );
                    
                    console.log(`   ✅ Inséré avec l'ID: ${id}`);
                    successCount++;
                }
            } catch (error) {
                console.error(`   ❌ Erreur: ${error.message}`);
                failCount++;
            }
        } else {
            failCount++;
        }
        
        console.log('');
    }
    
    // Résumé
    console.log('=' .repeat(50));
    console.log(`📊 Résumé:`);
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Échecs: ${failCount}`);
    console.log(`   📄 Total: ${files.length}`);
}

// Exécuter
const pdfFolder = process.argv[2] || './pdfs';
loadAllPDFs(pdfFolder)
    .then(() => {
        console.log('\n✅ Chargement terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });