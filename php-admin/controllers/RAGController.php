<?php
// ============================================================
// controllers/RAGController.php
// Contrôleur pour la gestion des documents RAG
// Permet d'ajouter, activer/désactiver et supprimer
// des documents de la base RAG via l'API Node.js
// 



require_once __DIR__ . '/../models/DocumentRAG.php';

class RAGController {
    private $documentModel;
    
    public function __construct() {
        $this->documentModel = new DocumentRAG();
    }
    
    /**
     * Affiche la page de gestion des documents RAG
     */
    public function index() {
        $documents = $this->documentModel->getAll();
        $types = $this->getTypesProjet();
        
        include __DIR__ . '/../views/rag.php';
    }
    
    /**
     * API : Liste des documents (JSON)
     */
    public function list() {
        header('Content-Type: application/json');
        $documents = $this->documentModel->getAll();
        echo json_encode(['success' => true, 'data' => $documents]);
        exit;
    }
    
    /**
     * API : Upload d'un PDF
     */
    public function upload() {
        header('Content-Type: application/json');
        
        try {
            // Vérifier le fichier
            if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('Erreur upload du PDF');
            }
            
            $file = $_FILES['pdf'];
            $type_projet = $_POST['type_projet'] ?? 'general';
            
            // Lire le PDF avec pdftotext
            $content = $this->extractPDFText($file['tmp_name']);
            $titre = pathinfo($file['name'], PATHINFO_FILENAME);
            
            // Créer le document
            $documentId = $this->documentModel->create([
                'title' => $titre,
                'content' => $content,
                'type_projet' => $type_projet,
                'secteur' => $_POST['secteur'] ?? null,
                'mots_cles' => isset($_POST['mots_cles']) ? explode(',', $_POST['mots_cles']) : []
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Document indexé avec succès',
                'data' => ['documentId' => $documentId]
            ]);
            
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * API : Recherche sémantique
     */
    public function search() {
        header('Content-Type: application/json');
        
        $query = $_GET['query'] ?? '';
        $type_projet = $_GET['type_projet'] ?? null;
        $limit = $_GET['limit'] ?? 5;
        
        if (empty($query)) {
            echo json_encode(['success' => false, 'message' => 'Requête vide']);
            exit;
        }
        
        $results = $this->documentModel->search($query, $type_projet, $limit);
        echo json_encode(['success' => true, 'data' => $results]);
    }
    
    /**
     * API : Suppression d'un document
     */
    public function delete($id) {
        header('Content-Type: application/json');
        
        $result = $this->documentModel->delete($id);
        echo json_encode([
            'success' => $result,
            'message' => $result ? 'Document supprimé' : 'Erreur suppression'
        ]);
    }
    
    /**
     * Extrait le texte d'un PDF
     */
    private function extractPDFText($pdfPath) {
        // Utiliser pdftotext (Linux)
        $output = shell_exec("pdftotext '{$pdfPath}' - 2>/dev/null");
        
        if ($output) {
            return $output;
        }
        
        // Fallback : utilise une librairie PHP
        // require_once __DIR__ . '/../vendor/autoload.php';
        // $parser = new \Smalot\PdfParser\Parser();
        // $pdf = $parser->parseFile($pdfPath);
        // return $pdf->getText();
        
        throw new Exception('Impossible d\'extraire le texte du PDF. Installez pdftotext.');
    }
    
    /**
     * Récupère les types de projet disponibles
     */
    private function getTypesProjet() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT DISTINCT type_projet 
            FROM documents 
            WHERE type_projet IS NOT NULL AND type_projet != ''
            ORDER BY type_projet
        ");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}