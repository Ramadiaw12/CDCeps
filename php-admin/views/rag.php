<?php
// ============================================================
// views/rag.php
// Gestion de la base documentaire RAG
// Permet d'ajouter, activer/désactiver des documents
// ============================================================

// ============================================================
// VÉRIFICATION QUE LA VARIABLE $documents EXISTE
// Si elle n'existe pas, on la définit comme un tableau vide
// ============================================================
if (!isset($documents)) {
    $documents = [];
}

// ============================================================
// AFFICHAGE DES MESSAGES DE SUCCÈS OU D'ERREUR
// ============================================================
$message = $_SESSION['message'] ?? null;
$message_type = $_SESSION['message_type'] ?? 'info';
unset($_SESSION['message'], $_SESSION['message_type']);
?>

<!-- ============================================================
     DÉBUT DE LA VUE
     ============================================================ -->
<div class="container mt-4">
    
    <!-- ============================================================
         TITRE DE LA PAGE
         ============================================================ -->
    <h1 class="mb-4">📚 Gestion des Documents RAG</h1>
    
    <!-- ============================================================
         AFFICHAGE DES MESSAGES FLASH
         ============================================================ -->
    <?php if ($message): ?>
        <div class="alert alert-<?= $message_type ?> alert-dismissible fade show" role="alert">
            <?= htmlspecialchars($message) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <!-- ============================================================
         FORMULAIRE D'UPLOAD
         ============================================================ -->
    <div class="card mb-4 shadow-sm">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">📤 Ajouter un document</h5>
        </div>
        <div class="card-body">
            <form action="index.php?controller=rag&action=upload" method="POST" enctype="multipart/form-data">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="pdf" class="form-label fw-bold">Fichier PDF</label>
                            <input type="file" class="form-control" id="pdf" name="pdf" accept=".pdf" required>
                            <small class="text-muted">Sélectionnez un fichier PDF à indexer</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="type_projet" class="form-label fw-bold">Type de projet</label>
                            <select class="form-select" id="type_projet" name="type_projet">
                                <option value="general">📁 Général</option>
                                <option value="web">🌐 Web</option>
                                <option value="mobile">📱 Mobile</option>
                                <option value="logiciel">💻 Logiciel</option>
                                <option value="infrastructure">🏗️ Infrastructure</option>
                                <option value="ecommerce">🛒 E-commerce</option>
                                <option value="erp">🏢 ERP</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="secteur" class="form-label fw-bold">Secteur (optionnel)</label>
                            <input type="text" class="form-control" id="secteur" name="secteur" placeholder="Ex: Finance, Santé, Éducation...">
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-upload"></i> Indexer le document
                </button>
            </form>
        </div>
    </div>
    
    <!-- ============================================================
         LISTE DES DOCUMENTS INDEXÉS
         ============================================================ -->
    <div class="card shadow-sm">
        <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">📋 Documents indexés</h5>
        </div>
        <div class="card-body">
            
            <?php if (empty($documents)): ?>
                <!-- Message si aucun document -->
                <div class="text-center py-5">
                    <p class="text-muted">Aucun document indexé pour le moment.</p>
                    <p class="text-muted small">Utilisez le formulaire ci-dessus pour ajouter votre premier document.</p>
                </div>
            <?php else: ?>
                <!-- Tableau des documents -->
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
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
                                <td><span class="badge bg-light text-dark">#<?= $doc['id'] ?></span></td>
                                <td>
                                    <strong><?= htmlspecialchars($doc['title'] ?? 'Sans titre') ?></strong>
                                    <br>
                                    <small class="text-muted">
                                        <?= substr(htmlspecialchars($doc['content'] ?? ''), 0, 100) ?>...
                                    </small>
                                </td>
                                <td>
                                    <span class="badge bg-primary">
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
                                            echo '<span class="badge bg-info me-1">' . htmlspecialchars($mot) . '</span>';
                                        }
                                        if (count($motsCles) > 3) {
                                            echo '<span class="badge bg-secondary">+' . (count($motsCles) - 3) . '</span>';
                                        }
                                    } else {
                                        echo '<span class="text-muted">-</span>';
                                    }
                                    ?>
                                </td>
                                <td>
                                    <?php if ($doc['actif'] ?? true): ?>
                                        <span class="badge bg-success">✅ Actif</span>
                                    <?php else: ?>
                                        <span class="badge bg-danger">⛔ Inactif</span>
                                    <?php endif; ?>
                                </td>
                                <td><?= date('d/m/Y H:i', strtotime($doc['created_at'] ?? 'now')) ?></td>
                                <td>
                                    <div class="btn-group btn-group-sm" role="group">
                                        <?php if ($doc['actif'] ?? true): ?>
                                            <a href="index.php?controller=rag&action=desactiver&id=<?= $doc['id'] ?>" 
                                               class="btn btn-warning" 
                                               onclick="return confirm('Désactiver ce document ?')">
                                                ⛔
                                            </a>
                                        <?php else: ?>
                                            <a href="index.php?controller=rag&action=activer&id=<?= $doc['id'] ?>" 
                                               class="btn btn-success" 
                                               onclick="return confirm('Activer ce document ?')">
                                                ✅
                                            </a>
                                        <?php endif; ?>
                                        <a href="index.php?controller=rag&action=supprimer&id=<?= $doc['id'] ?>" 
                                           class="btn btn-danger" 
                                           onclick="return confirm('Supprimer définitivement ce document ?')">
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