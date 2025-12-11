<?php
class SolicitudModel {
    private $pdo;
    public function __construct(){ $this->pdo = Database::getConnection(); }
    public function create($data){
        $stmt = $this->pdo->prepare('INSERT INTO solicitudes (user_id,zone_id,event_date,event_start_time,event_end_time,duration_hours,justification,description) VALUES (:u,:z,:d,:st,:et,:dur,:j,:desc)');
        $stmt->execute([
            ':u'=>$data['user_id'],':z'=>$data['zone_id'],':d'=>$data['event_date'],':st'=>$data['start_time'],':et'=>$data['end_time'],':dur'=>$data['duration_hours'],':j'=>$data['justification'],':desc'=>$data['description']
        ]);
        return $this->pdo->lastInsertId();
    }
    public function findByUser($userId){
        $stmt = $this->pdo->prepare('SELECT s.*, z.name AS zone_name, s.user_comment FROM solicitudes s JOIN zones z ON s.zone_id = z.id WHERE s.user_id = :u ORDER BY s.created_at DESC');
        $stmt->execute([':u'=>$userId]);
        return $stmt->fetchAll();
    }
    public function find($id){
        $stmt = $this->pdo->prepare('SELECT s.*, z.name AS zone_name, u.name AS user_name, u.email, s.user_comment FROM solicitudes s JOIN zones z ON s.zone_id=z.id JOIN users u ON s.user_id=u.id WHERE s.id = :id');
        $stmt->execute([':id'=>$id]);
        return $stmt->fetch();
    }
    public function all(){
        $stmt = $this->pdo->query('SELECT s.*, z.name AS zone_name, u.name AS user_name, u.email, s.user_comment FROM solicitudes s JOIN zones z ON s.zone_id=z.id JOIN users u ON s.user_id=u.id ORDER BY s.created_at DESC');
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
}
