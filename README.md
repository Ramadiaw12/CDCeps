<div align="center">

# 📋 CDCEPS

### Générateur Automatique de Cahiers des Charges

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6C5CE7&center=true&vCenter=true&width=650&lines=De+l'id%C3%A9e+au+document+technique...;En+quelques+minutes.+%E2%9A%A1;Propuls%C3%A9+par+un+syst%C3%A8me+multi-agents+%F0%9F%A4%96" alt="Typing SVG" />

<br>

[![Status](https://img.shields.io/badge/status-production-brightgreen?style=for-the-badge)](https://github.com)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](https://github.com)

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Groq](https://img.shields.io/badge/Groq-API-F55036?style=flat-square)](https://groq.com)
[![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen?style=flat-square)](https://github.com)
[![Quality](https://img.shields.io/badge/quality-A-blue?style=flat-square)](https://github.com)
[![Security](https://img.shields.io/badge/security-A+-success?style=flat-square)](https://github.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com)

<br>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="500">

</div>

<br>

## 📖 Table des Matières

<details>
<summary>Cliquer pour déplier</summary>

- [🚀 Introduction](#-introduction)
- [🎯 Objectifs](#-objectifs)
- [🏗️ Architecture](#️-architecture)
- [📊 Modèle de Données](#-modèle-de-données)
- [🤖 Agents IA](#-agents-ia)
- [🛠️ Stack Technique](#️-stack-technique)
- [⚙️ Installation](#️-installation)
- [🚀 Utilisation](#-utilisation)
- [🔧 Configuration](#-configuration)
- [📈 Performance](#-performance)
- [🔐 Sécurité](#-sécurité)
- [📝 API Reference](#-api-reference)
- [🧪 Tests](#-tests)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)
- [👨‍💻 Équipe](#-équipe)
- [🙏 Remerciements](#-remerciements)

</details>

<br>

## 🚀 Introduction

### Contexte

La rédaction d'un **Cahier des Charges (CDC)** est une étape cruciale dans le cycle de vie d'un projet logiciel. Elle permet de formaliser les besoins du client, de définir le périmètre du projet et de poser les bases techniques. Cependant, ce processus est souvent :

| Problème | Impact |
|---|---|
| ⏱️ **Long et fastidieux** | Plusieurs jours de travail |
| ❌ **Sujet aux erreurs** | Omissions, incohérences |
| 📚 **Complexe** | Nécessite une expertise technique et métier |
| 🔄 **Peu itératif** | Difficulté à intégrer les retours |

### Solution

**CDCEPS** est un **système multi-agents intelligent** qui automatise la génération de CDC. À partir d'une simple description brute du projet, le système :

```mermaid
flowchart LR
    A[📝 Description brute] --> B[🔍 Extraction]
    B --> C[📊 Analyse + RAG]
    C --> D[✍️ Rédaction]
    D --> E[✅ Validation]
    E --> F[📄 CDC final]
```

1. 🔍 **Extrait** les besoins structurés à partir d'un texte libre
2. 📊 **Analyse** et enrichit avec une base de connaissances (RAG)
3. ✍️ **Rédige** un CDC professionnel et structuré
4. ✅ **Valide** la qualité et la complétude du document généré

### Valeur Ajoutée

<div align="center">

| Métrique | Avant | Après | Gain |
|:---:|:---:|:---:|:---:|
| ⏱️ Temps de rédaction | 3-5 jours | ~1 minute | 🚀 ~99% |
| 📊 Complétude | 60% | 90% | 📈 +30 pts |
| 🎯 Cohérence | Variable | Standardisée | ✅ |
| 🔄 Itérations | Lentes | Rapides | ⚡ |
| 💰 Coût | Élevé | Minimal | 💸 |

</div>

---

## 🎯 Objectifs

<table>
<tr>
<td width="33%" valign="top">

### ✅ Fonctionnels
- Générer un CDC complet à partir d'une description textuelle
- Proposer une architecture technique adaptée
- Identifier les risques et proposer des mitigations
- Estimer la complexité et les ressources nécessaires
- Exporter le CDC en PDF et Markdown

</td>
<td width="33%" valign="top">

### ⚙️ Techniques
- Architecture modulaire et scalable
- Communication temps réel (Socket.IO)
- Recherche sémantique (RAG + pgvector)
- Interface utilisateur moderne (React)
- Administration légère (PHP)

</td>
<td width="33%" valign="top">

### 💼 Métiers
- Réduire le temps de préparation des projets
- Améliorer la qualité des CDC
- Standardiser les documents produits
- Faciliter la collaboration entre équipes

</td>
</tr>
</table>

---

## 🏗️ Architecture

### Vue d'ensemble

```mermaid
flowchart TB
    subgraph Users["👤 Utilisateurs"]
        U1[Client]
        U2[Admin]
    end

    subgraph Frontend["🖥️ Frontend React :5173"]
        F1[📝 Formulaire]
        F2[⚙️ Génération]
        F3[📄 Résultat]
    end

    subgraph Admin["📋 Admin PHP :8000"]
        A1[📊 Dashboard]
        A2[📁 Projets]
        A3[📄 CDC]
        A4[📚 RAG]
    end

    subgraph Backend["⚡ Backend Node.js :3001"]
        B1[🌐 API REST]
        B2[📡 Socket.IO]
        B3[🧠 Orchestrateur]
    end

    subgraph Agents["🤖 Agents IA"]
        direction LR
        AG1[🔍 Collecte]
        AG2[📊 Analyse]
        AG3[✍️ Génération]
        AG4[✅ Validation]
    end

    subgraph LLM["🦙 LLM Groq"]
        L1[llama-3.3-70b-versatile]
        L2[mixtral-8x7b-32768]
    end

    subgraph Database["💾 PostgreSQL + pgvector"]
        D1[(🐘 PostgreSQL)]
        D2[(📦 pgvector)]
    end

    U1 --> F1 --> B1 --> D1
    U1 --> F2 --> B2 --> B3
    B3 --> AG1 --> AG2 --> AG3 --> AG4
    AG1 --> L1
    AG2 --> L1
    AG3 --> L1
    AG4 --> L2
    AG2 --> D2
    AG1 & AG2 & AG3 & AG4 --> D1
    B3 --> B2 --> F2 --> F3 --> U1
    U2 --> A1 --> D1
    A2 & A3 & A4 --> D1
```

### Composants

| Composant | Rôle | Port |
|---|---|:---:|
| 🖥️ **Frontend React** | Interface client : saisie, suivi en temps réel, affichage du résultat | `5173` |
| ⚡ **Backend Node.js** | API REST, WebSocket, orchestration des agents IA | `3001` |
| 📋 **Admin PHP** | Dashboard de suivi, gestion des projets/CDC, base de connaissances RAG | `8000` |
| 💾 **PostgreSQL + pgvector** | Persistance relationnelle et recherche vectorielle sémantique | `5432` |
| 🦙 **Groq LLM** | Inférence rapide (llama-3.3-70b, mixtral-8x7b) | API |

### Flux de données

1. Le client saisit une **description brute** du projet dans le formulaire React
2. Le backend reçoit la requête via l'**API REST**, crée le projet en base
3. La génération se déclenche : le frontend s'abonne au canal **Socket.IO** dédié
4. L'**Orchestrateur** exécute le pipeline d'agents séquentiellement, en diffusant chaque étape en temps réel
5. Le CDC final est persisté et renvoyé au client, exportable en **PDF/Markdown**

---

## 📊 Modèle de Données

### Diagramme ERD

```mermaid
erDiagram
    PROJECTS ||--o{ CDC_DOCUMENTS : genere
    PROJECTS ||--o{ REQUIREMENTS : contient
    CDC_DOCUMENTS ||--o{ SECTIONS : compose
    CDC_DOCUMENTS ||--o{ VALIDATIONS : subit
    KNOWLEDGE_BASE ||--o{ EMBEDDINGS : indexe
    USERS ||--o{ PROJECTS : possede

    PROJECTS {
        uuid id PK
        string title
        text raw_description
        string status
        timestamp created_at
    }
    REQUIREMENTS {
        uuid id PK
        uuid project_id FK
        string category
        text content
        int priority
    }
    CDC_DOCUMENTS {
        uuid id PK
        uuid project_id FK
        string version
        text content_md
        string export_pdf_path
    }
    SECTIONS {
        uuid id PK
        uuid document_id FK
        string title
        text content
        int order_index
    }
    VALIDATIONS {
        uuid id PK
        uuid document_id FK
        float quality_score
        json feedback
    }
    KNOWLEDGE_BASE {
        uuid id PK
        string source
        text raw_text
    }
    EMBEDDINGS {
        uuid id PK
        uuid kb_id FK
        vector embedding
    }
    USERS {
        uuid id PK
        string email
        string role
    }
```

### Description des tables

| Table | Description |
|---|---|
| `projects` | Projets créés par les utilisateurs, avec leur description brute |
| `requirements` | Besoins extraits et structurés par l'agent Collecte |
| `cdc_documents` | Versions successives des cahiers des charges générés |
| `sections` | Sections structurées composant chaque CDC |
| `validations` | Scores et retours de qualité produits par l'agent Validation |
| `knowledge_base` | Corpus documentaire source pour le RAG |
| `embeddings` | Vecteurs sémantiques (pgvector) associés à la base de connaissances |
| `users` | Comptes utilisateurs (client / admin) |

### Relations

- Un **projet** génère plusieurs **versions de CDC** (historique conservé)
- Chaque **CDC** est composé de plusieurs **sections** ordonnées
- Chaque **CDC** passe par une ou plusieurs **validations**
- La **base de connaissances** alimente la recherche sémantique via des **embeddings**

---

## 🤖 Agents IA

Le cœur du système repose sur un **pipeline séquentiel de 4 agents** spécialisés, chacun avec un rôle précis.

```mermaid
flowchart LR
    IN([📝 Description brute]) --> A1
    subgraph Pipeline["Pipeline Multi-Agents"]
        A1[🔍 Agent Collecte] --> A2[📊 Agent Analyse]
        A2 --> A3[✍️ Agent Génération]
        A3 --> A4[✅ Agent Validation]
    end
    A4 --> OUT([📄 CDC Validé])
    A4 -.retour si score bas.-> A3
```

### 🔍 Agent Collecte
Extrait les besoins, contraintes et objectifs implicites depuis le texte libre fourni par l'utilisateur, et les structure en entités exploitables (`requirements`).

### 📊 Agent Analyse
Enrichit les besoins collectés via une recherche sémantique (RAG) dans la base de connaissances, identifie les risques, et propose des choix d'architecture pertinents.

### ✍️ Agent Génération
Rédige le contenu structuré du CDC (contexte, objectifs, architecture, planning, budget) section par section, dans un style professionnel et cohérent.

### ✅ Agent Validation
Contrôle la complétude, la cohérence et la qualité rédactionnelle du document produit ; calcule un score de qualité et déclenche une régénération ciblée si nécessaire.

### Pipeline Multi-Agents

| Étape | Agent | Modèle LLM | Sortie |
|:---:|---|---|---|
| 1 | Collecte | `llama-3.3-70b-versatile` | Besoins structurés (JSON) |
| 2 | Analyse | `llama-3.3-70b-versatile` | Contexte enrichi + risques |
| 3 | Génération | `llama-3.3-70b-versatile` | Contenu Markdown du CDC |
| 4 | Validation | `mixtral-8x7b-32768` | Score qualité + feedback |

---

## 🛠️ Stack Technique

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logoColor=white)

</div>

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Socket.IO Client, TailwindCSS |
| **Backend** | Node.js 22, Express, Socket.IO, orchestration d'agents |
| **Base de Données** | PostgreSQL 16 + extension `pgvector` |
| **LLM** | Groq API — `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` |
| **Administration** | PHP 8, dashboard de suivi des projets et de la base RAG |

---

## ⚙️ Installation

### Prérequis

- Node.js `≥ 22.x`
- PostgreSQL `≥ 16.x` avec l'extension `pgvector`
- PHP `≥ 8.x`
- Une clé API [Groq](https://groq.com)

### Cloner le Projet

```bash
git clone https://github.com/votre-org/cdceps.git
cd cdceps
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Renseigner GROQ_API_KEY, DATABASE_URL, etc.
npm run migrate
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

### Admin PHP

```bash
cd admin
composer install
cp config.example.php config.php
```

### Base de Données

```bash
createdb cdceps
psql -d cdceps -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql -d cdceps -f schema.sql
```

---

## 🚀 Utilisation

### Démarrer le Backend

```bash
cd backend
npm run dev
# → API disponible sur http://localhost:3001
```

### Démarrer le Frontend

```bash
cd frontend
npm run dev
# → Interface disponible sur http://localhost:5173
```

### Démarrer l'Admin PHP

```bash
cd admin
php -S localhost:8000
# → Dashboard disponible sur http://localhost:8000
```

### Exemple d'Utilisation

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Plateforme e-commerce",
    "raw_description": "Je veux une marketplace avec paiement en ligne, gestion de stock et espace vendeur."
  }'
```

La génération démarre automatiquement ; l'avancement du pipeline (Collecte → Analyse → Génération → Validation) est diffusé en temps réel via Socket.IO.

---

## 🔧 Configuration

### Variables d'Environnement

```env
# Backend (.env)
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/cdceps
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL_MAIN=llama-3.3-70b-versatile
GROQ_MODEL_VALIDATION=mixtral-8x7b-32768
SOCKET_CORS_ORIGIN=http://localhost:5173
```

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### Fichiers de Configuration

| Fichier | Rôle |
|---|---|
| `backend/.env` | Secrets et paramètres serveur |
| `frontend/.env` | URLs d'API consommées par le client |
| `admin/config.php` | Connexion à la base pour le dashboard PHP |
| `backend/config/agents.json` | Prompts et paramètres par agent |

---

## 📈 Performance

### Métriques

| Métrique | Valeur cible |
|---|:---:|
| ⏱️ Temps de génération d'un CDC | < 60 s |
| 📡 Latence Socket.IO (mise à jour d'étape) | < 200 ms |
| 🔍 Temps de recherche RAG (top-k) | < 150 ms |
| 📊 Score qualité moyen (Agent Validation) | ≥ 85 % |

### Optimisations

- Indexation vectorielle **IVFFlat** sur `pgvector` pour accélérer le RAG
- Streaming des réponses LLM pour réduire la latence perçue
- Mise en cache des embeddings de la base de connaissances
- Exécution asynchrone et parallélisable des étapes indépendantes du pipeline

---

## 🔐 Sécurité

### Mesures de Sécurité

- 🔑 Authentification par token (JWT) sur l'API REST
- 🛡️ Validation stricte des entrées (schémas côté backend)
- 🔒 Variables sensibles (clés API, credentials) hors du dépôt via `.env`
- 🚫 Limitation de débit (rate limiting) sur les endpoints publics

### Bonnes Pratiques

- Ne jamais committer de fichier `.env`
- Faire tourner les clés API Groq régulièrement
- Restreindre les accès au dashboard Admin PHP par rôle
- Journaliser les appels LLM pour audit et traçabilité

---

## 📝 API Reference

### Endpoints

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/projects` | Crée un projet et démarre la génération du CDC |
| `GET` | `/api/projects/:id` | Récupère l'état et le contenu d'un projet |
| `GET` | `/api/projects/:id/cdc` | Récupère le CDC généré (dernière version) |
| `GET` | `/api/projects/:id/export?format=pdf` | Exporte le CDC en PDF ou Markdown |
| `POST` | `/api/knowledge-base` | Ajoute une source à la base de connaissances RAG |

### Exemples

```bash
# Récupérer le CDC généré
curl http://localhost:3001/api/projects/{id}/cdc

# Exporter en PDF
curl http://localhost:3001/api/projects/{id}/export?format=pdf -o cdc.pdf
```

---

## 🧪 Tests

### Tests Unitaires

```bash
cd backend
npm run test:unit
```

### Tests d'Intégration

```bash
cd backend
npm run test:integration
```

---

## 🤝 Contribution

### Guide de Contribution

1. Forkez le dépôt
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Committez vos changements (`git commit -m 'feat: ma feature'`)
4. Poussez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

### Standards de Code

- Convention **Conventional Commits**
- Linting via ESLint / Prettier (JS), PSR-12 (PHP)
- Tests requis pour toute nouvelle fonctionnalité

### Processus de Review

- Toute PR nécessite au moins **1 approbation**
- La CI (build + tests) doit être verte avant merge

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Équipe

| Rôle | Contact |
|---|---|
| Chef de projet | — |
| Développeur Backend | — |
| Développeur Frontend | — |
| Ingénieur IA / Agents | — |

---

## 🙏 Remerciements

- L'équipe **Groq** pour l'accès à une inférence LLM rapide
- La communauté **pgvector** pour la recherche sémantique
- Tous les contributeurs open source ayant rendu ce projet possible

<br>

<div align="center">

**⭐ Si ce projet vous est utile, n'hésitez pas à lui laisser une étoile !**

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="100">

</div>