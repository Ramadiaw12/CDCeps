import { useState, useRef } from 'react';

function UploadDocuments({ projetId }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleUpload = async () => {
        if (files.length === 0 || !projetId) return;
        setUploading(true);

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('document', file);

                await fetch('http://localhost:3001/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                });
            }
            alert('✅ Documents uploadés avec succès !');
            setFiles([]);
        } catch (error) {
            alert('❌ Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '20px',
            marginTop: '15px',
            background: '#f8fafc'
        }}>
            <h4>📎 Documents supports</h4>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
                Ajoutez des documents pour enrichir la base de connaissances
            </p>

            <div
                style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#ffffff'
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                📤 Glissez-déposez vos fichiers ici
                <br />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    ou cliquez pour sélectionner
                </span>
                <br />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Formats : PDF, DOC, DOCX, TXT
                </span>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                />
            </div>

            {files.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <p><strong>{files.length} fichier(s) sélectionné(s)</strong></p>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{
                            padding: '8px 20px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        {uploading ? 'Upload en cours...' : '📥 Uploader'}
                    </button>

                    <ul style={{ marginTop: '10px', padding: 0 }}>
                        {files.map((file, index) => (
                            <li key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '5px 10px',
                                borderBottom: '1px solid #e2e8f0'
                            }}>
                                <span>{file.name}</span>
                                <button
                                    onClick={() => removeFile(index)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'red',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default UploadDocuments;