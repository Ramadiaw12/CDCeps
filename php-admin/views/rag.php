<?php
// ============================================================
// views/rag.php
// Gestion de la base documentaire RAG
// Permet d'ajouter, activer/désactiver des documents
// ============================================================
?>

<!-- ── Statistiques RAG ──────────────────────────────────── -->
<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);
     margin-bottom:24px;">
    <div class="stat-card">
        <div class="stat-icone" style="background:#f3e8ff;">📚</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['total'] ?></div>
            <div class="label">Documents total</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icone" style="background:#dcfce7;">✅</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['actifs'] ?></div>
            <div class="label">Documents actifs</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icone" style="background:#fef3c7;">🔍</div>
        <div class="stat-info">
            <div class="valeur">
                <?= $stats['total'] - $stats['actifs'] ?>
            </div>
            <div class="label">Documents inactifs</div>
        </div>
    </div>
</div>

<div class="grid-2">

    <!-- ── Formulaire ajout document ────────────────────── -->
    <div class="card">
        <div class="card-title">➕ Ajouter un document RAG</div>

        <form method="POST" action="index.php?action=rag_ajouter">
            <div class="form-group">
                <label>Titre du document *</label>
                <input type="text"
                       name="titre"
                       placeholder="Ex: CDC Application de gestion stock"
                       required>
            </div>

            <div class="form-group">
                <label>Type de projet *</label>
                <select name="type_projet" required>
                    <option value="">-- Choisir --</option>
                    <option value="application_web">Application Web</option>
                    <option value="application_mobile">Application Mobile</option>
                    <option value="erp">ERP</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="api">API</option>
                    <option value="autre">Autre</option>
                </select>
            </div>

            <div class="form-group">
                <label>Secteur</label>
                <input type="text"
                       name="secteur"
                       placeholder="Ex: Commerce, Santé, Finance...">
            </div>

            <div class="form-group">
                <label>Mots-clés (séparés par des virgules)</label>
                <input type="text"
                       name="mots_cles"
                       placeholder="Ex: gestion, stock, inventaire">
            </div>

            <div class="form-group">
                <label>Contenu du document (Markdown) *</label>
                <textarea name="contenu"
                          placeholder="Collez ici le contenu de l'ancien CDC..."
                          style="min-height:200px;"
                          required></textarea>
                <small style="color:#94a3b8;font-size:11px;">
                    ⚠️ L'embedding sera généré automatiquement via OpenAI.
                    Assurez-vous que Node.js tourne avant de soumettre.
                </small>
            </div>

            <button type="submit" class="btn btn-primary">
                📥 Indexer le document
            </button>
        </form>
    </div>

    <!-- ── Liste des documents ───────────────────────────── -->
    <div class="card">
        <div class="card-title">📚 Documents indexés</div>

        <?php if (empty($documents)): ?>
            <div style="text-align:center;padding:32px;color:#94a3b8;">
                Aucun document RAG indexé
            </div>
        <?php else: ?>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <?php foreach ($documents as $doc): ?>
                    <div style="
                        border:1px solid #e2e8f0;
                        border-radius:8px;
                        padding:14px;
                        background:<?= $doc['actif'] ? '#ffffff' : '#f8fafc' ?>;
                        opacity:<?= $doc['actif'] ? '1' : '0.6' ?>;
                    ">
                        <!-- Titre et badge -->
                        <div style="display:flex;justify-content:space-between;
                                    align-items:flex-start;margin-bottom:8px;">
                            <div style="font-weight:500;font-size:13px;flex:1;">
                                <?= htmlspecialchars(
                                    substr($doc['titre'], 0, 50)
                                    . (strlen($doc['titre']) > 50 ? '...' : '')
                                ) ?>
                            </div>
                            <span class="badge badge-<?=
                                $doc['actif'] ? 'success' : 'gray'
                            ?>">
                                <?= $doc['actif'] ? 'Actif' : 'Inactif' ?>
                            </span>
                        </div>

                        <!-- Métadonnées -->
                        <div style="display:flex;gap:8px;
                                    flex-wrap:wrap;margin-bottom:10px;">
                            <span class="badge badge-primary">
                                <?= str_replace('_', ' ', $doc['type_projet']) ?>
                            </span>
                            <?php if ($doc['secteur']): ?>
                                <span class="badge badge-gray">
                                    <?= htmlspecialchars($doc['secteur']) ?>
                                </span>
                            <?php endif; ?>
                            <span style="font-size:11px;color:#94a3b8;">
                                <?= round($doc['taille_contenu'] / 1000, 1) ?> ko
                            </span>
                        </div>

                        <!-- Actions -->
                        <div style="display:flex;gap:6px;">
                            <!-- Toggle actif/inactif -->
                            <form method="POST"
                                  action="index.php?action=rag_toggle"
                                  style="display:inline;">
                                <input type="hidden"
                                       name="id"
                                       value="<?= $doc['id'] ?>">
                                <button type="submit"
                                        class="btn btn-secondary btn-sm">
                                    <?= $doc['actif'] ? '⏸ Désactiver' : '▶ Activer' ?>
                                </button>
                            </form>

                            <!-- Supprimer -->
                            <form method="POST"
                                  action="index.php?action=rag_supprimer"
                                  style="display:inline;"
                                  onsubmit="return confirm('Supprimer ce document ?')">
                                <input type="hidden"
                                       name="id"
                                       value="<?= $doc['id'] ?>">
                                <button type="submit"
                                        class="btn btn-danger btn-sm">
                                    🗑
                                </button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>