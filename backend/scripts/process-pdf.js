// scripts/process-pdf.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { genererEmbedding } from '../services/openaiService.js';
import { indexerDocument } from '../services/ragService.js';
import PDFParser from 'pdf2json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Fonction pour lire un PDF avec pdf2json - Version corrigée
function readPDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on('pdfParser_dataError', (err) => {
            reject(err);
        });
        
        pdfParser.on('pdfParser_dataReady', (data) => {
            let text = '';
            if (data && data.Pages) {
                text = data.Pages.map(page => {
                    if (!page.Texts) return '';
                    return page.Texts.map(textItem => {
                        try {
                            // ✅ Gérer les erreurs de décodage
                            if (textItem.R && textItem.R[0] && textItem.R[0].T) {
                                return decodeURIComponent(textItem.R[0].T);
                            }
                            return '';
                        } catch (e) {
                            // ✅ Si le décodage échoue, retourner le texte brut
                            if (textItem.R && textItem.R[0] && textItem.R[0].T) {
                                return textItem.R[0].T;
                            }
                            return '';
                        }
                    }).join(' ');
                }).join('\n');
            }
            resolve(text);
        });
        
        pdfParser.loadPDF(pdfPath);
    });
}

async function processPDF(pdfPath) {
    console.log(`📖 Traitement du PDF: ${pdfPath}`);
    console.log('='.repeat(50));
    
    if (!fs.existsSync(pdfPath)) {
        console.error(`❌ Fichier non trouvé: ${pdfPath}`);
        return;
    }
    
    try {
        console.log('📄 Lecture du PDF...');
        const text = await readPDF(pdfPath);
        
        if (!text || text.length < 10) {
            console.error('❌ Impossible de lire le PDF ou texte trop court');
            console.log('📝 Texte extrait:', text ? text.substring(0, 200) : 'vide');
            return;
        }
        
        console.log(`✅ PDF lu: ${text.length} caractères`);
        console.log(`📝 Aperçu: ${text.substring(0, 200)}...`);
        
        // Nettoyer le texte
        const cleanText = text.replace(/\s+/g, ' ').trim();
        const fileName = path.basename(pdfPath, '.pdf');
        const title = fileName;
        
        console.log(`📝 Titre: ${title}`);
        console.log('🔄 Génération de l\'embedding...');
        
        const embedding = await genererEmbedding(cleanText);
        
        if (!embedding || embedding.length === 0) {
            console.error('❌ Impossible de générer l\'embedding');
            console.log('💡 Utilisation d\'un embedding aléatoire de secours...');
            const fallbackEmbedding = new Array(768).fill(0).map(() => Math.random() * 0.1);
            
            try {
                const id = await indexerDocument({
                    titre: title,
                    contenu: cleanText,
                    type_projet: 'general',
                    secteur: 'general',
                    mots_cles: ['pdf', 'document'],
                    metadata: {
                        source: pdfPath,
                        processedAt: new Date().toISOString(),
                        embedding_used: 'fallback'
                    }
                });
                console.log(`✅ Document indexé avec ID: ${id} (fallback)`);
            } catch (error) {
                console.error('❌ Erreur indexation:', error.message);
            }
            return;
        }
        
        console.log(`✅ Embedding généré (${embedding.length} dimensions)`);
        console.log('📥 Indexation du document...');
        
        const id = await indexerDocument({
            titre: title,
            contenu: cleanText,
            type_projet: 'general',
            secteur: 'general',
            mots_cles: ['pdf', 'document'],
            metadata: {
                source: pdfPath,
                processedAt: new Date().toISOString()
            }
        });
        console.log(`✅ Document indexé avec succès! ID: ${id}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

const pdfPath = process.argv[2];

if (!pdfPath) {
    console.error('❌ Usage: node scripts/process-pdf.js <chemin_vers_le_pdf>');
    console.log('   Exemple: node scripts/process-pdf.js ./pdfs/mon-document.pdf');
    process.exit(1);
}

processPDF(pdfPath)
    .then(() => {
        console.log('\n✅ Traitement terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });