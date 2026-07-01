<?php
// ============================================================
// models/DocumentRAG.php
// Modèle pour la gestion des documents RAG
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

class DocumentRAG {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    // ============================================================
    // LISTE TOUS LES DOCUMENTS RAG
    // ============================================================
    public function getAll($type_projet = null) {
        $sql = "
            SELECT id, title, type_projet, secteur, 
                   mots_cles, actif, created_at, updated_at
            FROM documents 
            WHERE actif = TRUE
        ";
        $params = [];
        
        if ($type_projet) {
            $sql .= " AND type_projet = ?";
            $params[] = $type_projet;
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    // ============================================================
    // RÉCUPÈRE UN DOCUMENT PAR SON ID
    // ============================================================
    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT d.*, 
                   array_length(de.embedding, 1) as embedding_dimensions
            FROM documents d
            LEFT JOIN document_embeddings de ON d.id = de.document_id
            WHERE d.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    // ============================================================
    // CRÉE UN DOCUMENT (AVEC APPEL À L'API NODE.JS)
    // ============================================================
    public function create($data) {
        // Utilise la constante API_URL définie dans config.php
        $result = $this->callNodeAPI('/documents/rag', 'POST', [
            'titre' => $data['title'],
            'contenu' => $data['content'],
            'type_projet' => $data['type_projet'],
            'secteur' => $data['secteur'] ?? null,
            'mots_cles' => $data['mots_cles'] ?? []
        ]);
        
        if ($result['success']) {
            return $result['data']['data']['documentId'];
        }
        
        throw new Exception($result['message'] ?? 'Erreur indexation');
    }
    
    // ============================================================
    // RECHERCHE SÉMANTIQUE VIA L'API NODE.JS
    // ============================================================
    public function search($query, $type_projet = null, $limit = 5) {
        $result = $this->callNodeAPI('/rag/search', 'POST', [
            'query' => $query,
            'type_projet' => $type_projet,
            'limit' => $limit
        ]);
        
        if ($result['success']) {
            return $result['data'];
        }
        
        return [];
    }
    
    // ============================================================
    // APPEL À L'API NODE.JS
    // ============================================================
    private function callNodeAPI($endpoint, $method = 'GET', $data = null) {
        // Utilise la constante API_URL définie dans config.php
        $url = API_URL . $endpoint;
        $ch = curl_init($url);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'message' => 'Erreur cURL: ' . $error
            ];
        }
        
        return [
            'success' => $httpCode >= 200 && $httpCode < 300,
            'data' => json_decode($response, true),
            'http_code' => $httpCode
        ];
    }
    
    // ============================================================
    // STATISTIQUES POUR LE DASHBOARD
    // ============================================================
    public function getStats(): array {
        // Nombre total de documents actifs
        $total = $this->db->query(
            "SELECT COUNT(*) FROM documents WHERE actif = TRUE"
        )->fetchColumn();

        // Documents par type de projet
        $parType = $this->db->query(
            "SELECT type_projet, COUNT(*) as total
             FROM documents
             WHERE actif = TRUE
             GROUP BY type_projet
             ORDER BY total DESC"
        )->fetchAll();

        // Documents ajoutés ce mois-ci
        $ceMois = $this->db->query(
            "SELECT COUNT(*) FROM documents
             WHERE actif = TRUE
             AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
             AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())"
        )->fetchColumn();

        return [
            'total'      => (int)$total,
            'par_type'   => $parType,
            'ce_mois'    => (int)$ceMois
        ];
    }
    
    // 
    // SUPPRIME UN DOCUMENT (SOFT DELETE)
    // 
    public function delete($id) {
        $stmt = $this->db->prepare("
            UPDATE documents SET actif = false, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        return $stmt->execute([$id]);
    }
    
    // 
    // MET À JOUR UN DOCUMENT
    // 
    public function update($id, $data) {
        $fields = [];
        $params = [];
        
        if (isset($data['title'])) {
            $fields[] = "title = ?";
            $params[] = $data['title'];
        }
        if (isset($data['type_projet'])) {
            $fields[] = "type_projet = ?";
            $params[] = $data['type_projet'];
        }
        if (isset($data['secteur'])) {
            $fields[] = "secteur = ?";
            $params[] = $data['secteur'];
        }
        if (isset($data['mots_cles'])) {
            $fields[] = "mots_cles = ?";
            $params[] = json_encode($data['mots_cles']);
        }
        
        if (empty($fields)) return false;
        
        $params[] = $id;
        $sql = "UPDATE documents SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}