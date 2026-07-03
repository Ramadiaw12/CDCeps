import { useState, useRef } from 'react';

function UploadDocuments({ projetId }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        setUploadProgress(0);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            alert('⚠️ Aucun fichier sélectionné');
            return;
        }

        if (!projetId) {
            alert('⚠️ Veuillez d\'abord créer le projet');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            let uploaded = 0;
            for (const file of files) {
                const formData = new FormData();
                formData.append('document', file);
                formData.append('projetId', projetId); // ✅ Envoyer l'ID du projet

                const response = await fetch('http://localhost:3001/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erreur upload');
                }

                uploaded++;
                setUploadProgress(Math.round((uploaded / files.length) * 100));
            }

            alert(`✅ ${files.length} document(s) uploadé(s) avec succès !`);
            setFiles([]);
            setUploadProgress(0);

        } catch (error) {
            console.error('Erreur upload:', error);
            alert(`❌ Erreur : ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
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

            {/* Zone de drop */}
            <div
                style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#ffffff',
                    transition: 'all 0.3s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#4f46e5';
                    e.currentTarget.style.background = '#eef2ff';
                }}
                onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#ffffff';
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#ffffff';
                    const droppedFiles = Array.from(e.dataTransfer.files);
                    setFiles(prev => [...prev, ...droppedFiles]);
                }}
            >
                📤 Glissez-déposez vos fichiers ici
                <br />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    ou cliquez pour sélectionner
                </span>
                <br />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Formats : PDF, DOC, DOCX, TXT (max 5MB)
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

            {/* Liste des fichiers */}
            {files.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                        <p style={{ margin: 0 }}>
                            <strong>{files.length} fichier(s) sélectionné(s)</strong>
                        </p>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !projetId}
                            style={{
                                padding: '8px 20px',
                                background: uploading ? '#94a3b8' : '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {uploading ? `Upload en cours... ${uploadProgress}%` : '📥 Uploader'}
                        </button>
                    </div>

                    {/* Barre de progression */}
                    {uploading && (
                        <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginBottom: '10px'
                        }}>
                            <div style={{
                                width: `${uploadProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #4f46e5, #10b981)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    )}

                    {/* Liste */}
                    <ul style={{
                        marginTop: '10px',
                        padding: 0,
                        listStyle: 'none',
                        maxHeight: '150px',
                        overflowY: 'auto'
                    }}>
                        {files.map((file, index) => (
                            <li key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 10px',
                                borderBottom: '1px solid #e2e8f0',
                                fontSize: '13px'
                            }}>
                                <span>
                                    {file.name}
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#94a3b8',
                                        marginLeft: '8px'
                                    }}>
                                        ({formatFileSize(file.size)})
                                    </span>
                                </span>
                                {!uploading && (
                                    <button
                                        onClick={() => removeFile(index)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            padding: '0 5px'
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    {!projetId && (
                        <p style={{
                            fontSize: '12px',
                            color: '#ef4444',
                            marginTop: '8px'
                        }}>
                            ⚠️ Créez d'abord le projet pour pouvoir uploader des documents
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default UploadDocuments;