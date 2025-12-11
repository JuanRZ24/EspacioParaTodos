<?php
class ZoneModel {
    private $pdo;
    public function __construct(){ $this->pdo = Database::getConnection(); }
    public function all(){
        $stmt = $this->pdo->query('SELECT * FROM zones');
        return $stmt->fetchAll();
    }
    public function find($id){
        $stmt = $this->pdo->prepare('SELECT * FROM zones WHERE id = :id');
        $stmt->execute([':id'=>$id]);
        return $stmt->fetch();
    }
    public function create($name, $description){
        $stmt = $this->pdo->prepare('INSERT INTO zones (name, description) VALUES (:name, :description)');
        $stmt->execute([':name'=>$name, ':description'=>$description]);
        return $this->pdo->lastInsertId();
    }
}
