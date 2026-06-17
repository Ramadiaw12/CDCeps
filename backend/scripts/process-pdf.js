// scripts/process-pdf.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import dotenv from 'dotenv';
import { genererEmbedding } from '../services/openaiService.js';
import { indexerDocument } from '../services/ragService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function processPDF(pdfPath) {
    console.log(`📖 Traitement du PDF: ${pdfPath}`);
    console.log('='.repeat(50));
    
    if (!fs.existsSync(pdfPath)) {
        console.error(`❌ Fichier non trouvé: ${pdfPath}`);
        return;
    }
    
    console.log('📄 Lecture du PDF...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    console.log(`✅ PDF lu: ${data.numpages} pages, ${text.length} caractères`);
    
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
                    pages: data.numpages,
                    size: fs.statSync(pdfPath).size,
                    processedAt: new Date().toISOString(),
                    embedding_used: 'fallback'
                }
            });
            console.log(`✅ Document indexé avec ID: ${id}`);
        } catch (error) {
            console.error('❌ Erreur indexation:', error.message);
        }
        return;
    }
    
    console.log(`✅ Embedding généré (${embedding.length} dimensions)`);
    console.log('📥 Indexation du document...');
    
    try {
        const id = await indexerDocument({
            titre: title,
            contenu: cleanText,
            type_projet: 'general',
            secteur: 'general',
            mots_cles: ['pdf', 'document'],
            metadata: {
                source: pdfPath,
                pages: data.numpages,
                size: fs.statSync(pdfPath).size,
                processedAt: new Date().toISOString()
            }
        });
        console.log(`✅ Document indexé avec succès! ID: ${id}`);
    } catch (error) {
        console.error('❌ Erreur indexation:', error.message);
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