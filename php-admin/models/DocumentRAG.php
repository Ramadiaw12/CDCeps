<?php
// ============================================================
// models/DocumentRAG.php
// Modèle pour la gestion des documents RAG
// 




require_once __DIR__ . '/../config/database.php';

class DocumentRAG {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Liste tous les documents RAG
     */
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
    
    /**
     * Récupère un document par son ID
     */
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
    
    /**
     * Crée un document (avec appel à l'API Node.js)
     */
    public function create($data) {
        // Envoyer à l'API Node.js pour l'indexation
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
    
    /**
     * Recherche sémantique via l'API Node.js
     */
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
    
    /**
     * Appel à l'API Node.js
     */
    private function callNodeAPI($endpoint, $method = 'GET', $data = null) {
        $url = API_URL . $endpoint;
        $ch = curl_init($url);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'success' => $httpCode >= 200 && $httpCode < 300,
            'data' => json_decode($response, true),
            'http_code' => $httpCode
        ];
    }
    
    /**
     * Supprime un document (soft delete)
     */
    public function delete($id) {
        $stmt = $this->db->prepare("
            UPDATE documents SET actif = false, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        return $stmt->execute([$id]);
    }
    
    /**
     * Met à jour un document
     */
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