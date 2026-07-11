<?php
// ============================================================
// views/cdcs.php
// Liste de tous les CDC générés
// ============================================================

// Vérification que la variable $cdcs existe
if (!isset($cdcs)) {
    $cdcs = [];
}
?>

<div class="card">
    <div class="card-title">
        📄 Tous les CDC générés
        <span style="float:right;font-size:12px;font-weight:400;color:#64748b;">
            <?= count($cdcs) ?> CDC
        </span>
    </div>

    <?php if (empty($cdcs)): ?>
        <p style="color:#94a3b8;text-align:center;padding:30px 0;">
            Aucun CDC généré pour l'instant
        </p>
    <?php else: ?>
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                    <tr>
                        <th style="padding:10px 14px;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;text-transform:uppercase;">ID</th>
                        <th style="padding:10px 14px;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;text-transform:uppercase;">Projet</th>
                        <th style="padding:10px 14px;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;text-transform:uppercase;">Client</th>
                        <th style="padding:10px 14px;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;text-transform:uppercase;">Score</th>
                        <th style="padding:10px 14px;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;text-transform:uppercase;">Statut</th>
                        <th style="padding:10px 14px;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;text-transform:uppercase;">Date</th>
                        <th style="padding:10px 14px;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;text-transform:uppercase;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($cdcs as $cdc): ?>
                        <tr>
                            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">
                                #<?= $cdc['id'] ?>
                            </td>
                            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">
                                <strong><?= htmlspecialchars($cdc['projet_titre'] ?? 'Sans titre') ?></strong>
                            </td>
                            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">
                                <?= htmlspecialchars($cdc['prenom'] ?? '') ?>
                                <?= htmlspecialchars($cdc['nom'] ?? '') ?>
                            </td>
                            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span style="font-weight:700;font-size:15px;color:<?=
                                        ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                                        (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
                                    ?>">
                                        <?= $cdc['score_completude'] ?? 0 ?>
                                    </span>
                                    <div style="width:60px;height:4px;background:#e2e8f0;border-radius:2px;overflow:hidden;">
                                        <div style="height:100%;width:<?= $cdc['score_completude'] ?? 0 ?>%;background:<?=
                                            ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                                            (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
                                        ?>;border-radius:2px;transition:width 0.5s ease;"></div>
                                    </div>
                                </div>
                            </td>
                            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">
                                <span class="badge badge-<?=
                                    ($cdc['statut'] ?? 'brouillon') === 'finalise' ? 'success' : 'warning'
                                ?>">
                                    <?= $cdc['statut'] ?? 'brouillon' ?>
                                </span>
                            </td>
                            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">
                                <?= date('d/m/Y', strtotime($cdc['created_at'] ?? 'now')) ?>
                            </td>
                            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#334155;">
                                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                    <a href="index.php?controller=cdc&action=detail&id=<?= $cdc['id'] ?>" 
                                       class="btn btn-sm btn-primary">
                                        👁 Voir
                                    </a>
                                    <a href="http://localhost:3001/api/documents/cdc/<?= $cdc['id'] ?>/pdf" 
                                       target="_blank" 
                                       class="btn btn-sm btn-secondary">
                                        📄 PDF
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
