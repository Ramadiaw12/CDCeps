// ============================================================
// services/uploadService.js
// Service de gestion des uploads de documents
// ============================================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { indexerDocument } from './ragService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Type de fichier non supporté : ${file.mimetype}`), false);
    }
};

// Configuration multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Service d'upload
export const uploadDocument = async (file, metadata) => {
    try {
        // Lire le contenu du fichier
        const content = fs.readFileSync(file.path, 'utf8');
        
        // Indexer dans la base RAG
        const documentId = await indexerDocument({
            titre: file.originalname,
            contenu: content,
            type_projet: metadata.type_projet || 'general',
            secteur: metadata.secteur || null,
            mots_cles: metadata.mots_cles || []
        });

        // Mettre à jour le statut du fichier
        await pool.query(
            `INSERT INTO documents (title, content, type_projet, secteur, mots_cles, actif)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [
                file.originalname,
                content,
                metadata.type_projet || 'general',
                metadata.secteur || null,
                JSON.stringify(metadata.mots_cles || []),
                true
            ]
        );

        return {
            success: true,
            documentId: documentId,
            filename: file.originalname,
            size: file.size,
            path: file.path
        };

    } catch (error) {
        console.error('❌ Erreur upload:', error.message);
        throw error;
    }
};

export const upload = upload;