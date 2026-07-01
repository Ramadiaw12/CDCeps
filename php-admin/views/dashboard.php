<?php
// ============================================================
// views/dashboard.php
// Tableau de bord principal — statistiques globales
// ============================================================
?>

<!-- Statistiques principales -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icone" style="background:#dbeafe;">📁</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['projets']['total'] ?? 0 ?></div>
            <div class="label">Projets total</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#dcfce7;">📄</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['cdc']['total'] ?? 0 ?></div>
            <div class="label">CDC générés</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#fef3c7;">⭐</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['cdc']['score_moyen'] ?? 0 ?>%</div>
            <div class="label">Score moyen /100</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#f3e8ff;">📚</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['rag']['actifs'] ?? 0 ?></div>
            <div class="label">Documents RAG actifs</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icone" style="background:#fce7f3;">📅</div>
        <div class="stat-info">
            <div class="valeur"><?= $stats['projets']['ce_mois'] ?? 0 ?></div>
            <div class="label">Projets ce mois</div>
        </div>
    </div>
</div>

<!-- Grille principale -->
<div class="grid-2" style="margin-bottom:24px;">

    <!-- Derniers projets -->
    <div class="card">
        <div class="card-title">
            📁 Derniers projets
            <a href="index.php?page=projets" style="float:right;font-size:12px;font-weight:400;color:#4f46e5;">
                Voir tout →
            </a>
        </div>
        <?php if (empty($derniersProjets)): ?>
            <p style="color:#94a3b8;text-align:center;padding:20px 0;">
                Aucun projet pour l'instant
            </p>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>Projet</th>
                        <th>Client</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($derniersProjets as $projet): ?>
                        <tr>
                            <td>
                                <a href="index.php?page=projets" class="link">
                                    <?= htmlspecialchars(
                                        substr($projet['titre'] ?? 'Sans titre', 0, 30)
                                        . (strlen($projet['titre'] ?? '') > 30 ? '...' : '')
                                    ) ?>
                                </a>
                            </td>
                            <td>
                                <?= htmlspecialchars($projet['prenom'] ?? '') ?>
                                <?= htmlspecialchars($projet['nom'] ?? '') ?>
                            </td>
                            <td>
                                <?php
                                    $badges = [
                                        'soumis'      => 'gray',
                                        'en_attente'  => 'warning',
                                        'en_analyse'  => 'primary',
                                        'cdc_genere'  => 'success',
                                        'valide'      => 'success',
                                        'archive'     => 'secondary'
                                    ];
                                    $statut = $projet['statut'] ?? 'soumis';
                                    $classe = $badges[$statut] ?? 'gray';
                                ?>
                                <span class="badge badge-<?= $classe ?>">
                                    <?= $statut ?>
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>

    <!-- Derniers CDC -->
    <div class="card">
        <div class="card-title">
            📄 Derniers CDC générés
            <a href="index.php?page=cdcs" style="float:right;font-size:12px;font-weight:400;color:#4f46e5;">
                Voir tout →
            </a>
        </div>
        <?php if (empty($derniersCDC)): ?>
            <p style="color:#94a3b8;text-align:center;padding:20px 0;">
                Aucun CDC généré pour l'instant
            </p>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>Projet</th>
                        <th>Score</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($derniersCDC as $cdc): ?>
                        <tr>
                            <td>
                                <a href="index.php?page=cdcs" class="link">
                                    <?= htmlspecialchars(
                                        substr($cdc['projet_titre'] ?? 'Sans titre', 0, 25)
                                        . (strlen($cdc['projet_titre'] ?? '') > 25 ? '...' : '')
                                    ) ?>
                                </a>
                            </td>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span style="font-weight:700;font-size:15px;color:<?=
                                        ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                                        (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
                                    ?>">
                                        <?= $cdc['score_completude'] ?? 0 ?>
                                    </span>
                                    <div class="score-bar" style="width:60px;height:4px;background:#e2e8f0;border-radius:2px;overflow:hidden;">
                                        <div class="score-fill" style="
                                            height:100%;
                                            width:<?= $cdc['score_completude'] ?? 0 ?>%;
                                            background:<?=
                                                ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                                                (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
                                            ?>;
                                            border-radius:2px;
                                            transition:width 0.5s ease;
                                        ">
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <?php
                                    $badgesCdc = [
                                        'brouillon'   => 'warning',
                                        'finalise'    => 'success',
                                        'valide'      => 'success'
                                    ];
                                    $statutCdc = $cdc['statut'] ?? 'brouillon';
                                    $classeCdc = $badgesCdc[$statutCdc] ?? 'gray';
                                ?>
                                <span class="badge badge-<?= $classeCdc ?>">
                                    <?= $statutCdc ?>
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>