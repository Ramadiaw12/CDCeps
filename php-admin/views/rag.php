<?php
// ============================================================
// views/rag.php
// Gestion de la base documentaire RAG
// Permet d'ajouter, activer/désactiver des documents
// ============================================================


// ============================================================
// views/rag.php
// Gestion de la base documentaire RAG
// Permet d'ajouter, activer/désactiver des documents
// ============================================================

// 
// VÉRIFICATION QUE LA VARIABLE $documents EXISTE
// Si elle n'existe pas, on la définit comme un tableau vide
// 
if (!isset($documents)) {
    $documents = [];
}

// 
// AFFICHAGE DES MESSAGES DE SUCCÈS OU D'ERREUR
// 
$message = $_SESSION['message'] ?? null;
$message_type = $_SESSION['message_type'] ?? 'info';
unset($_SESSION['message'], $_SESSION['message_type']);
?>

<!-- 
     DÉBUT DE LA VUE
      -->
<div class="rag-container">

    <!-- 
         TITRE DE LA PAGE
          -->
    <div class="rag-header">
        <h1 class="rag-title">📚 Gestion des Documents RAG</h1>
        <p class="rag-subtitle">Indexez vos documents pour enrichir la base de connaissances</p>
    </div>

    <!-- 
         AFFICHAGE DES MESSAGES FLASH
          -->
    <?php if ($message): ?>
        <div class="alert alert-<?= $message_type ?>">
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <!-- 
         FORMULAIRE D'UPLOAD
          -->
    <div class="rag-card">
        <div class="rag-card-header">
            <span class="rag-card-icon">📤</span>
            <h3>Ajouter un document</h3>
            <span class="rag-card-badge">PDF, DOC, DOCX, TXT</span>
        </div>
        <div class="rag-card-body">
            <form action="index.php?controller=rag&action=upload" method="POST" enctype="multipart/form-data">
                <div class="rag-form-grid">
                    <div class="rag-form-group">
                        <label for="pdf">Fichier <span class="required">*</span></label>
                        <input type="file" id="pdf" name="pdf" accept=".pdf,.doc,.docx,.txt" required>
                        <small>Formats acceptés : PDF, DOC, DOCX, TXT (max 5MB)</small>
                    </div>
                    <div class="rag-form-group">
                        <label for="type_projet">Type de projet</label>
                        <select id="type_projet" name="type_projet">
                            <option value="general">📁 Général</option>
                            <option value="web">🌐 Web</option>
                            <option value="mobile">📱 Mobile</option>
                            <option value="logiciel">💻 Logiciel</option>
                            <option value="infrastructure">🏗️ Infrastructure</option>
                            <option value="ecommerce">🛒 E-commerce</option>
                            <option value="erp">🏢 ERP</option>
                        </select>
                    </div>
                    <div class="rag-form-group">
                        <label for="secteur">Secteur (optionnel)</label>
                        <input type="text" id="secteur" name="secteur" placeholder="Ex: Finance, Santé, Éducation...">
                    </div>
                </div>
                <button type="submit" class="rag-btn-primary">
                    <span>⬆</span> Indexer le document
                </button>
            </form>
        </div>
    </div>

    <!-- 
         LISTE DES DOCUMENTS INDEXÉS
          -->
    <div class="rag-card">
        <div class="rag-card-header">
            <span class="rag-card-icon">📋</span>
            <h3>Documents indexés</h3>
            <span class="rag-card-badge"><?= count($documents) ?> document(s)</span>
        </div>
        <div class="rag-card-body">

            <?php if (empty($documents)): ?>
                <div class="rag-empty">
                    <div class="rag-empty-icon">📭</div>
                    <p>Aucun document indexé pour le moment.</p>
                    <p class="rag-empty-sub">Utilisez le formulaire ci-dessus pour ajouter votre premier document.</p>
                </div>
            <?php else: ?>
                <div class="rag-table-responsive">
                    <table class="rag-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Titre</th>
                                <th>Type</th>
                                <th>Secteur</th>
                                <th>Mots-clés</th>
                                <th>Statut</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($documents as $doc): ?>
                            <tr>
                                <td><span class="rag-id-badge">#<?= $doc['id'] ?></span></td>
                                <td>
                                    <div class="rag-doc-title">
                                        <strong><?= htmlspecialchars($doc['title'] ?? 'Sans titre') ?></strong>
                                        <span class="rag-doc-preview">
                                            <?= substr(htmlspecialchars($doc['content'] ?? ''), 0, 80) ?>...
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span class="rag-badge rag-badge-primary">
                                        <?= htmlspecialchars($doc['type_projet'] ?? 'general') ?>
                                    </span>
                                </td>
                                <td><?= htmlspecialchars($doc['secteur'] ?? '-') ?></td>
                                <td>
                                    <?php
                                    $motsCles = $doc['mots_cles'] ?? [];
                                    if (is_string($motsCles)) {
                                        $motsCles = json_decode($motsCles, true) ?: [];
                                    }
                                    if (!empty($motsCles) && is_array($motsCles)) {
                                        foreach (array_slice($motsCles, 0, 3) as $mot) {
                                            echo '<span class="rag-tag">' . htmlspecialchars($mot) . '</span>';
                                        }
                                        if (count($motsCles) > 3) {
                                            echo '<span class="rag-tag rag-tag-more">+' . (count($motsCles) - 3) . '</span>';
                                        }
                                    } else {
                                        echo '<span class="rag-empty-tag">-</span>';
                                    }
                                    ?>
                                </td>
                                <td>
                                    <?php if ($doc['actif'] ?? true): ?>
                                        <span class="rag-badge rag-badge-success">✅ Actif</span>
                                    <?php else: ?>
                                        <span class="rag-badge rag-badge-danger">⛔ Inactif</span>
                                    <?php endif; ?>
                                </td>
                                <td><?= date('d/m/Y H:i', strtotime($doc['created_at'] ?? 'now')) ?></td>
                                <td>
                                    <div class="rag-actions-group">
                                        <?php if ($doc['actif'] ?? true): ?>
                                            <a href="index.php?controller=rag&action=desactiver&id=<?= $doc['id'] ?>"
                                               class="rag-btn rag-btn-warning"
                                               onclick="return confirm('Désactiver ce document ?')"
                                               title="Désactiver">
                                                ⛔
                                            </a>
                                        <?php else: ?>
                                            <a href="index.php?controller=rag&action=activer&id=<?= $doc['id'] ?>"
                                               class="rag-btn rag-btn-success"
                                               onclick="return confirm('Activer ce document ?')"
                                               title="Activer">
                                                ✅
                                            </a>
                                        <?php endif; ?>
                                        <a href="index.php?controller=rag&action=supprimer&id=<?= $doc['id'] ?>"
                                           class="rag-btn rag-btn-danger"
                                           onclick="return confirm('Supprimer définitivement ce document ?')"
                                           title="Supprimer">
                                            🗑️
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>

        </div>
    </div>

</div>

<!-- 
     STYLES CSS SPÉCIFIQUES À LA PAGE RAG
      -->
<style>
    /* 
       RAG - CONTAINER PRINCIPAL
        */
    .rag-container {
        max-width: 100%;
    }

    .rag-header {
        margin-bottom: 24px;
    }

    .rag-title {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px 0;
    }

    .rag-subtitle {
        font-size: 14px;
        color: #64748b;
        margin: 0;
    }

    /* 
       RAG - CARTES
        */
    .rag-card {
        background: #ffffff;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        margin-bottom: 20px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .rag-card-header {
        padding: 14px 20px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .rag-card-icon {
        font-size: 18px;
    }

    .rag-card-header h3 {
        font-size: 15px;
        font-weight: 600;
        color: #0f172a;
        margin: 0;
        flex: 1;
    }

    .rag-card-badge {
        font-size: 11px;
        padding: 2px 10px;
        border-radius: 20px;
        background: #e2e8f0;
        color: #475569;
        font-weight: 500;
    }

    .rag-card-body {
        padding: 20px;
    }

    /* 
       RAG - FORMULAIRE
        */
    .rag-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }

    .rag-form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .rag-form-group label {
        font-size: 13px;
        font-weight: 500;
        color: #334155;
    }

    .rag-form-group label .required {
        color: #ef4444;
    }

    .rag-form-group input,
    .rag-form-group select {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 13px;
        background: #ffffff;
        color: #0f172a;
        transition: border-color 0.2s;
    }

    .rag-form-group input:focus,
    .rag-form-group select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .rag-form-group input[type="file"] {
        padding: 6px 10px;
        background: #f8fafc;
    }

    .rag-form-group small {
        font-size: 11px;
        color: #94a3b8;
    }

    /* 
       RAG - BOUTONS
        */
    .rag-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        background: #2563eb;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .rag-btn-primary:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    /* 
       RAG - TABLEAU
        */
    .rag-table-responsive {
        overflow-x: auto;
    }

    .rag-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }

    .rag-table thead {
        background: #f8fafc;
    }

    .rag-table th {
        padding: 10px 14px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
    }

    .rag-table td {
        padding: 10px 14px;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        vertical-align: middle;
    }

    .rag-table tr:hover td {
        background: #f8fafc;
    }

    /* 
       RAG - BADGES ET TAGS
        */
    .rag-id-badge {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 4px;
        background: #f1f5f9;
        color: #64748b;
        font-size: 11px;
        font-weight: 600;
    }

    .rag-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
    }

    .rag-badge-primary {
        background: #dbeafe;
        color: #1e40af;
    }

    .rag-badge-success {
        background: #dcfce7;
        color: #166534;
    }

    .rag-badge-danger {
        background: #fee2e2;
        color: #991b1b;
    }

    .rag-tag {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 4px;
        background: #f1f5f9;
        color: #475569;
        font-size: 11px;
        margin: 1px 2px 1px 0;
    }

    .rag-tag-more {
        background: #e2e8f0;
        color: #64748b;
    }

    .rag-empty-tag {
        color: #94a3b8;
        font-size: 12px;
    }

    /* 
       RAG - DOCUMENT TITLE
        */
    .rag-doc-title {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .rag-doc-title strong {
        color: #0f172a;
        font-weight: 600;
    }

    .rag-doc-preview {
        font-size: 12px;
        color: #94a3b8;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* 
       RAG - ACTIONS GROUP
        */
    .rag-actions-group {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .rag-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
        border-radius: 4px;
        border: none;
        font-size: 14px;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
        width: 30px;
        height: 30px;
    }

    .rag-btn:hover {
        transform: scale(1.1);
    }

    .rag-btn-warning {
        background: #fef3c7;
        color: #92400e;
    }

    .rag-btn-warning:hover {
        background: #fde68a;
    }

    .rag-btn-success {
        background: #dcfce7;
        color: #166534;
    }

    .rag-btn-success:hover {
        background: #bbf7d0;
    }

    .rag-btn-danger {
        background: #fee2e2;
        color: #991b1b;
    }

    .rag-btn-danger:hover {
        background: #fecaca;
    }

    /* 
       RAG - EMPTY STATE
        */
    .rag-empty {
        text-align: center;
        padding: 40px 20px;
    }

    .rag-empty-icon {
        font-size: 48px;
        display: block;
        margin-bottom: 12px;
    }

    .rag-empty p {
        color: #64748b;
        font-size: 15px;
        margin: 0;
    }

    .rag-empty-sub {
        font-size: 13px !important;
        color: #94a3b8 !important;
        margin-top: 4px !important;
    }

    /* 
       RAG - ALERTES
        */
    .alert {
        padding: 10px 16px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 13px;
        border: 1px solid transparent;
    }

    .alert-success {
        background: #f0fdf4;
        border-color: #86efac;
        color: #166534;
    }

    .alert-danger {
        background: #fef2f2;
        border-color: #fca5a5;
        color: #991b1b;
    }

    .alert-info {
        background: #eff6ff;
        border-color: #93c5fd;
        color: #1e40af;
    }

    /* 
       RAG - RESPONSIVE
        */
    @media (max-width: 900px) {
        .rag-form-grid {
            grid-template-columns: 1fr 1fr;
        }
    }

    @media (max-width: 640px) {
        .rag-form-grid {
            grid-template-columns: 1fr;
        }

        .rag-card-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .rag-table {
            font-size: 12px;
        }

        .rag-table th,
        .rag-table td {
            padding: 6px 10px;
        }

        .rag-doc-preview {
            max-width: 120px;
        }
    }

    @media (max-width: 480px) {
        .rag-table th,
        .rag-table td {
            padding: 4px 6px;
            font-size: 11px;
        }

        .rag-btn {
            width: 26px;
            height: 26px;
            font-size: 12px;
        }

        .rag-doc-preview {
            display: none;
        }
    }
</style>