<?php
// ============================================================
// views/projets.php
// Liste de tous les projets avec gestion du statut
// Vue utilisée par ProjetController pour afficher la liste
// ============================================================

// 
// VÉRIFICATION DES VARIABLES
// Si elles n'existent pas, on les définit comme vides
// 
if (!isset($projets)) {
    $projets = [];
}
if (!isset($cdcs)) {
    $cdcs = [];
}
if (!isset($vue)) {
    $vue = 'projets'; 
}
?>

<!-- 
     CARTE PRINCIPALE
      -->
<div class="card">
    <!-- 
         EN-TÊTE AVEC TITRE ET BOUTON NOUVEAU PROJET
          -->
    <div style="display:flex;justify-content:space-between;
                align-items:center;margin-bottom:20px;
                flex-wrap:wrap;gap:10px;">
        <div class="card-title" style="margin:0;border:none;padding:0;">
            <?php if ($vue === 'cdcs'): ?>
                📄 Tous les CDC générés
            <?php else: ?>
                📁 Tous les projets
            <?php endif; ?>
            <span class="badge badge-secondary" style="font-size:12px;">
                <?= count($vue === 'cdcs' ? $cdcs : $projets) ?> 
                <?= $vue === 'cdcs' ? 'CDC' : 'projets' ?>
            </span>
        </div>
        <?php if ($vue !== 'cdcs'): ?>
            <a href="http://localhost:5173/nouveau-projet"
               target="_blank" class="btn btn-primary btn-sm">
                ➕ Nouveau projet
            </a>
        <?php endif; ?>
    </div>

    <!-- 
         VUE CDC - AFFICHE LA LISTE DES CDC
          -->
    <?php if ($vue === 'cdcs'): ?>
    
    <div class="table-responsive">
        <table class="table table-striped table-hover">
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
                                        substr($cdc['projet_titre'] ?? 'Sans titre', 0, 35)
                                        . (strlen($cdc['projet_titre'] ?? '') > 35 ? '...' : '')
                                    ) ?>
                                </div>
                                <div style="font-size:11px;color:#94a3b8;">
                                    <?= str_replace('_', ' ', $cdc['type_projet'] ?? 'non défini') ?>
                                </div>
                            </td>
                            <td>
                                <?= htmlspecialchars($cdc['prenom'] ?? '')
                                  . ' ' . htmlspecialchars($cdc['nom'] ?? '') ?>
                                <?php if (!empty($cdc['entreprise'])): ?>
                                    <div style="font-size:11px;color:#94a3b8;">
                                        <?= htmlspecialchars($cdc['entreprise']) ?>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span style="font-weight:700;font-size:15px;color:<?=
                                        ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                                        (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
                                    ?>">
                                        <?= $cdc['score_completude'] ?? 0 ?>
                                    </span>
                                    <div class="score-bar" style="width:50px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                                        <div class="score-fill" style="
                                            height:100%;
                                            width:<?= $cdc['score_completude'] ?? 0 ?>%;
                                            background:<?=
                                                ($cdc['score_completude'] ?? 0) >= 80 ? '#10b981' :
                                                (($cdc['score_completude'] ?? 0) >= 60 ? '#f59e0b' : '#ef4444')
                                            ?>;
                                            border-radius:3px;
                                            transition:width 0.5s ease;
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
                            <td style="color:#64748b;font-size:12px;">
                                <?= date('d/m/Y', strtotime($cdc['created_at'] ?? 'now')) ?>
                            </td>
                            <td>
                                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                    <a href="index.php?controller=cdc&action=voir&id=<?= $cdc['id'] ?>"
                                       class="btn btn-secondary btn-sm">
                                        👁 Voir
                                    </a>
                                    <a href="index.php?controller=cdc&action=exportMarkdown&id=<?= $cdc['id'] ?>"                                       class="btn btn-secondary btn-sm">
                                        ⬇ MD
                                    </a>
                                    <a href="index.php?controller=cdc&action=export_pdf&id=<?= $cdc['id'] ?>"
                                       class="btn btn-secondary btn-sm">
                                        📄 PDF
                                    </a>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- 
         VUE PROJETS - AFFICHE LA LISTE DES PROJETS
          -->
    <?php else: ?>
    
    <div class="table-responsive">
        <table class="table table-striped table-hover">
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
                            <br>
                            <small>Créez votre premier projet via l'interface React</small>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($projets as $projet): ?>
                        <tr>
                            <td style="color:#94a3b8;">#<?= $projet['id'] ?></td>
                            <td>
                                <div style="font-weight:500;">
                                    <?= htmlspecialchars(
                                        substr($projet['titre'] ?? 'Sans titre', 0, 35)
                                        . (strlen($projet['titre'] ?? '') > 35 ? '...' : '')
                                    ) ?>
                                </div>
                                <?php if (!empty($projet['description_brute'])): ?>
                                    <div style="font-size:11px;color:#94a3b8;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                        <?= htmlspecialchars(substr($projet['description_brute'], 0, 60)) ?>...
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <div>
                                    <?= htmlspecialchars($projet['prenom'] ?? '')
                                      . ' ' . htmlspecialchars($projet['nom'] ?? '') ?>
                                </div>
                                <?php if (!empty($projet['entreprise'])): ?>
                                    <div style="font-size:11px;color:#94a3b8;">
                                        <?= htmlspecialchars($projet['entreprise']) ?>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="badge badge-primary">
                                    <?= str_replace('_', ' ', $projet['type_projet'] ?? 'non défini') ?>
                                </span>
                            </td>
                            <td style="text-align:center;">
                                <?php if (($projet['nb_cdc'] ?? 0) > 0): ?>
                                    <span class="badge badge-success">
                                        <?= $projet['nb_cdc'] ?> CDC
                                    </span>
                                <?php else: ?>
                                    <span class="badge badge-gray" style="background:#e2e8f0;color:#94a3b8;">—</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <!-- Formulaire de changement de statut -->
                                <form method="POST"
                                      action="index.php?controller=projet&action=update_statut"
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
                                                background:white;
                                            ">
                                        <?php
                                            $statuts = [
                                                'soumis' => '📩 Soumis',
                                                'en_analyse' => '🔍 En analyse',
                                                'cdc_genere' => '📄 CDC généré',
                                                'valide' => '✅ Validé',
                                                'archive' => '📦 Archivé'
                                            ];
                                            foreach ($statuts as $key => $label):
                                        ?>
                                            <option value="<?= $key ?>"
                                                <?= ($projet['statut'] ?? 'soumis') === $key ? 'selected' : '' ?>>
                                                <?= $label ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </form>
                            </td>
                            <td style="color:#64748b;font-size:12px;">
                                <?= date('d/m/Y', strtotime($projet['created_at'] ?? 'now')) ?>
                            </td>
                            <td>
                                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                    <a href="http://localhost:5173/generation/<?= $projet['id'] ?>"
                                       target="_blank"
                                       class="btn btn-primary btn-sm">
                                        🚀 Générer
                                    </a>
                                    <a href="index.php?controller=projet&action=voir&id=<?= $projet['id'] ?>"
                                       class="btn btn-secondary btn-sm">
                                        👁 Voir
                                    </a>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    
    <?php endif; ?>
</div>