<?php
// ============================================================
// views/dashboard.php
// Tableau de bord principal — statistiques globales
// ============================================================
?>

<!-- 
     STATISTIQUES PRINCIPALES
      -->
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

<!-- 
     GRILLE PRINCIPALE
      -->
<div class="grid-2" style="margin-bottom:24px;">

    <!-- Derniers projets -->
    <div class="card">
        <div class="card-title">
            📁 Derniers projets
            <a href="index.php?controller=projet&action=index" class="card-link">
                Voir tout →
            </a>
        </div>
        <?php if (empty($derniersProjets)): ?>
            <p class="empty-state">Aucun projet pour l'instant</p>
        <?php else: ?>
            <table class="dashboard-table">
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
                                <a href="index.php?controller=projet&action=voir&id=<?= $projet['id'] ?>" class="link">
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
        <a href="index.php?controller=projet&action=index" class="card-link">
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
                            <a href="index.php?controller=projet&action=voir&id=<?= $cdc['projet_id'] ?>" class="link">
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
                                        width:<?= $cdc['score_completude'] ?? 0 ?>%;
                                        background:<?=
                                            ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                                            (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
                                        ?>;
                                    ">
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge badge-<?=
                                ($cdc['statut'] ?? 'brouillon') === 'finalise' ? 'success' : 'warning'
                            ?>">
                                <?= $cdc['statut'] ?? 'brouillon' ?>
                            </span>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>
<!-- 
     STYLES
      -->
<style>
    /* Animations simples */
    .stat-card {
        transition: all 0.3s ease;
        cursor: default;
    }

    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .card {
        transition: all 0.3s ease;
    }

    .card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }

    .card-link {
        float: right;
        font-size: 12px;
        font-weight: 400;
        color: #4f46e5;
        text-decoration: none;
        transition: all 0.2s ease;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .card-link:hover {
        background: #eef2ff;
        text-decoration: underline;
    }

    .dashboard-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }

    .dashboard-table thead th {
        padding: 10px 12px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
    }

    .dashboard-table tbody td {
        padding: 10px 12px;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        vertical-align: middle;
    }

    .dashboard-table tbody tr:hover {
        background: #f8fafc;
    }

    .score-display {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .score-value {
        font-weight: 700;
        font-size: 15px;
        min-width: 30px;
    }

    .score-bar {
        width: 60px;
        height: 4px;
        background: #e2e8f0;
        border-radius: 2px;
        overflow: hidden;
    }

    .score-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.5s ease;
    }

    .empty-state {
        color: #94a3b8;
        text-align: center;
        padding: 24px 0;
        font-size: 14px;
        margin: 0;
    }

    .link {
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
    }

    .link:hover {
        color: #1d4ed8;
        text-decoration: underline;
    }

    /* Badges */
    .badge-gray     { background: #f1f5f9; color: #475569; }
    .badge-warning  { background: #fef3c7; color: #92400e; }
    .badge-primary  { background: #dbeafe; color: #1e40af; }
    .badge-success  { background: #dcfce7; color: #166534; }
    .badge-secondary { background: #f1f5f9; color: #64748b; }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .dashboard-table {
            font-size: 12px;
        }

        .dashboard-table thead th,
        .dashboard-table tbody td {
            padding: 6px 10px;
        }

        .score-display {
            flex-direction: column;
            gap: 4px;
            align-items: flex-start;
        }

        .score-bar {
            width: 40px;
        }

        .grid-2 {
            grid-template-columns: 1fr !important;
        }
    }

    @media (max-width: 480px) {
        .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .stat-card {
            padding: 14px 12px;
        }

        .stat-info .valeur {
            font-size: 18px;
        }
    }
</style>