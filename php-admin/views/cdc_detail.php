<?php
// ============================================================
// views/cdc_detail.php
// Affiche le détail complet d'un CDC généré
// avec options de finalisation et export
// ============================================================
?>

<!-- ── En-tête avec actions ─────────────────────────────── -->
<div style="display:flex;justify-content:space-between;
            align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
    <div>
        <h2 style="font-size:20px;font-weight:600;color:#0f172a;">
            <?= htmlspecialchars($cdc['projet_titre']) ?>
        </h2>
        <p style="color:#64748b;margin-top:4px;font-size:13px;">
            Client :
            <strong>
                <?= htmlspecialchars($cdc['prenom'])
                  . ' ' . htmlspecialchars($cdc['nom']) ?>
            </strong>
            <?php if ($cdc['entreprise']): ?>
                — <?= htmlspecialchars($cdc['entreprise']) ?>
            <?php endif; ?>
        </p>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <!-- Export Markdown -->
        <a href="index.php?action=export_md&id=<?= $cdc['id'] ?>"
           class="btn btn-secondary">
            ⬇️ Markdown
        </a>

        <!-- Export PDF via Node.js -->
        <a href="http://localhost:3001/api/documents/cdc/<?= $cdc['id'] ?>/pdf"
           target="_blank"
           class="btn btn-secondary">
            📥 PDF
        </a>

        <!-- Finaliser -->
        <?php if ($cdc['statut'] !== 'finalise'): ?>
            <form method="POST"
                  action="index.php?action=cdc_finaliser"
                  style="display:inline;">
                <input type="hidden" name="id" value="<?= $cdc['id'] ?>">
                <button type="submit" class="btn btn-success">
                    Finaliser le CDC
                </button>
            </form>
        <?php else: ?>
            <span class="badge badge-success" style="padding:8px 16px;">
                CDC Finalisé
            </span>
        <?php endif; ?>
    </div>
</div>

<!-- Métadonnées -->
<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);
     margin-bottom:24px;">
    <div class="stat-card">
        <div class="stat-icone" style="background:#dbeafe;">⭐</div>
        <div class="stat-info">
            <div class="valeur" style="color:<?=
                $cdc['score_completude'] >= 80 ? '#10b981' :
                ($cdc['score_completude'] >= 60 ? '#f59e0b' : '#ef4444')
            ?>">
                <?= $cdc['score_completude'] ?>
            </div>
            <div class="label">Score /100</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#dcfce7;">📋</div>
        <div class="stat-info">
            <div class="valeur"><?= $cdc['version'] ?></div>
            <div class="label">Version</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#fef3c7;">📁</div>
        <div class="stat-info">
            <div class="valeur">
                <?= str_replace('_', ' ', $cdc['type_projet']) ?>
            </div>
            <div class="label">Type projet</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#f3e8ff;">📅</div>
        <div class="stat-info">
            <div class="valeur">
                <?= date('d/m/Y', strtotime($cdc['created_at'])) ?>
            </div>
            <div class="label">Généré le</div>
        </div>
    </div>
</div>

<!-- Sections manquantes  -->
<?php if (!empty($cdc['sections_manquantes'])): ?>
    <div class="alert alert-danger" style="margin-bottom:24px;">
        <strong>⚠️ Sections à compléter :</strong>
        <ul style="margin-top:8px;padding-left:20px;">
            <?php foreach ($cdc['sections_manquantes'] as $section): ?>
                <li style="font-size:13px;"><?= htmlspecialchars($section) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
<?php endif; ?>

<!-- Contenu du CDC -->
<div class="card">
    <div class="card-title">📄 Contenu du cahier des charges</div>

    <!-- Affichage du Markdown brut dans une zone stylisée -->
    <div style="
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:8px;
        padding:28px;
        font-family:'Segoe UI',sans-serif;
        font-size:13px;
        line-height:1.8;
        white-space:pre-wrap;
        word-wrap:break-word;
        color:#374151;
        max-height:600px;
        overflow-y:auto;
    ">
        <?= htmlspecialchars($cdc['contenu_markdown']) ?>
    </div>

    <div style="margin-top:16px;display:flex;gap:10px;">
        <a href="index.php?page=cdcs" class="btn btn-secondary">
            ← Retour aux CDC
        </a>
        <a href="http://localhost:3001/api/documents/cdc/<?= $cdc['id'] ?>/pdf"
           target="_blank"
           class="btn btn-primary">
            📥 Télécharger PDF
        </a>
    </div>
</div>