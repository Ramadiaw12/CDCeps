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
        /* ============================================================
           STYLES GLOBAUX
           ============================================================ */
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #f1f5f9;
            color: #1e293b;
            font-size: 14px;
            line-height: 1.6;
        }

        /* ============================================================
           SIDEBAR
           ============================================================ */
        .sidebar {
            position: fixed;
            left: 0; top: 0;
            width: 240px;
            height: 100vh;
            background: #0f172a;
            padding: 24px 0;
            z-index: 100;
            overflow-y: auto;
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
            letter-spacing: -0.5px;
        }

        .sidebar-logo span {
            font-size: 11px;
            color: #64748b;
            display: block;
            margin-top: 2px;
        }

        .nav-section {
            padding: 16px 24px 6px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #475569;
            font-weight: 600;
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
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: #1e293b;
            color: #ffffff;
        }

        .nav-item.active {
            background: #1e293b;
            color: #60a5fa;
            border-left-color: #3b82f6;
        }

        .nav-item .nav-icon {
            font-size: 16px;
            width: 24px;
            text-align: center;
        }

        /* 
           MAIN CONTENT
            */
        .main {
            margin-left: 240px;
            min-height: 100vh;
        }

        /* 
           TOPBAR
            */
        .topbar {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .topbar h2 {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
        }

        .topbar-actions {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }

        .topbar-date {
            color: #64748b;
            font-size: 12px;
        }

        /* 
           CONTENT
            */
        .content {
            padding: 28px 32px;
        }

        /* 
           CARDS
            */
        .card {
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .card-title {
            font-size: 15px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* ============================================================
           STATS GRID
           ============================================================ */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 28px;
        }

        .stat-card {
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            padding: 18px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.2s ease;
        }

        .stat-card:hover {
            border-color: #94a3b8;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .stat-icone {
            width: 46px;
            height: 46px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }

        .stat-info {
            flex: 1;
        }

        .stat-info .valeur {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.1;
        }

        .stat-info .label {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
        }

        /* 
           TABLEAUX
            */
        .table-responsive {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        th {
            background: #f8fafc;
            padding: 10px 14px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
        }

        td {
            padding: 10px 14px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f8fafc; }

        /* 
           BADGES
            */
        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
        }

        .badge-success  { background: #dcfce7; color: #166534; }
        .badge-warning  { background: #fef3c7; color: #92400e; }
        .badge-danger   { background: #fee2e2; color: #991b1b; }
        .badge-primary  { background: #dbeafe; color: #1e40af; }
        .badge-gray     { background: #f1f5f9; color: #475569; }

        /* 
           BOUTONS
            */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 16px;
            border-radius: 7px;
            border: none;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
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
        .btn-sm { padding: 4px 12px; font-size: 12px; }

        /* 
           FORMULAIRES
            */
        .form-group { margin-bottom: 16px; }

        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 4px;
            color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 8px 12px;
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
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-group textarea { min-height: 100px; resize: vertical; }

        /* 
           ALERTES
            */
        .alert {
            padding: 10px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
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

        /* 
           GRID
            */
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

        /* 
           SCORE BAR
            */
        .score-bar {
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 4px;
        }

        .score-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.5s ease;
        }

        /* 
           LIENS
            */
        .link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }

        .link:hover { text-decoration: underline; }

        /* 
           RESPONSIVE
            */
        @media (max-width: 768px) {
            .sidebar {
                width: 200px;
            }
            .main {
                margin-left: 200px;
            }
            .topbar {
                padding: 12px 16px;
            }
            .content {
                padding: 16px;
            }
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .grid-2, .grid-3 {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            .sidebar {
                width: 60px;
            }
            .sidebar-logo h1 { font-size: 14px; }
            .sidebar-logo span { display: none; }
            .nav-item { padding: 10px 12px; font-size: 12px; }
            .nav-item span:not(.nav-icon) { display: none; }
            .main { margin-left: 60px; }
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>

<!-- ============================================================
     SIDEBAR
     ============================================================ -->
<nav class="sidebar">
    <div class="sidebar-logo">
        <h1>📋 <?= APP_NAME ?></h1>
        <span><?= COMPANY_NAME ?></span>
    </div>

    <span class="nav-section">Navigation</span>

    <a href="index.php?controller=dashboard&action=index"
       class="nav-item <?= ($controller === 'dashboard' || !isset($controller)) ? 'active' : '' ?>">
        <span class="nav-icon">📊</span>
        <span>Dashboard</span>
    </a>

    <a href="index.php?controller=projet&action=index"
       class="nav-item <?= ($controller === 'projet') ? 'active' : '' ?>">
        <span class="nav-icon">📁</span>
        <span>Projets</span>
    </a>

    <a href="index.php?controller=cdc&action=index"
       class="nav-item <?= ($controller === 'cdc') ? 'active' : '' ?>">
        <span class="nav-icon">📄</span>
        <span>CDC Générés</span>
    </a>

    <a href="index.php?controller=rag&action=index"
       class="nav-item <?= ($controller === 'rag') ? 'active' : '' ?>">
        <span class="nav-icon">📚</span>
        <span>Base RAG</span>
    </a>

    <span class="nav-section">Liens</span>

    <a href="http://localhost:5173" target="_blank" class="nav-item">
        <span class="nav-icon">🌐</span>
        <span>Application React</span>
    </a>

    <a href="http://localhost:3001/api/health" target="_blank" class="nav-item">
        <span class="nav-icon">⚡</span>
        <span>API Node.js</span>
    </a>
</nav>

<!-- ============================================================
     CONTENU PRINCIPAL
     ============================================================ -->
<main class="main">

    <!-- Topbar -->
    <div class="topbar">
        <h2>
            <?php
                $titres = [
                    'dashboard' => '📊 Tableau de bord',
                    'projet'    => '📁 Gestion des projets',
                    'cdc'       => '📄 CDC Générés',
                    'rag'       => '📚 Base documentaire RAG',
                    'cdc_detail'=> '📄 Détail CDC',
                ];
                $controller = $_GET['controller'] ?? 'dashboard';
                echo $titres[$controller] ?? 'Dashboard';
            ?>
        </h2>
        <div class="topbar-actions">
            <span class="topbar-date"><?= date('d/m/Y H:i') ?></span>
            <a href="http://localhost:5173/nouveau-projet" target="_blank" class="btn btn-primary btn-sm">
                ➕ Nouveau projet
            </a>
        </div>
    </div>

    <!-- Messages de session -->
    <div style="padding: 0 32px;">
        <?php if (isset($_SESSION['message'])): ?>
            <div class="alert alert-success">
                ✅ <?= htmlspecialchars($_SESSION['message']) ?>
            </div>
            <?php unset($_SESSION['message']); ?>
        <?php endif; ?>

        <?php if (isset($_SESSION['erreur'])): ?>
            <div class="alert alert-danger">
                ❌ <?= htmlspecialchars($_SESSION['erreur']) ?>
            </div>
            <?php unset($_SESSION['erreur']); ?>
        <?php endif; ?>
    </div>

    <!-- Vue dynamique -->
    <div class="content">
        <?php
            // Charge la vue correspondant au contrôleur
            $vuesFichiers = [
                'dashboard'  => 'dashboard.php',
                'projet'     => 'projets.php',
                'cdc'        => 'cdcs.php',
                'rag'        => 'rag.php',
                'cdc_detail' => 'cdc_detail.php',
            ];
            $vueFichier = $vuesFichiers[$controller ?? 'dashboard'] ?? 'dashboard.php';
            require_once __DIR__ . '/' . $vueFichier;
        ?>
    </div>

</main>

</body>
</html>