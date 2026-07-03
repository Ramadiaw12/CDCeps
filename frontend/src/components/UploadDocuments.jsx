// ============================================================
// components/UploadDocuments.jsx
// Composant d'upload de documents
// ============================================================

import { useState, useRef } from 'react';
import './UploadDocuments.css';

function UploadDocuments({ projetId, onUploadComplete }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const newFiles = selectedFiles.map(file => ({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending'
        }));
        setFiles([...files, ...newFiles]);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const fileItem = files[i];
                const formData = new FormData();
                formData.append('document', fileItem.file);
                formData.append('type_projet', 'general');
                formData.append('secteur', 'informatique');
                formData.append('mots_cles', JSON.stringify(['exemple', 'test']));

                const response = await fetch(`http://localhost:3001/api/documents/upload`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (data.succes) {
                    setFiles(prev => prev.map((f, idx) => 
                        idx === i ? { ...f, status: 'success' } : f
                    ));
                } else {
                    setFiles(prev => prev.map((f, idx) => 
                        idx === i ? { ...f, status: 'error', error: data.message } : f
                    ));
                }

                setProgress((i + 1) / files.length * 100);
            }

            if (onUploadComplete) {
                onUploadComplete();
            }

        } catch (error) {
            console.error('Erreur upload:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="upload-container">
            <div className="upload-header">
                <h3>📎 Documents supports</h3>
                <p className="upload-description">
                    Téléchargez des documents pour enrichir la base RAG
                </p>
            </div>

            {/* Zone de drag & drop */}
            <div 
                className="upload-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const droppedFiles = Array.from(e.dataTransfer.files);
                    const newFiles = droppedFiles.map(file => ({
                        file,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        status: 'pending'
                    }));
                    setFiles([...files, ...newFiles]);
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="upload-icon">📤</div>
                <p className="upload-text">
                    Glissez-déposez vos fichiers ici<br/>
                    <span className="upload-subtext">ou cliquez pour sélectionner</span>
                </p>
                <p className="upload-formats">
                    Formats acceptés : PDF, DOC, DOCX, TXT, JSON
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.json"
                    style={{ display: 'none' }}
                />
            </div>

            {/* Liste des fichiers */}
            {files.length > 0 && (
                <div className="upload-files">
                    <div className="files-header">
                        <span>{files.length} fichier(s) sélectionné(s)</span>
                        <button 
                            className="btn-upload"
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <span className="uploading-text">Upload en cours...</span>
                            ) : (
                                '📥 Tout uploader'
                            )}
                        </button>
                    </div>

                    {uploading && (
                        <div className="upload-progress">
                            <div 
                                className="progress-bar"
                                style={{ width: `${progress}%` }}
                            />
                            <span className="progress-text">{Math.round(progress)}%</span>
                        </div>
                    )}

                    <ul className="file-list">
                        {files.map((fileItem, index) => (
                            <li key={index} className={`file-item ${fileItem.status}`}>
                                <span className="file-icon">
                                    {fileItem.type.includes('pdf') ? '📄' :
                                     fileItem.type.includes('word') ? '📝' :
                                     fileItem.type.includes('text') ? '📃' : '📎'}
                                </span>
                                <span className="file-name">{fileItem.name}</span>
                                <span className="file-size">{formatSize(fileItem.size)}</span>
                                <span className="file-status">
                                    {fileItem.status === 'pending' && '⏳ En attente'}
                                    {fileItem.status === 'success' && '✅ Fait'}
                                    {fileItem.status === 'error' && '❌ Erreur'}
                                </span>
                                {fileItem.status === 'pending' && !uploading && (
                                    <button 
                                        className="btn-remove"
                                        onClick={() => removeFile(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default UploadDocuments;