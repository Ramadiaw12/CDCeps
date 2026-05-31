-- ============================================================
-- data_rag.sql
-- Données RAG simulées — anciens CDC d'EPS SARL
-- Ces documents servent de référence au module RAG
-- pour enrichir la génération de nouveaux CDC
-- ============================================================

USE cdceps;

INSERT INTO documents_rag (titre, type_projet, secteur, contenu, mots_cles) VALUES

-- ── Document 1 : Application Web RH 
(
'CDC - Application de gestion des ressources humaines',
'application_web',
'industrie',
'# Cahier des Charges — Système RH

## Contexte
Entreprise industrielle de 200 employés souhaitant digitaliser
la gestion de ses ressources humaines. Le système actuel est
entièrement manuel basé sur des fichiers Excel.

## Objectifs
- Centraliser la gestion des employés
- Automatiser le calcul des salaires
- Gérer les congés et absences en ligne
- Produire des rapports RH automatiquement

## Besoins fonctionnels
- Fiche employé complète (informations personnelles, contrat, poste)
- Module de paie avec calcul automatique des salaires et cotisations
- Gestion des congés avec workflow de validation manager
- Pointage et suivi des présences
- Tableau de bord RH avec indicateurs clés
- Export des bulletins de paie en PDF
- Gestion des formations et compétences

## Besoins non fonctionnels
- Disponibilité 99.5% pendant les heures ouvrables
- Temps de réponse inférieur à 2 secondes
- Sécurité des données personnelles (RGPD)
- Accès multi-profils (DRH, manager, employé)
- Interface responsive pour mobile

## Contraintes techniques
- Hébergement sur serveur interne de lentreprise
- Compatible avec le système de paie existant
- Base de données MySQL
- Sauvegarde quotidienne automatique

## Livrables
- Application web complète
- Documentation utilisateur
- Formation des utilisateurs clés
- Support 3 mois après livraison

## Planning
- Phase 1 : Analyse et conception (3 semaines)
- Phase 2 : Développement (8 semaines)
- Phase 3 : Tests et recette (2 semaines)
- Phase 4 : Déploiement et formation (1 semaine)

## Budget estimé
500 000 DZD — développement et déploiement inclus',
'["RH", "ressources humaines", "paie", "congés", "employés", "pointage"]'
),

-- ── Document 2 : E-commerce 
(
'CDC - Plateforme e-commerce vente en ligne',
'ecommerce',
'commerce',
'# Cahier des Charges — Plateforme E-commerce

## Contexte
Commerçant souhaitant étendre son activité physique vers
le canal digital. Vente de produits électroniques avec
livraison nationale.

## Objectifs
- Créer une boutique en ligne professionnelle
- Gérer le catalogue produits en autonomie
- Traiter les commandes et paiements en ligne
- Fidéliser la clientèle existante

## Besoins fonctionnels
- Catalogue produits avec catégories et filtres
- Moteur de recherche produits
- Panier et tunnel dachat optimisé
- Paiement en ligne sécurisé (CIB, Dahabia)
- Gestion des stocks en temps réel
- Suivi des commandes pour le client
- Interface admin pour gérer produits et commandes
- Système davis et notations clients
- Promotions et codes promo

## Besoins non fonctionnels
- Performance : chargement page < 3 secondes
- Sécurité paiement SSL/TLS
- Compatible mobile (60% du trafic)
- SEO optimisé pour Google
- Disponibilité 24h/24 7j/7

## Contraintes techniques
- Hébergement cloud (VPS)
- Intégration passerelle paiement algérienne
- CDN pour les images produits
- Certificat SSL obligatoire

## Livrables
- Site e-commerce complet
- Back-office de gestion
- Application mobile (optionnel)
- Formation administrateur

## Planning
- Conception : 2 semaines
- Développement : 10 semaines
- Tests : 2 semaines
- Lancement : 1 semaine

## Budget
800 000 DZD',
'["ecommerce", "boutique", "vente en ligne", "paiement", "catalogue", "commandes"]'
),

-- ── Document 3 : Application Mobile ─────────────────────────
(
'CDC - Application mobile de livraison',
'application_mobile',
'commerce',
'# Cahier des Charges — Application Mobile Livraison

## Contexte
Startup de livraison à domicile souhaitant développer
une application mobile pour connecter clients,
livreurs et restaurants partenaires.

## Objectifs
- Application client pour commander
- Application livreur pour gérer les livraisons
- Dashboard restaurant pour gérer les commandes
- Suivi en temps réel des livraisons

## Besoins fonctionnels
- Inscription et authentification (SMS OTP)
- Géolocalisation et calcul ditinéraire
- Catalogue restaurants avec menus
- Commande et paiement intégré
- Chat entre client et livreur
- Notation et avis
- Historique des commandes
- Notifications push en temps réel
- Panel admin pour superviser

## Besoins non fonctionnels
- Applications iOS et Android
- Fonctionnement offline partiel
- Latence géolocalisation < 1 seconde
- Scalable pour 10 000 utilisateurs simultanés

## Contraintes techniques
- React Native pour cross-platform
- API REST Node.js
- WebSocket pour temps réel
- Google Maps API
- Firebase pour notifications

## Livrables
- App client iOS + Android
- App livreur iOS + Android
- Dashboard web restaurant
- API backend documentée
- Panel administrateur

## Budget
1 500 000 DZD',
'["mobile", "livraison", "géolocalisation", "React Native", "temps réel", "notifications"]'
),

-- ── Document 4 : ERP ────────────────────────────────────────
(
'CDC - Système ERP gestion commerciale',
'erp',
'commerce',
'# Cahier des Charges — ERP Gestion Commerciale

## Contexte
PME commerciale de 50 personnes avec plusieurs agences.
Besoin de centraliser la gestion commerciale, comptable
et logistique sur une seule plateforme.

## Objectifs
- Unifier les processus métier sur une plateforme unique
- Éliminer les doublons de saisie entre services
- Améliorer la visibilité sur lactivité en temps réel
- Réduire les erreurs de gestion

## Besoins fonctionnels
- Gestion des clients et prospects (CRM)
- Gestion des fournisseurs et achats
- Devis, bons de commande, factures
- Gestion des stocks multi-dépôts
- Comptabilité générale et analytique
- Tableau de bord direction avec KPIs
- Gestion des utilisateurs et droits dacccès
- Import/export Excel et PDF
- Alertes stock minimum

## Besoins non fonctionnels
- Multi-agences et multi-utilisateurs
- Sauvegarde temps réel
- Audit trail de toutes les modifications
- Interface en arabe et français
- Performance avec 50 utilisateurs simultanés

## Contraintes techniques
- Architecture client-serveur
- Base de données MySQL
- Serveur interne avec accès VPN pour les agences
- Sauvegarde automatique vers le cloud

## Livrables
- ERP complet avec tous les modules
- Migration des données existantes
- Formation de tous les utilisateurs
- Documentation complète
- Contrat de maintenance 1 an

## Budget
2 000 000 DZD',
'["ERP", "gestion commerciale", "comptabilité", "stocks", "facturation", "CRM", "multi-agences"]'
),

-- ── Document 5 : API Backend 
(
'CDC - API REST microservices fintech',
'api',
'finance',
'# Cahier des Charges — API REST Fintech

## Contexte
Startup fintech développant une solution de paiement
mobile. Besoin dune API robuste et sécurisée pour
alimenter leurs applications clients.

## Objectifs
- Développer une API REST documentée et sécurisée
- Gérer les transactions financières en temps réel
- Intégrer les banques partenaires
- Assurer une disponibilité maximale

## Besoins fonctionnels
- Authentification OAuth 2.0 et JWT
- Gestion des comptes et portefeuilles
- Initiation et suivi des transactions
- Webhooks pour notifications temps réel
- Tableau de bord analytique
- Gestion des limites et plafonds
- Logs et audit de toutes les opérations
- Sandbox pour tests développeurs
- Documentation Swagger/OpenAPI

## Besoins non fonctionnels
- Disponibilité 99.99% (SLA financier)
- Latence < 200ms pour les transactions
- Chiffrement end-to-end
- Conformité PCI-DSS
- Rate limiting anti-fraude
- Scalabilité horizontale

## Contraintes techniques
- Architecture microservices
- Docker et Kubernetes
- PostgreSQL pour les transactions
- Redis pour le cache
- API Gateway Kong
- Monitoring Grafana

## Livrables
- API REST complète et documentée
- SDK client JavaScript et Python
- Documentation développeur
- Environnement sandbox
- Tableau de bord monitoring

## Budget
3 000 000 DZD',
'["API", "REST", "fintech", "paiement", "microservices", "sécurité", "transactions"]'
);