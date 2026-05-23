// ============================================================
// components/CDCViewer.jsx
// Affiche le contenu Markdown du CDC de façon lisible
// Utilise react-markdown pour le rendu
// ============================================================

import ReactMarkdown from 'react-markdown';

function CDCViewer({ contenu }) {
    if (!contenu) return null;

    return (
        <div style={styles.container}>
            <ReactMarkdown
                components={{
                    // Personnalise le rendu de chaque élément Markdown

                    h1: ({ children }) => (
                        <h1 style={styles.h1}>{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 style={styles.h2}>{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 style={styles.h3}>{children}</h3>
                    ),
                    p: ({ children }) => (
                        <p style={styles.p}>{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul style={styles.ul}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol style={styles.ol}>{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li style={styles.li}>{children}</li>
                    ),
                    // Rendu des tableaux Markdown
                    table: ({ children }) => (
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>{children}</table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th style={styles.th}>{children}</th>
                    ),
                    td: ({ children }) => (
                        <td style={styles.td}>{children}</td>
                    ),
                    // Blocs de code
                    code: ({ children }) => (
                        <code style={styles.code}>{children}</code>
                    ),
                    // Texte en gras
                    strong: ({ children }) => (
                        <strong style={styles.strong}>{children}</strong>
                    ),
                    // Séparateur horizontal
                    hr: () => <hr style={styles.hr} />
                }}
            >
                {contenu}
            </ReactMarkdown>
        </div>
    );
}

// ── Styles ───────────────────────────────────────────────────
const styles = {
    container: {
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: '14px',
        lineHeight: '1.8',
        color: '#1e293b'
    },
    h1: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '8px',
        marginTop: '32px',
        paddingBottom: '8px',
        borderBottom: '2px solid #2563eb'
    },
    h2: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e40af',
        marginBottom: '12px',
        marginTop: '28px',
        paddingBottom: '6px',
        borderBottom: '1px solid #e2e8f0'
    },
    h3: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '8px',
        marginTop: '20px'
    },
    p: {
        marginBottom: '14px',
        color: '#374151'
    },
    ul: {
        paddingLeft: '20px',
        marginBottom: '14px'
    },
    ol: {
        paddingLeft: '20px',
        marginBottom: '14px'
    },
    li: {
        marginBottom: '6px',
        color: '#374151'
    },
    tableWrapper: {
        overflowX: 'auto',
        marginBottom: '20px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
    },
    th: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '10px 14px',
        textAlign: 'left',
        fontWeight: '500'
    },
    td: {
        padding: '9px 14px',
        borderBottom: '1px solid #e2e8f0',
        color: '#374151'
    },
    code: {
        backgroundColor: '#f1f5f9',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#0f172a'
    },
    strong: {
        fontWeight: '600',
        color: '#0f172a'
    },
    hr: {
        border: 'none',
        borderTop: '1px solid #e2e8f0',
        margin: '24px 0'
    }
};

export default CDCViewer;