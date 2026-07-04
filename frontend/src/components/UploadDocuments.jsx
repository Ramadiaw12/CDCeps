import { useState, useRef } from 'react';
import './UploadDocuments.css';

function UploadDocuments({ projetId }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        setUploadProgress(0);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            alert('Aucun fichier sélectionné');
            return;
        }

        if (!projetId) {
            alert('Veuillez d\'abord créer le projet');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            let uploaded = 0;
            for (const file of files) {
                const formData = new FormData();
                formData.append('document', file);
                formData.append('projetId', projetId);

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

            alert(`${files.length} document(s) uploadé(s) avec succès !`);
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
        <div className="upload-container">
            <div className="upload-header">
                <span className="upload-header-icon">📎</span>
                <h4 className="upload-title">Documents supports</h4>
                <span className="upload-badge">optionnel</span>
            </div>
            <p className="upload-subtitle">
                Ajoutez des documents pour enrichir la base de connaissances
            </p>

            <div
                className={`upload-dropzone ${isDragging ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const droppedFiles = Array.from(e.dataTransfer.files);
                    setFiles(prev => [...prev, ...droppedFiles]);
                }}
            >
                <span className="upload-dropzone-icon">📤</span>
                <p className="upload-dropzone-text">Glissez-déposez vos fichiers ici</p>
                <p className="upload-dropzone-subtext">ou cliquez pour sélectionner</p>
                <span className="upload-dropzone-formats">
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

            {files.length > 0 && (
                <div className="upload-files-section">
                    <div className="upload-files-header">
                        <span className="upload-files-count">
                            {files.length} fichier(s) sélectionné(s)
                            <span>{files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024 > 1 ? 
                                ` ${(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)} MB` : 
                                ''}
                            </span>
                        </span>
                        <button
                            className="btn-upload-files"
                            onClick={handleUpload}
                            disabled={uploading || !projetId}
                        >
                            {uploading ? (
                                <>
                                    <span className="spinner-small" />
                                    Upload {uploadProgress}%
                                </>
                            ) : (
                                '📥 Uploader'
                            )}
                        </button>
                    </div>

                    {uploading && (
                        <>
                            <span className="upload-progress-text">{uploadProgress}%</span>
                            <div className="upload-progress-bar">
                                <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </>
                    )}

                    <ul className="upload-file-list">
                        {files.map((file, index) => (
                            <li key={index} className="upload-file-item">
                                <div className="upload-file-info">
                                    <span className="upload-file-icon">📄</span>
                                    <span className="upload-file-name">{file.name}</span>
                                    <span className="upload-file-size">({formatFileSize(file.size)})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className={`upload-file-status ${uploading ? 'uploading' : 'pending'}`}>
                                        {uploading ? '⏳ Upload...' : 'En attente'}
                                    </span>
                                    {!uploading && (
                                        <button
                                            className="btn-remove-file"
                                            onClick={() => removeFile(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {!projetId && (
                        <div className="upload-no-project">
                            ⚠️ Créez d'abord le projet pour pouvoir uploader des documents
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UploadDocuments;