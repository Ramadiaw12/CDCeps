<?php
// ============================================================
// views/layout.php
// Template principal partagé par toutes les vues
// Contient le header, la navbar et le footer
// ============================================================
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= APP_NAME ?> — <?= COMPANY_NAME ?></title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f1f5f9;
            color: #1e293b;
            font-size: 14px;
        }

        /* ── Sidebar ─────────────────────────────────────── */
        .sidebar {
            position: fixed;
            left: 0; top: 0;
            width: 240px;
            height: 100vh;
            background: #0f172a;
            padding: 24px 0;
            z-index: 100;
        }

        .sidebar-logo {
            padding: 0 24px 24px;
            border-bottom: 1px solid #1e293b;
            margin-bottom: 16px;
        }

        .sidebar-logo h1 {
            font-size: 18px;
            color: #ffffff;
            font-weight: 700;
        }

        .sidebar-logo span {
            font-size: 11px;
            color: #64748b;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 11px 24px;
            color: #94a3b8;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: #1e293b;
            color: #ffffff;
        }

        .nav-item.active {
            background: #1e293b;
            color: #2563eb;
            border-left-color: #2563eb;
        }

        .nav-section {
            padding: 16px 24px 6px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #475569;
        }

        /* ── Contenu principal ───────────────────────────── */
        .main {
            margin-left: 240px;
            min-height: 100vh;
        }

        /* ── Topbar ──────────────────────────────────────── */
        .topbar {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .topbar h2 {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
        }

        .topbar-actions {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        /* ── Page content ────────────────────────────────── */
        .content {
            padding: 28px 32px;
        }

        /* ── Cards ───────────────────────────────────────── */
        .card {
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .card-title {
            font-size: 15px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f1f5f9;
        }

        /* ── Stats grid ──────────────────────────────────── */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 28px;
        }

        .stat-card {
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .stat-icone {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
        }

        .stat-info .valeur {
            font-size: 26px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1;
        }

        .stat-info .label {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
        }

        /* ── Tableaux ────────────────────────────────────── */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f8fafc;
            padding: 10px 14px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
        }

        td {
            padding: 12px 14px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
            color: #374151;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f8fafc; }

        /* ── Badges ──────────────────────────────────────── */
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
        }

        .badge-success  { background: #dcfce7; color: #166534; }
        .badge-warning  { background: #fef3c7; color: #92400e; }
        .badge-danger   { background: #fee2e2; color: #991b1b; }
        .badge-primary  { background: #dbeafe; color: #1e40af; }
        .badge-gray     { background: #f1f5f9; color: #475569; }

        /* ── Boutons ─────────────────────────────────────── */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 7px;
            border: none;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn-primary  { background: #2563eb; color: white; }
        .btn-primary:hover  { background: #1d4ed8; }
        .btn-success  { background: #10b981; color: white; }
        .btn-success:hover  { background: #059669; }
        .btn-danger   { background: #ef4444; color: white; }
        .btn-danger:hover   { background: #dc2626; }
        .btn-secondary {
            background: white;
            color: #374151;
            border: 1px solid #e2e8f0;
        }
        .btn-secondary:hover { background: #f8fafc; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }

        /* ── Formulaires ─────────────────────────────────── */
        .form-group { margin-bottom: 16px; }

        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 6px;
            color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 9px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 7px;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .form-group textarea { min-height: 120px; resize: vertical; }

        /* ── Alertes ─────────────────────────────────────── */
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 13px;
        }

        .alert-success {
            background: #f0fdf4;
            border: 1px solid #86efac;
            color: #166534;
        }

        .alert-danger {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            color: #991b1b;
        }

        /* ── Grid ────────────────────────────────────────── */
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }

        /* ── Score bar ───────────────────────────────────── */
        .score-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 4px;
        }

        .score-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s;
        }

        /* ── Lien externe ────────────────────────────────── */
        .link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }

        .link:hover { text-decoration: underline; }
    </style>
</head>
<body>

<!-- ── Sidebar ──────────────────────────────────────────── -->
<nav class="sidebar">
    <div class="sidebar-logo">
        <h1>📋 <?= APP_NAME ?></h1>
        <span><?= COMPANY_NAME ?></span>
    </div>

    <span class="nav-section">Navigation</span>

    <a href="index.php"
       class="nav-item <?= (!isset($_GET['page']) || $_GET['page'] === 'dashboard') ? 'active' : '' ?>">
        📊 Dashboard
    </a>

    <a href="index.php?page=projets"
       class="nav-item <?= (($_GET['page'] ?? '') === 'projets') ? 'active' : '' ?>">
        📁 Projets
    </a>

    <a href="index.php?page=cdcs"
       class="nav-item <?= (($_GET['page'] ?? '') === 'cdcs') ? 'active' : '' ?>">
        📄 CDC Générés
    </a>

    <a href="index.php?page=rag"
       class="nav-item <?= (($_GET['page'] ?? '') === 'rag') ? 'active' : '' ?>">
        📚 Base RAG
    </a>

    <span class="nav-section">Liens</span>

    <a href="http://localhost:5173"
       target="_blank" class="nav-item">
        🌐 Application React
    </a>

    <a href="http://localhost:3001/api/health"
       target="_blank" class="nav-item">
        ⚡ API Node.js
    </a>
</nav>

<!-- ── Contenu principal ────────────────────────────────── -->
<main class="main">
    <!-- Topbar -->
    <div class="topbar">
        <h2>
            <?php
                $titres = [
                    'dashboard' => '📊 Tableau de bord',
                    'projets'   => '📁 Gestion des projets',
                    'cdcs'      => '📄 CDC Générés',
                    'rag'       => '📚 Base documentaire RAG',
                    'cdc_detail'=> '📄 Détail CDC',
                ];
                $page = $_GET['page'] ?? 'dashboard';
                echo $titres[$page] ?? 'Dashboard';
            ?>
        </h2>
        <div class="topbar-actions">
            <span style="color:#64748b;font-size:12px;">
                <?= date('d/m/Y H:i') ?>
            </span>
            <a href="http://localhost:5173/nouveau-projet"
               target="_blank" class="btn btn-primary btn-sm">
                + Nouveau projet
            </a>
        </div>
    </div>

    <!-- Messages de session -->
    <div style="padding: 0 32px;">
        <?php if (isset($_SESSION['message'])): ?>
            <div class="alert alert-success" style="margin-top:16px;">
                ✅ <?= htmlspecialchars($_SESSION['message']) ?>
            </div>
            <?php unset($_SESSION['message']); ?>
        <?php endif; ?>

        <?php if (isset($_SESSION['erreur'])): ?>
            <div class="alert alert-danger" style="margin-top:16px;">
                ❌ <?= htmlspecialchars($_SESSION['erreur']) ?>
            </div>
            <?php unset($_SESSION['erreur']); ?>
        <?php endif; ?>
    </div>

    <!-- Vue dynamique -->
    <div class="content">
        <?php
            // Charge la vue correspondant à la page demandée
            $vuesFichiers = [
                'dashboard'  => 'dashboard.php',
                'projets'    => 'projets.php',
                'cdcs'       => 'projets.php',
                'rag'        => 'rag.php',
                'cdc_detail' => 'cdc_detail.php',
            ];

            $vueFichier = $vuesFichiers[$vue ?? 'dashboard'] ?? 'dashboard.php';
            require_once __DIR__ . '/' . $vueFichier;
        ?>
    </div>
</main>

</body>
</html>