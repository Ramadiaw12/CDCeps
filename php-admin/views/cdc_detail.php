<?php
// ============================================================
// views/cdc_detail.php
// Affiche le détail complet d'un CDC généré
// avec options de finalisation et export
// ============================================================

// Vérifier que le CDC existe
if (!isset($cdc) || empty($cdc)) {
    echo "<div class='alert alert-danger'>❌ CDC introuvable</div>";
    return;
}
?>

<!-- En-tête avec actions -->
<div style="display:flex;justify-content:space-between;
            align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
    <div>
        <h2 style="font-size:20px;font-weight:600;color:#0f172a;margin:0;">
            📄 <?= htmlspecialchars($cdc['projet_titre'] ?? 'CDC') ?>
        </h2>
        <p style="color:#64748b;margin-top:4px;font-size:13px;">
            Client :
            <strong>
                <?= htmlspecialchars($cdc['prenom'] ?? '')
                  . ' ' . htmlspecialchars($cdc['nom'] ?? '') ?>
            </strong>
            <?php if (!empty($cdc['entreprise'])): ?>
                — <?= htmlspecialchars($cdc['entreprise']) ?>
            <?php endif; ?>
        </p>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <!-- Export Markdown -->
        <a href="index.php?controller=cdc&action=exportMarkdown&id=<?= $cdc['id'] ?>"
           class="btn btn-secondary btn-sm">
            ⬇️ Markdown
        </a>

        <!-- Export PDF via Node.js -->
        <a href="http://localhost:3001/api/documents/cdc/<?= $cdc['id'] ?>/pdf"
           target="_blank"
           class="btn btn-secondary btn-sm">
            📥 PDF
        </a>

        <!-- Finaliser -->
        <?php if (($cdc['statut'] ?? 'brouillon') !== 'finalise'): ?>
            <form method="POST"
                  action="index.php?controller=cdc&action=finaliser"
                  style="display:inline;">
                <input type="hidden" name="id" value="<?= $cdc['id'] ?>">
                <button type="submit" class="btn btn-success btn-sm">
                    ✅ Finaliser le CDC
                </button>
            </form>
        <?php else: ?>
            <span class="badge badge-success" style="padding:8px 16px;">
                ✅ CDC Finalisé
            </span>
        <?php endif; ?>
    </div>
</div>

<!-- Métadonnées -->
<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
    <div class="stat-card">
        <div class="stat-icone" style="background:#dbeafe;">⭐</div>
        <div class="stat-info">
            <div class="valeur" style="color:<?=
                ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
            ?>">
                <?= $cdc['score_completude'] ?? 0 ?>
            </div>
            <div class="label">Score /100</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#dcfce7;">📋</div>
        <div class="stat-info">
            <div class="valeur"><?= $cdc['version'] ?? '1.0' ?></div>
            <div class="label">Version</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#fef3c7;">📁</div>
        <div class="stat-info">
            <div class="valeur">
                <?= str_replace('_', ' ', $cdc['type_projet'] ?? 'non défini') ?>
            </div>
            <div class="label">Type projet</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#f3e8ff;">📅</div>
        <div class="stat-info">
            <div class="valeur">
                <?= date('d/m/Y', strtotime($cdc['created_at'] ?? 'now')) ?>
            </div>
            <div class="label">Généré le</div>
        </div>
    </div>
</div>

<!-- Sections manquantes -->
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

    <!-- Affichage du Markdown converti en HTML -->
    <div style="
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:8px;
        padding:28px;
        font-family:'Segoe UI',sans-serif;
        font-size:14px;
        line-height:1.8;
        color:#334155;
        max-height:600px;
        overflow-y:auto;
    ">
        <?php
        // Convertir le Markdown en HTML
        $markdown = $cdc['contenu_markdown'] ?? '# Contenu non disponible';
        
        // Charger Parsedown et convertir
        require_once __DIR__ . '/../vendor/autoload.php';
        $parsedown = new Parsedown();
        echo $parsedown->text($markdown);
        ?>
    </div>

    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
        <a href="index.php?page=cdcs" class="btn btn-secondary btn-sm">
            ← Retour aux CDC
        </a>
        <a href="http://localhost:3001/api/documents/cdc/<?= $cdc['id'] ?>/pdf"
           target="_blank"
           class="btn btn-primary btn-sm">
            📥 Télécharger PDF
        </a>
    </div>
</div>
