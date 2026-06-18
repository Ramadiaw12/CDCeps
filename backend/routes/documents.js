// ============================================================
// routes/documents.js
// Endpoints pour la gestion des CDC générés
//
// GET  /api/documents/cdc/:id           Récupère un CDC
// GET  /api/documents/cdc               Liste tous les CDC
// GET  /api/documents/cdc/:id/markdown  Télécharge en .md
// GET  /api/documents/cdc/:id/pdf       Télécharge en PDF
// POST /api/documents/rag               Indexe un document RAG
// GET  /api/documents/rag               Liste documents RAG
// ============================================================

import express from 'express';
// On importe le pool PostgreSQL au lieu de MySQL
import pool from '../database/postgres.js';
import { marked } from 'marked';
import puppeteer from 'puppeteer';
import { indexerDocument } from '../services/ragService.js';

const router = express.Router();

// 
// GET /api/documents/cdc 
// Liste tous les CDC générés avec leurs métadonnées
// 
router.get('/cdc', async (req, res) => {
    try {
        // PostgreSQL : On utilise pool.query() au lieu de pool.execute()
        // Les paramètres sont $1, $2... au lieu de ?
        // Le résultat est dans result.rows au lieu de [rows]
        const result = await pool.query(
            `SELECT cdc.id, cdc.score_completude, cdc.statut,
                    cdc.version, cdc.created_at,
                    p.titre as projet_titre, p.type_projet,
                    c.nom, c.prenom, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             ORDER BY cdc.created_at DESC`
        );

        // result.rows contient les données
        return res.json({
            succes: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Erreur récupération CDC:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération CDC',
            erreur: error.message
        });
    }
});

// 
// GET /api/documents/cdc/:id 
// Retourne le contenu complet d'un CDC
// 
router.get('/cdc/:id', async (req, res) => {
    try {
        // PostgreSQL : $1 au lieu de ?
        const result = await pool.query(
            `SELECT cdc.*,
                    p.titre as projet_titre,
                    p.type_projet, p.description_brute,
                    c.nom, c.prenom, c.email, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             WHERE cdc.id = $1`,
            [req.params.id]
        );

        // result.rows au lieu de rows
        if (result.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'CDC introuvable'
            });
        }

        // On récupère le premier résultat
        const cdc = result.rows[0];
        
        // Parse les sections manquantes stockées en JSON
        // PostgreSQL stocke déjà en JSONB, mais on parse si c'est une string
        if (cdc.sections_manquantes) {
            try {
                cdc.sections_manquantes = typeof cdc.sections_manquantes === 'string'
                    ? JSON.parse(cdc.sections_manquantes)
                    : cdc.sections_manquantes;
            } catch (e) {
                cdc.sections_manquantes = [];
            }
        } else {
            cdc.sections_manquantes = [];
        }

        return res.json({
            succes: true,
            data: cdc
        });

    } catch (error) {
        console.error('Erreur récupération CDC:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération CDC',
            erreur: error.message
        });
    }
});

// 
// GET /api/documents/cdc/:id/markdown
// Télécharge le CDC en fichier Markdown
// 
router.get('/cdc/:id/markdown', async (req, res) => {
    try {
        // PostgreSQL : $1 au lieu de ?
        const result = await pool.query(
            `SELECT cdc.contenu_markdown, p.titre
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             WHERE cdc.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'CDC introuvable'
            });
        }

        // result.rows[0] au lieu de rows[0]
        const { contenu_markdown, titre } = result.rows[0];

        // Crée un nom de fichier propre depuis le titre du projet
        const nomFichier = titre
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 50);

        // Définit les headers pour forcer le téléchargement
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="cdc_${nomFichier}.md"`
        );

        // Envoie directement le contenu Markdown
        return res.send(contenu_markdown);

    } catch (error) {
        console.error('Erreur export Markdown:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur export Markdown',
            erreur: error.message
        });
    }
});

// 
// GET /api/documents/cdc/:id/pdf
// Génère et télécharge le CDC en PDF
// Processus : Markdown  HTML  PDF via Puppeteer
// 
router.get('/cdc/:id/pdf', async (req, res) => {
    let browser = null;

    try {
        // PostgreSQL : $1 au lieu de ?
        const result = await pool.query(
            `SELECT cdc.contenu_markdown, cdc.score_completude,
                    p.titre as projet_titre, p.type_projet,
                    c.nom, c.prenom, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             WHERE cdc.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'CDC introuvable'
            });
        }

        // esult.rows[0] au lieu de rows[0]
        const cdc = result.rows[0];

        // Étape 1 : Convertit le Markdown en HTML
        const contenuHTML = marked(cdc.contenu_markdown);

        // Étape 2 : Crée un HTML complet avec styles professionnels
        const htmlComplet = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        border-bottom: 3px solid #2563eb;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #2563eb;
                        font-size: 22px;
                        margin: 0 0 5px 0;
                    }
                    .header .meta {
                        color: #666;
                        font-size: 11px;
                    }
                    .score-badge {
                        display: inline-block;
                        background: #2563eb;
                        color: white;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: bold;
                        margin-top: 8px;
                    }
                    h1 { color: #2563eb; font-size: 20px; }
                    h2 { color: #1e40af; font-size: 16px;
                         border-bottom: 1px solid #e5e7eb;
                         padding-bottom: 5px; }
                    h3 { color: #1e3a5f; font-size: 14px; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 11px;
                    }
                    th {
                        background: #2563eb;
                        color: white;
                        padding: 8px;
                        text-align: left;
                    }
                    td {
                        padding: 7px 8px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    tr:nth-child(even) { background: #f8fafc; }
                    ul, ol { padding-left: 20px; }
                    li { margin: 4px 0; }
                    code {
                        background: #f1f5f9;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 11px;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 15px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #999;
                        font-size: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>EPS SARL — Cahier des Charges Préliminaire</h1>
                    <div class="meta">
                        <strong>Projet :</strong> ${cdc.projet_titre} |
                        <strong>Client :</strong> ${cdc.prenom} ${cdc.nom}
                        ${cdc.entreprise ? `(${cdc.entreprise})` : ''} |
                        <strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div class="score-badge">
                        Score de complétude : ${cdc.score_completude}/100
                    </div>
                </div>
                ${contenuHTML}
                <div class="footer">
                    Document généré automatiquement par le système CDCEPS — EPS SARL
                    — ${new Date().toLocaleDateString('fr-FR')}
                </div>
            </body>
            </html>
        `;

        // Étape 3 : Lance Puppeteer pour générer le PDF
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlComplet, {
            waitUntil: 'networkidle0'
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: false,
            printBackground: true
        });

        await browser.close();

        // Mise à jour en PostgreSQL : $1 au lieu de ?
        await pool.query(
            `UPDATE cahiers_des_charges
             SET fichier_pdf_path = 'generated'
             WHERE id = $1`,
            [req.params.id]
        );

        const nomFichier = cdc.projet_titre
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 50);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="cdc_${nomFichier}.pdf"`
        );

        return res.send(pdfBuffer);

    } catch (error) {
        if (browser) await browser.close();
        console.error('Erreur génération PDF:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur génération PDF',
            erreur: error.message
        });
    }
});

// 
// POST /api/documents/rag 
// Indexe un nouveau document dans la base RAG
// Utilisé par l'interface admin pour ajouter des références
// 
router.post('/rag', async (req, res) => {
    try {
        const {
            titre,
            contenu,
            type_projet,
            secteur,
            mots_cles
        } = req.body;

        if (!titre || !contenu || !type_projet) {
            return res.status(400).json({
                succes: false,
                message: 'Champs obligatoires : titre, contenu, type_projet'
            });
        }

        // Indexe le document avec génération d'embedding
        // La fonction indexerDocument utilise déjà PostgreSQL
        const documentId = await indexerDocument({
            titre,
            contenu,
            type_projet,
            secteur: secteur || null,
            mots_cles: mots_cles || []
        });

        return res.status(201).json({
            succes: true,
            message: 'Document indexé avec succès',
            data: { documentId }
        });

    } catch (error) {
        console.error('Erreur indexation RAG:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur indexation document RAG',
            erreur: error.message
        });
    }
});

// 
// GET /api/documents/rag 
// Liste tous les documents RAG disponibles
// 
router.get('/rag', async (req, res) => {
    try {
        // PostgreSQL : On utilise pool.query()
        // Note : La table s'appelle "documents" (nouvelle table PostgreSQL)
        // et non "documents_rag" (ancienne table MySQL)
        const result = await pool.query(
            `SELECT id, title as titre, type_projet, secteur,
                    mots_cles, actif, created_at
             FROM documents
             WHERE actif = TRUE
             ORDER BY created_at DESC`
        );

        return res.json({
            succes: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Erreur récupération documents RAG:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération documents RAG',
            erreur: error.message
        });
    }
});

export default router;