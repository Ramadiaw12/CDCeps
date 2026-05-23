CREATE DATABASE IF NOT EXISTS cdceps 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cdceps;
-- ============================================================
-- TABLE : clients
-- Stocke les informations du client qui fait la demande
-- ============================================================

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Informations personnelles du contact
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    
    -- Informations sur l'entreprise du client
    entreprise VARCHAR(200),
    secteur ENUM(
        'informatique',
        'commerce',
        'industrie',
        'sante',
        'education',
        'finance',
        'autre'
    ) DEFAULT 'autre',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE : projets
-- Contient la description brute du projet soumis par le client
-- ============================================================
CREATE TABLE projets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Lien vers le client demandeur
    client_id INT NOT NULL,
    
    -- Informations de base du projet
    titre VARCHAR(300) NOT NULL,
    description_brute TEXT NOT NULL,  -- Ce que le client écrit librement
    
    -- Classification du projet (utilisée par l'agent analyse)
    type_projet ENUM(
        'application_web',
        'application_mobile',
        'erp',
        'ecommerce',
        'api',
        'autre'
    ) DEFAULT 'autre',
    
    -- Contraintes exprimées par le client
    budget_estime DECIMAL(10,2),      -- En DZD ou devise choisie
    delai_souhaite VARCHAR(100),      -- Ex: "3 mois", "Q1 2026"
    technologies_souhaitees TEXT,     -- Ce que le client mentionne
    
    -- Statut du projet dans le pipeline
    statut ENUM(
        'soumis',       -- Reçu, pas encore traité
        'en_analyse',   -- Agents en cours de traitement
        'cdc_genere',   -- CDC produit avec succès
        'valide',       -- Validé par EPS SARL
        'archive'       -- Terminé ou abandonné
    ) DEFAULT 'soumis',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clé étrangère : un projet appartient à un client
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);


-- ============================================================
-- TABLE : sessions_agents
-- Trace chaque exécution du pipeline multi-agents
-- Permet de suivre l'état en temps réel depuis le frontend
-- ============================================================
CREATE TABLE sessions_agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Lien vers le projet concerné
    projet_id INT NOT NULL,
    
    -- Identifiant unique de session (utilisé par WebSocket)
    session_uuid VARCHAR(36) NOT NULL UNIQUE,
    
    -- Progression de chaque agent individuellement
    -- "pending" = pas encore démarré
    -- "running"  = en cours
    -- "done"     = terminé avec succès
    -- "error"    = échec
    statut_agent_collecte ENUM('pending','running','done','error') DEFAULT 'pending',
    statut_agent_analyse  ENUM('pending','running','done','error') DEFAULT 'pending',
    statut_agent_generation ENUM('pending','running','done','error') DEFAULT 'pending',
    statut_agent_validation ENUM('pending','running','done','error') DEFAULT 'pending',
    
    -- Statut global de la session
    statut_global ENUM('en_cours','termine','erreur') DEFAULT 'en_cours',
    
    -- Messages d'erreur si un agent échoue
    message_erreur TEXT,
    
    -- Timestamps de début et fin
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    
    FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
);


-- ============================================================
-- TABLE : cahiers_des_charges
-- Stocke le CDC généré par les agents
-- ============================================================
CREATE TABLE cahiers_des_charges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Liens vers le projet et la session qui l'a produit
    projet_id INT NOT NULL,
    session_id INT NOT NULL,
    
    -- Le contenu principal en Markdown (généré par Agent 3)
    contenu_markdown LONGTEXT NOT NULL,
    
    -- Score de qualité attribué par Agent 4 (0 à 100)
    score_completude INT DEFAULT 0,
    
    -- Sections manquantes détectées par Agent 4
    sections_manquantes JSON,
    
    -- Chemin du fichier PDF si déjà exporté
    -- NULL si pas encore exporté
    fichier_pdf_path VARCHAR(500),
    
    -- Version du CDC (on peut avoir plusieurs versions)
    version INT DEFAULT 1,
    
    statut ENUM('brouillon','finalise') DEFAULT 'brouillon',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions_agents(id) ON DELETE CASCADE
);


-- ============================================================
-- TABLE : documents_rag
-- Anciens CDC simulés utilisés comme base documentaire
-- Le module RAG cherche dans ces documents pour enrichir
-- la génération de nouveaux CDC
-- ============================================================
CREATE TABLE documents_rag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Métadonnées du document
    titre VARCHAR(300) NOT NULL,
    type_projet ENUM(
        'application_web',
        'application_mobile',
        'erp',
        'ecommerce',
        'api',
        'autre'
    ) NOT NULL,
    secteur VARCHAR(100),
    
    -- Le contenu du document (ancien CDC)
    contenu TEXT NOT NULL,
    
    -- Mots-clés extraits pour la recherche rapide
    mots_cles JSON,
    
    -- Vecteur d'embedding stocké en JSON
    -- C'est la représentation numérique du document
    -- utilisée pour calculer la similarité sémantique
    embedding JSON,
    
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE : sections_cdc
-- Template des sections standards d'un CDC chez EPS SARL
-- L'Agent 3 s'appuie sur ces sections pour structurer
-- la génération
-- ============================================================
CREATE TABLE sections_cdc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Nom et ordre d'apparition dans le CDC
    nom VARCHAR(200) NOT NULL,
    ordre INT NOT NULL,
    
    -- Description de ce que doit contenir cette section
    description TEXT,
    
    -- Est-ce que cette section est obligatoire ?
    obligatoire BOOLEAN DEFAULT TRUE,
    
    -- Prompt de base utilisé par l'agent pour générer cette section
    prompt_template TEXT,
    
    actif BOOLEAN DEFAULT TRUE
);


-- ============================================================
-- DONNÉES INITIALES : sections standards d'un CDC
-- ============================================================
INSERT INTO sections_cdc (nom, ordre, description, obligatoire, prompt_template) VALUES
(
    'Contexte et présentation du projet', 1,
    'Description générale du projet, contexte métier, enjeux',
    TRUE,
    'Génère une section "Contexte" professionnelle basée sur ces informations client : {description}'
),
(
    'Objectifs du projet', 2,
    'Objectifs principaux et secondaires, critères de succès',
    TRUE,
    'Liste les objectifs SMART du projet basés sur : {description}'
),
(
    'Périmètre fonctionnel', 3,
    'Ce qui est inclus et exclu du projet',
    TRUE,
    'Définis le périmètre fonctionnel incluant et excluant : {besoins}'
),
(
    'Besoins fonctionnels', 4,
    'Liste détaillée des fonctionnalités attendues',
    TRUE,
    'Liste les besoins fonctionnels détaillés pour : {besoins}'
),
(
    'Besoins non fonctionnels', 5,
    'Performance, sécurité, disponibilité, scalabilité',
    TRUE,
    'Identifie les besoins non fonctionnels (performance, sécurité) pour : {type_projet}'
),
(
    'Contraintes techniques', 6,
    'Technologies imposées, hébergement, intégrations',
    FALSE,
    'Liste les contraintes techniques basées sur : {technologies}'
),
(
    'Livrables attendus', 7,
    'Documents, logiciels, formations à livrer',
    TRUE,
    'Définis les livrables pour un projet de type : {type_projet}'
),
(
    'Planning prévisionnel', 8,
    'Phases, jalons, délais estimés',
    FALSE,
    'Propose un planning pour un délai de : {delai}'
),
(
    'Budget prévisionnel', 9,
    'Estimation des coûts par poste',
    FALSE,
    'Estime le budget pour un projet de type {type_projet} avec budget : {budget}'
);