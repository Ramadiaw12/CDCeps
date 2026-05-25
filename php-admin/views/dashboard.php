<?php
// ============================================================
// views/dashboard.php
// Tableau de bord principal — statistiques globales
// ============================================================
?>

<!-- ── Statistiques principales ─────────────────────────── -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icone" style="background:#dbeafe;">📁</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['projets']['total'] ?></div>
            <div class="label">Projets total</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#dcfce7;">📄</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['cdc']['total'] ?></div>
            <div class="label">CDC générés</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#fef3c7;">⭐</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['cdc']['score_moyen'] ?></div>
            <div class="label">Score moyen /100</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#f3e8ff;">📚</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['rag']['actifs'] ?></div>
            <div class="label">Documents RAG actifs</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#fce7f3;">📅</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['projets']['ce_mois'] ?></div>
            <div class="label">Projets ce mois</div>
        </div>
    </div>
</div>

<!-- ── Grille principale ─────────────────────────────────── -->
<div class="grid-2" style="margin-bottom:24px;">

    <!-- Derniers projets -->
    <div class="card">
        <div class="card-title">📁 Derniers projets</div>
        <table>
            <thead>
                <tr>
                    <th>Projet</th>
                    <th>Client</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($derniersProjets)): ?>
                    <tr>
                        <td colspan="3" style="text-align:center;color:#94a3b8;">
                            Aucun projet
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($derniersProjets as $projet): ?>
                        <tr>
                            <td>
                                <a href="index.php?page=projets"
                                   class="link">
                                    <?= htmlspecialchars(
                                        substr($projet['titre'], 0, 30)
                                        . (strlen($projet['titre']) > 30 ? '...' : '')
                                    ) ?>
                                </a>
                            </td>
                            <td>
                                <?= htmlspecialchars($projet['prenom'])
                                  . ' '
                                  . htmlspecialchars($projet['nom']) ?>
                            </td>
                            <td>
                                <?php
                                    $badges = [
                                        'soumis'      => 'gray',
                                        'en