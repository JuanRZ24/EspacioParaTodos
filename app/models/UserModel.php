<?php
class UserModel {
    private $pdo;
    public function __construct(){ $this->pdo = Database::getConnection(); }
    public function create($name,$email,$passwordHash,$role='user'){
        $stmt = $this->pdo->prepare('INSERT INTO users (name,email,password,role) VALUES (:n,:e,:p,:r)');
        $stmt->execute([':n'=>$name,':e'=>$email,':p'=>$passwordHash,':r'=>$role]);
        return $this->pdo->lastInsertId();
    }
    public function findByEmail($email){
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = :e');
        $stmt->execute([':e'=>$email]);
        return $stmt->fetch();
    }
    public function findByToken($token){
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE token = :t');
        $stmt->execute([':t'=>$token]);
        return $stmt->fetch();
    }
    public function setToken($userId,$token){
        $stmt = $this->pdo->prepare('UPDATE users SET token = :t WHERE id = :id');
        return $stmt->execute([':t'=>$token,':id'=>$userId]);
    }
    public function getById($id){
        $stmt = $this->pdo->prepare('SELECT id,name,email,role,created_at FROM users WHERE id = :id');
        $stmt->execute([':id'=>$id]);
        return $stmt->fetch();
    }
}
