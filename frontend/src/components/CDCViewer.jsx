// ============================================================
// components/CDCViewer.jsx
// Affiche le contenu Markdown du CDC de façon lisible
// Utilise react-markdown pour le rendu
// ============================================================


 // ============================================================
// components/CDCViewer.jsx
// Affiche le contenu Markdown du CDC avec mise en forme
// ============================================================

import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import './CDCViewer.css';

function CDCViewer({ contenu }) {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current && contenu) {
            // Convertir le Markdown en HTML
            const html = marked(contenu, {
                breaks: true,
                gfm: true,
                headerIds: true
            });
            contentRef.current.innerHTML = html;
        }
    }, [contenu]);

    if (!contenu) {
        return <p className="cdc-empty">Aucun contenu disponible</p>;
    }

    return (
        <div className="cdc-viewer" ref={contentRef} />
    );
}

export default CDCViewer;