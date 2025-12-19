<?php
class SolicitudModel {
    private $pdo;
    public function __construct(){ $this->pdo = Database::getConnection(); }
    public function create($data) {
        $stmt = $this->pdo->prepare("INSERT INTO solicitudes (user_id, zone_id, custom_zone, event_date, event_start_time, event_end_time, duration_hours, justification, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['user_id'],
            $data['zone_id'] ?: null, // Allow null
            $data['custom_zone'] ?? null,
            $data['event_date'],
            $data['event_start_time'],
            $data['event_end_time'],
            $data['duration_hours'],
            $data['justification'],
            $data['description']
        ]);
        return $this->pdo->lastInsertId();
    }
    public function findByUser($userId){
        $stmt = $this->pdo->prepare('SELECT s.*, z.name AS zone_name, s.user_comment FROM solicitudes s LEFT JOIN zones z ON s.zone_id = z.id WHERE s.user_id = :u ORDER BY s.created_at DESC');
        $stmt->execute([':u'=>$userId]);
        return $stmt->fetchAll();
    }
    public function find($id){
        $stmt = $this->pdo->prepare('SELECT s.*, z.name AS zone_name, u.name AS user_name, u.email, s.user_comment FROM solicitudes s LEFT JOIN zones z ON s.zone_id=z.id JOIN users u ON s.user_id=u.id WHERE s.id = :id');
        $stmt->execute([':id'=>$id]);
        return $stmt->fetch();
    }
    public function all(){
        $stmt = $this->pdo->query('SELECT s.*, z.name AS zone_name, u.name AS user_name, u.email, s.user_comment FROM solicitudes s LEFT JOIN zones z ON s.zone_id=z.id JOIN users u ON s.user_id=u.id ORDER BY s.created_at DESC');
        return $stmt->fetchAll();
    }
    public function updateStatus($id,$status,$admin_comment=null){
        $stmt = $this->pdo->prepare('UPDATE solicitudes SET status = :st, admin_comment = :c WHERE id = :id');
        return $stmt->execute([':st'=>$status,':c'=>$admin_comment,':id'=>$id]);
    }
    public function addUserReply($id,$comment){
        $stmt = $this->pdo->prepare('UPDATE solicitudes SET user_comment = :c, status = "pending" WHERE id = :id');
        return $stmt->execute([':c'=>$comment,':id'=>$id]);
    }
    public function delete($id){
        $stmt = $this->pdo->prepare('DELETE FROM solicitudes WHERE id = :id');
        return $stmt->execute([':id'=>$id]);
    }
    public function getAccepted($zoneId = null){
        $sql = 'SELECT event_date, event_start_time, event_end_time, zone_id FROM solicitudes WHERE status = "accepted" AND event_date >= CURDATE()';
        $params = [];
        if($zoneId){
            $sql .= ' AND zone_id = :z';
            $params[':z'] = $zoneId;
        }
        $sql .= ' ORDER BY event_date ASC, event_start_time ASC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getStats() {
        // Status Distribution
        $status = $this->pdo->query('SELECT status, COUNT(*) as count FROM solicitudes GROUP BY status')->fetchAll();
        
        // Popular Zones
        $zones = $this->pdo->query('SELECT z.name, COUNT(*) as count FROM solicitudes s JOIN zones z ON s.zone_id = z.id GROUP BY z.name ORDER BY count DESC LIMIT 5')->fetchAll();
        
        // Monthly Trends (Last 6 months) - simplified for mysql compatibility
        $trends = $this->pdo->query('SELECT DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count FROM solicitudes GROUP BY month ORDER BY month DESC LIMIT 6')->fetchAll();

        return [
            'status_counts' => $status,
            'popular_zones' => $zones,
            'monthly_trends' => $trends
        ];
    }
}
