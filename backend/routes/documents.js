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
import pool from '../database/mysql.js';
import { marked } from 'marked';
import puppeteer from 'puppeteer';
import { indexerDocument } from '../services/ragService.js';

const router = express.Router();

// GET /api/documents/cdc 
// Liste tous les CDC générés avec leurs métadonnées
router.get('/cdc', async (req, res) => {
    try {
        const [cdcs] = await pool.execute(
            `SELECT cdc.id, cdc.score_completude, cdc.statut,
                    cdc.version, cdc.created_at,
                    p.titre as projet_titre, p.type_projet,
                    c.nom, c.prenom, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             ORDER BY cdc.created_at DESC`
        );

        return res.json({
            succes: true,
            data: cdcs
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération CDC',
            erreur: error.message
        });
    }
});

// GET /api/documents/cdc/:id 
// Retourne le contenu complet d'un CDC
router.get('/cdc/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT cdc.*,
                    p.titre as projet_titre,
                    p.type_projet, p.description_brute,
                    c.nom, c.prenom, c.email, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             WHERE cdc.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'CDC introuvable'
            });
        }

        // Parse les sections manquantes stockées en JSON
        const cdc = rows[0];
        cdc.sections_manquantes = cdc.sections_manquantes
            ? JSON.parse(cdc.sections_manquantes)
            : [];

        return res.json({
            succes: true,
            data: cdc
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération CDC',
            erreur: error.message
        });
    }
});

// GET /api/documents/cdc/:id/markdown
// Télécharge le CDC en fichier Markdown
router.get('/cdc/:id/markdown', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT cdc.contenu_markdown, p.titre
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             WHERE cdc.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'CDC introuvable'
            });
        }

        const { contenu_markdown, titre } = rows[0];

        // Crée un nom de fichier propre depuis le titre du projet
        // Remplace les espaces et caractères spéciaux
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
        return res.status(500).json({
            succes: false,
            message: 'Erreur export Markdown',
            erreur: error.message
        });
    }
});

// GET /api/documents/cdc/:id/pdf
// Génère et télécharge le CDC en PDF
// Processus : Markdown → HTML → PDF via Puppeteer
router.get('/cdc/:id/pdf', async (req, res) => {
    let browser = null;

    try {
        const [rows] = await pool.execute(
            `SELECT cdc.contenu_markdown, cdc.score_completude,
                    p.titre as projet_titre, p.type_projet,
                    c.nom, c.prenom, c.entreprise
             FROM cahiers_des_charges cdc
             JOIN projets p ON cdc.projet_id = p.id
             JOIN clients c ON p.client_id = c.id
             WHERE cdc.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'CDC introuvable'
            });
        }

        const cdc = rows[0];

        // Étape 1 : Convertit le Markdown en HTML
        const contenuHTML = marked(cdc.contenu_markdown);

        // Étape 2 : Crée un HTML complet avec styles professionnels
        const htmlComplet = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <style>
                    /* Style général du document */
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #918e8e;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }

                    /* En-tête du document */
                    .header {
                        border-bottom: 3px solid #000000;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }

                    .header h1 {
                        color: #6082ca;
                        font-size: 22px;
                        margin: 0 0 5px 0;
                    }

                    .header .meta {
                        color: #666;
                        font-size: 11px;
                    }

                    /* Badge score de complétude */
                    .score-badge {
                        display: inline-block;
                        background: #000000;
                        color: white;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: bold;
                        margin-top: 8px;
                    }

                    /* Titres */
                    h1 { color: #7c99f8; font-size: 20px; }
                    h2 { color: #2563eb; font-size: 16px;
                         border-bottom: 1px solid #e5e7eb;
                         padding-bottom: 5px; }
                    h3 { color: #03193d; font-size: 14px; }

                    /* Tableaux */
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

                    /* Listes */
                    ul, ol { padding-left: 20px; }
                    li { margin: 4px 0; }

                    /* Code */
                    code {
                        background: #f1f5f9;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 11px;
                    }

                    /* Pied de page */
                    .footer {
                        margin-top: 40px;
                        padding-top: 15px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #999;
                        font-size: 10px;
                    }

                    /* Saut de page avant les grands titres */
                    h2 { page-break-before: auto; }
                </style>
            </head>
            <body>
                <!-- En-tête professionnel EPS SARL -->
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

                <!-- Contenu du CDC généré -->
                ${contenuHTML}

                <!-- Pied de page -->
                <div class="footer">
                    Document généré automatiquement par le système CDCEPS — EPS SARL
                    — ${new Date().toLocaleDateString('fr-FR')}
                </div>
            </body>
            </html>
        `;

        // Étape 3 : Lance Puppeteer pour générer le PDF
        browser = await puppeteer.launch({
            // headless: true = pas d'interface graphique
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Charge le HTML dans la page
        await page.setContent(htmlComplet, {
            waitUntil: 'networkidle0'
        });

        // Génère le PDF avec les options de mise en page
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            // Affiche les en-têtes et pieds de page
            displayHeaderFooter: false,
            printBackground: true
        });

        await browser.close();

        // Met à jour le chemin PDF en base
        await pool.execute(
            `UPDATE cahiers_des_charges
             SET fichier_pdf_path = 'generated'
             WHERE id = ?`,
            [req.params.id]
        );

        // Nom de fichier pour le téléchargement
        const nomFichier = cdc.projet_titre
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 50);

        // Headers pour forcer le téléchargement du PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="cdc_${nomFichier}.pdf"`
        );

        // Envoie le PDF
        return res.send(pdfBuffer);

    } catch (error) {
        // Ferme le navigateur en cas d'erreur
        if (browser) await browser.close();

        return res.status(500).json({
            succes: false,
            message: 'Erreur génération PDF',
            erreur: error.message
        });
    }
});

// POST /api/documents/rag 
// Indexe un nouveau document dans la base RAG
// Utilisé par l'interface admin PHP pour ajouter
// des anciens CDC comme références
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
        const documentId = await indexerDocument(
            titre,
            contenu,
            type_projet,
            secteur || null,
            mots_cles || []
        );

        return res.status(201).json({
            succes: true,
            message: 'Document indexé avec succès',
            data: { documentId }
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur indexation document RAG',
            erreur: error.message
        });
    }
});

// GET /api/documents/rag 
// Liste tous les documents RAG disponibles
router.get('/rag', async (req, res) => {
    try {
        const [documents] = await pool.execute(
            `SELECT id, titre, type_projet, secteur,
                    mots_cles, actif, created_at
             FROM documents_rag
             WHERE actif = TRUE
             ORDER BY created_at DESC`
        );

        return res.json({
            succes: true,
            data: documents
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération documents RAG',
            erreur: error.message
        });
    }
});

export default router;