<?php
class ZoneModel {
    private $pdo;
    public function __construct(){ $this->pdo = Database::getConnection(); }
    public function all(){
        $stmt = $this->pdo->query('
            SELECT z.*, 
            (SELECT AVG(rating) FROM reviews r WHERE r.zone_id = z.id) as avg_rating 
            FROM zones z 
            ORDER BY z.created_at DESC
        ');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function find($id){
        $stmt = $this->pdo->prepare('SELECT * FROM zones WHERE id = :id');
        $stmt->execute([':id'=>$id]);
        return $stmt->fetch();
    }
    public function create($name, $description, $image_url = null, $lat = null, $lng = null, $city = null){
        $stmt = $this->pdo->prepare('INSERT INTO zones (name, description, image_url, lat, lng, city) VALUES (:name, :description, :image_url, :lat, :lng, :city)');
        $stmt->execute([':name'=>$name, ':description'=>$description, ':image_url'=>$image_url, ':lat'=>$lat, ':lng'=>$lng, ':city'=>$city]);
        return $this->pdo->lastInsertId();
    }
}
