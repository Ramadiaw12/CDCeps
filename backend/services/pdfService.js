// ============================================================
// services/pdfService.js
// Service de génération PDF professionnel avec PDFKit
// Style ingénieur - Mise en page élégante et structurée
// ============================================================

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONSTANTES DE STYLE
// ============================================================

const COLORS = {
    primary: '#1e293b',      // Texte principal
    secondary: '#475569',    // Texte secondaire
    accent: '#4f46e5',       // Accent (indigo)
    success: '#10b981',      // Vert pour scores
    warning: '#f59e0b',      // Orange pour alertes
    danger: '#ef4444',       // Rouge pour erreurs
    light: '#f8fafc',        // Fond clair
    border: '#e2e8f0',       // Bordures
    white: '#ffffff',        // Blanc
};

const FONTS = {
    title: 'Helvetica-Bold',
    heading: 'Helvetica-Bold',
    subtitle: 'Helvetica-BoldOblique',
    body: 'Helvetica',
    bodyBold: 'Helvetica-Bold',
    mono: 'Courier',
};

const SIZES = {
    title: 24,
    heading1: 18,
    heading2: 14,
    heading3: 12,
    body: 11,
    small: 9,
    caption: 8,
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

const getScoreColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
};

const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Très Bon';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'À Améliorer';
};

// 
// FONCTION PRINCIPALE DE GÉNÉRATION PDF
// 

/**
 * Génère un PDF professionnel à partir d'un contenu Markdown
 * @param {string} markdownContent - Contenu en Markdown
 * @param {string} outputPath - Chemin de sortie
 * @param {Object} metadata - Métadonnées du CDC
 * @returns {Promise<string>} Chemin du fichier généré
 */
export const generatePDF = async (markdownContent, outputPath, metadata = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 60, bottom: 60, left: 50, right: 50 },
                info: {
                    Title: metadata.titre || 'Cahier des Charges',
                    Author: metadata.auteur || 'EPS SARL',
                    Subject: 'CDC',
                    Keywords: 'CDC, projet, cahier des charges',
                    CreationDate: new Date(),
                },
                font: 'Helvetica',
            });

            // Écrire le PDF dans un fichier
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // 
            // 1. EN-TÊTE PROFESSIONNEL
            // 
            
            // Logo / En-tête
            doc.rect(50, 30, 495, 80)
               .fill(COLORS.primary);
            
            doc.fillColor(COLORS.white)
               .font(FONTS.title)
               .fontSize(20)
               .text('CAHIER DES CHARGES', 60, 48, { 
                   width: 400,
               });
            
            doc.font(FONTS.subtitle)
               .fontSize(11)
               .text('Document Technique et Fonctionnel', 60, 78, {
                   width: 400,
               });
            
            // Numéro de document
            const docId = metadata.id || 'CDC-001';
            const docDate = metadata.date || new Date().toLocaleDateString('fr-FR');
            
            doc.font(FONTS.body)
               .fontSize(9)
               .fillColor(COLORS.white)
               .text(`Document: ${docId}`, 400, 48, { align: 'right' })
               .text(`Date: ${docDate}`, 400, 68, { align: 'right' })
               .text(`Version: ${metadata.version || '1.0'}`, 400, 88, { align: 'right' });

            // Ligne décorative
            doc.strokeColor(COLORS.accent)
               .lineWidth(3)
               .moveTo(50, 120)
               .lineTo(545, 120)
               .stroke();

            let yPosition = 140;

            // 
            // 2. TITRE DU PROJET
            // 
            
            const titre = metadata.titre || 'Projet';
            
            doc.fillColor(COLORS.primary)
               .font(FONTS.title)
               .fontSize(SIZES.title)
               .text(titre, 50, yPosition, {
                   width: 400,
                   height: 60,
               });
            
            yPosition = doc.y + 20;

            // 
            // 3. INFORMATIONS GÉNÉRALES (si présentes)
            // 
            
            if (metadata.client || metadata.type || metadata.budget) {
                doc.fillColor(COLORS.secondary)
                   .font(FONTS.body)
                   .fontSize(SIZES.small);
                
                const infoLines = [];
                if (metadata.client) infoLines.push(`Client: ${metadata.client}`);
                if (metadata.type) infoLines.push(`Type de projet: ${metadata.type}`);
                if (metadata.budget) infoLines.push(`Budget estimé: ${metadata.budget}`);
                if (metadata.delai) infoLines.push(`Délai: ${metadata.delai}`);
                
                if (infoLines.length > 0) {
                    infoLines.forEach((line, index) => {
                        doc.text(line, 50, yPosition + (index * 18));
                    });
                    yPosition += (infoLines.length * 18) + 10;
                }
            }

            // 
            // 4. SCORE DE COMPLÉTUDE (si disponible)
            // 
            
            if (metadata.score !== undefined) {
                const score = metadata.score;
                const scoreColor = getScoreColor(score);
                const scoreLabel = getScoreLabel(score);
                
                // Rectangle de score
                const scoreX = 50;
                const scoreY = yPosition;
                const scoreWidth = 150;
                const scoreHeight = 70;
                
                doc.rect(scoreX, scoreY, scoreWidth, scoreHeight)
                   .fill(scoreColor);
                
                doc.fillColor(COLORS.white)
                   .font(FONTS.bodyBold)
                   .fontSize(24)
                   .text(`${score}%`, scoreX + 20, scoreY + 12, {
                       width: scoreWidth - 40,
                       align: 'center',
                   });
                
                doc.fontSize(11)
                   .text(scoreLabel, scoreX + 20, scoreY + 42, {
                       width: scoreWidth - 40,
                       align: 'center',
                   });
                
                yPosition += scoreHeight + 20;
            }

            // 
            // 5. CONTENU PRINCIPAL (Markdown converti)
            // 
            
            // Ajouter une ligne de séparation
            doc.strokeColor(COLORS.border)
               .lineWidth(1)
               .moveTo(50, yPosition)
               .lineTo(545, yPosition)
               .stroke();
            
            yPosition += 15;

            // Convertir et afficher le contenu
            const lines = markdownContent.split('\n');
            let currentHeading = 0;
            let inList = false;
            let listIndent = 0;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (!trimmedLine) {
                    if (inList) {
                        inList = false;
                        yPosition += 4;
                    }
                    continue;
                }

                // Détection des titres
                if (trimmedLine.startsWith('# ')) {
                    const text = trimmedLine.substring(2);
                    doc.fillColor(COLORS.primary)
                       .font(FONTS.heading)
                       .fontSize(SIZES.heading1)
                       .text(text, 50, yPosition, { 
                           width: 495,
                           continued: false,
                       });
                    yPosition = doc.y + 8;
                    currentHeading = 1;
                    inList = false;
                    continue;
                }
                
                if (trimmedLine.startsWith('## ')) {
                    const text = trimmedLine.substring(3);
                    doc.fillColor(COLORS.primary)
                       .font(FONTS.heading)
                       .fontSize(SIZES.heading2)
                       .text(text, 50, yPosition, { 
                           width: 495,
                           continued: false,
                       });
                    yPosition = doc.y + 6;
                    currentHeading = 2;
                    inList = false;
                    continue;
                }
                
                if (trimmedLine.startsWith('### ')) {
                    const text = trimmedLine.substring(4);
                    doc.fillColor(COLORS.secondary)
                       .font(FONTS.heading)
                       .fontSize(SIZES.heading3)
                       .text(text, 50, yPosition, { 
                           width: 495,
                           continued: false,
                       });
                    yPosition = doc.y + 4;
                    currentHeading = 3;
                    inList = false;
                    continue;
                }

                // Listes
                if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    const text = trimmedLine.substring(2);
                    const bullet = '•';
                    
                    if (!inList) {
                        inList = true;
                        yPosition += 2;
                    }
                    
                    doc.fillColor(COLORS.secondary)
                       .font(FONTS.body)
                       .fontSize(SIZES.body)
                       .text(`${bullet} ${text}`, 50, yPosition, {
                           width: 485,
                           indent: 20,
                       });
                    yPosition = doc.y + 2;
                    continue;
                }

                // Paragraphe normal
                if (!inList) {
                    doc.fillColor(COLORS.primary)
                       .font(FONTS.body)
                       .fontSize(SIZES.body)
                       .text(trimmedLine, 50, yPosition, {
                           width: 495,
                           lineGap: 3,
                       });
                    yPosition = doc.y + 4;
                } else {
                    inList = false;
                }
            }

            // 
            // 6. PIED DE PAGE
            // 
            
            // Ligne de séparation
            doc.strokeColor(COLORS.border)
               .lineWidth(1)
               .moveTo(50, 750)
               .lineTo(545, 750)
               .stroke();

            // Informations de pied de page
            doc.fillColor(COLORS.secondary)
               .font(FONTS.body)
               .fontSize(SIZES.caption)
               .text('© EPS SARL - Tous droits réservés', 50, 760, {
                   width: 495,
                   align: 'center',
               });

            // Numéro de page
            const totalPages = doc.bufferedPageRange().count;
            if (totalPages > 0) {
                doc.text(`Page 1 sur ${totalPages}`, 50, 775, {
                    width: 495,
                    align: 'center',
                });
            }

            // 
            // 7. FINALISATION
            // 
            
            doc.end();

            stream.on('finish', () => {
                console.log('PDF généré avec succès');
                resolve(outputPath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            console.error('❌ Erreur génération PDF:', error.message);
            reject(error);
        }
    });
};

// 
// EXPORT
// 

export default generatePDF;
