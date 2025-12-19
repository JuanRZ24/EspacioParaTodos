<?php
class ReviewModel {
    private $pdo;
    public function __construct(){ $this->pdo = Database::getConnection(); }

    public function create($userId, $zoneId, $solicitudId, $rating, $comment){
        $stmt = $this->pdo->prepare('INSERT INTO reviews (user_id, zone_id, solicitud_id, rating, comment) VALUES (:u, :z, :s, :r, :c)');
        $stmt->execute([':u'=>$userId, ':z'=>$zoneId, ':s'=>$solicitudId, ':r'=>$rating, ':c'=>$comment]);
        return $this->pdo->lastInsertId();
    }

    public function exists($solicitudId){
        $stmt = $this->pdo->prepare('SELECT id FROM reviews WHERE solicitud_id = :s');
        $stmt->execute([':s'=>$solicitudId]);
        return $stmt->fetch();
    }

    public function getByZone($zoneId){
        $stmt = $this->pdo->prepare('
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.zone_id = :z 
            ORDER BY r.created_at DESC
        ');
        $stmt->execute([':z'=>$zoneId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAverageRating($zoneId){
        $stmt = $this->pdo->prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE zone_id = :z');
        $stmt->execute([':z'=>$zoneId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
