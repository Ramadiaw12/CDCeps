<?php
// ============================================================
// views/rag.php
// Gestion de la base documentaire RAG
// Permet d'ajouter, activer/désactiver des documents
// ============================================================
?>

<!-- views/rag.php -->
<?php include 'layout.php'; ?>

<div class="container mt-4">
    <h1>📚 Gestion des Documents RAG</h1>
    
    <!-- Formulaire d'upload -->
    <div class="card mb-4">
        <div class="card-header">
            <h5>📤 Ajouter un document</h5>
        </div>
        <div class="card-body">
            <form action="index.php?controller=rag&action=upload" method="POST" enctype="multipart/form-data">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="pdf" class="form-label">Fichier PDF</label>
                            <input type="file" class="form-control" id="pdf" name="pdf" accept=".pdf" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="type_projet" class="form-label">Type de projet</label>
                            <select class="form-control" id="type_projet" name="type_projet">
                                <option value="general">Général</option>
                                <option value="web">Web</option>
                                <option value="mobile">Mobile</option>
                                <option value="logiciel">Logiciel</option>
                                <option value="infrastructure">Infrastructure</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">📤 Indexer le document</button>
            </form>
        </div>
    </div>
    
    <!-- Liste des documents -->
    <div class="card">
        <div class="card-header">
            <h5>📄 Documents indexés</h5>
        </div>
        <div class="card-body">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Titre</th>
                        <th>Type</th>
                        <th>Secteur</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($documents as $doc): ?>
                    <tr>
                        <td><?= $doc['id'] ?></td>
                        <td><?= htmlspecialchars($doc['title']) ?></td>
                        <td><span class="badge bg-primary"><?= $doc['type_projet'] ?></span></td>
                        <td><?= $doc['secteur'] ?? '-' ?></td>
                        <td><?= date('d/m/Y', strtotime($doc['created_at'])) ?></td>
                        <td>
                            <a href="index.php?controller=rag&action=delete&id=<?= $doc['id'] ?>" 
                               class="btn btn-danger btn-sm" 
                               onclick="return confirm('Supprimer ce document ?')">
                                🗑️
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include 'layout_footer.php'; ?>