<?php
// ============================================================
// views/projets.php
// Liste de tous les projets avec gestion du statut
// ============================================================
?>

<div class="card">
    <div style="display:flex;justify-content:space-between;
                align-items:center;margin-bottom:20px;">
        <div class="card-title" style="margin:0;border:none;padding:0;">
            <?php if (($vue ?? '') === 'cdcs'): ?>
                📄 Tous les CDC générés
            <?php else: ?>
                📁 Tous les projets
            <?php endif; ?>
        </div>
        <a href="http://localhost:5173/nouveau-projet"
           target="_blank" class="btn btn-primary btn-sm">
            + Nouveau projet
        </a>
    </div>

    <?php if (($vue ?? '') === 'cdcs'): ?>
    <!-- ── Vue CDC ──────────────────────────────────────── -->
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Projet</th>
                <th>Client</th>
                <th>Score</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($cdcs)): ?>
                <tr>
                    <td colspan="7" style="text-align:center;
                        color:#94a3b8;padding:32px;">
                        Aucun CDC généré pour l'instant
                    </td>
                </tr>
            <?php else: ?>
                <?php foreach ($cdcs as $cdc): ?>
                    <tr>
                        <td style="color:#94a3b8;">#<?= $cdc['id'] ?></td>
                        <td>
                            <div style="font-weight:500;">
                                <?= htmlspecialchars(
                                    substr($cdc['projet_titre'], 0, 35)
                                    . (strlen($cdc['projet_titre']) > 35 ? '...' : '')
                                ) ?>
                            </div>
                            <div style="font-size:11px;color:#94a3b8;">
                                <?= str_replace('_', ' ', $cdc['type_projet']) ?>
                            </div>
                        </td>
                        <td>
                            <?= htmlspecialchars($cdc['prenom'])
                              . ' ' . htmlspecialchars($cdc['nom']) ?>
                            <?php if ($cdc['entreprise']): ?>
                                <div style="font-size:11px;color:#94a3b8;">
                                    <?= htmlspecialchars($cdc['entreprise']) ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-weight:700;font-size:15px;color:<?=
                                    $cdc['score_completude'] >= 80 ? '#10b981' :
                                    ($cdc['score_completude'] >= 60 ? '#f59e0b' : '#ef4444')
                                ?>">
                                    <?= $cdc['score_completude'] ?>
                                </span>
                                <div class="score-bar" style="width:50px;">
                                    <div class="score-fill" style="
                                        width:<?= $cdc['score_completude'] ?>%;
                                        background:<?=
                                            $cdc['score_completude'] >= 80 ? '#10b981' :
                                            ($cdc['score_completude'] >= 60 ? '#f59e0b' : '#ef4444')
                                        ?>;">
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge badge-<?=
                                $cdc['statut'] === 'finalise' ? 'success' : 'warning'
                            ?>">
                                <?= $cdc['statut'] ?>
                            </span>
                        </td>
                        <td style="color:#64748b;font-size:12px;">
                            <?= date('d/m/Y', strtotime($cdc['created_at'])) ?>
                        </td>
                        <td>
                            <div style="display:flex;gap:6px;">
                                <a href="index.php?page=cdc_detail&id=<?= $cdc['id'] ?>"
                                   class="btn btn-secondary btn-sm">
                                    👁 Voir
                                </a>
                                <a href="index.php?action=export_md&id=<?= $cdc['id'] ?>"
                                   class="btn btn-secondary btn-sm">
                                    ⬇ MD
                                </a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>

    <?php else: ?>
    <!-- ── Vue Projets ──────────────────────────────────── -->
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Projet</th>
                <th>Client</th>
                <th>Type</th>
                <th>CDC</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($projets)): ?>
                <tr>
                    <td colspan="8" style="text-align:center;
                        color:#94a3b8;padding:32px;">
                        Aucun projet pour l'instant
                    </td>
                </tr>
            <?php else: ?>
                <?php foreach ($projets as $projet): ?>
                    <tr>
                        <td style="color:#94a3b8;">#<?= $projet['id'] ?></td>
                        <td>
                            <div style="font-weight:500;">
                                <?= htmlspecialchars(
                                    substr($projet['titre'], 0, 35)
                                    . (strlen($projet['titre']) > 35 ? '...' : '')
                                ) ?>
                            </div>
                        </td>
                        <td>
                            <div>
                                <?= htmlspecialchars($projet['prenom'])
                                  . ' ' . htmlspecialchars($projet['nom']) ?>
                            </div>
                            <?php if ($projet['entreprise']): ?>
                                <div style="font-size:11px;color:#94a3b8;">
                                    <?= htmlspecialchars($projet['entreprise']) ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td>
                            <span class="badge badge-primary">
                                <?= str_replace('_', ' ', $projet['type_projet']) ?>
                            </span>
                        </td>
                        <td style="text-align:center;">
                            <?php if ($projet['nb_cdc'] > 0): ?>
                                <span class="badge badge-success">
                                    <?= $projet['nb_cdc'] ?> CDC
                                </span>
                            <?php else: ?>
                                <span class="badge badge-gray">—</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <!-- Formulaire de changement de statut -->
                            <form method="POST"
                                  action="index.php?action=update_statut"
                                  style="display:inline;">
                                <input type="hidden"
                                       name="id"
                                       value="<?= $projet['id'] ?>">
                                <select name="statut"
                                        onchange="this.form.submit()"
                                        style="
                                            padding:4px 8px;
                                            border:1px solid #e2e8f0;
                                            border-radius:6px;
                                            font-size:12px;
                                            cursor:pointer;
                                        ">
                                    <?php
                                        $statuts = [
                                            'soumis', 'en_analyse',
                                            'cdc_genere', 'valide', 'archive'
                                        ];
                                        foreach ($statuts as $s):
                                    ?>
                                        <option value="<?= $s ?>"
                                            <?= $projet['statut'] === $s ? 'selected' : '' ?>>
                                            <?= $s ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </form>
                        </td>
                        <td style="color:#64748b;font-size:12px;">
                            <?= date('d/m/Y', strtotime($projet['created_at'])) ?>
                        </td>
                        <td>
                            <a href="http://localhost:5173/generation/<?= $projet['id'] ?>"
                               target="_blank"
                               class="btn btn-primary btn-sm">
                                🚀 Générer
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
    <?php endif; ?>
</div>