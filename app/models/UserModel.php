<?php
class UserModel {
    private $pdo;
    public function __construct(){ $this->pdo = Database::getConnection(); }
    public function create($name,$email,$passwordHash,$curp,$address,$phone,$role='user'){
        $stmt = $this->pdo->prepare('INSERT INTO users (name,email,password,curp,address,phone,role) VALUES (:n,:e,:p,:c,:a,:ph,:r)');
        $stmt->execute([':n'=>$name,':e'=>$email,':p'=>$passwordHash,':c'=>$curp,':a'=>$address,':ph'=>$phone,':r'=>$role]);
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
        $stmt = $this->pdo->prepare('SELECT id,name,email,role,phone,curp,address,created_at FROM users WHERE id = :id');
        $stmt->execute([':id'=>$id]);
        return $stmt->fetch();
    }
    public function update($id, $name, $phone, $address, $password=null){
        if($password){
            $stmt = $this->pdo->prepare('UPDATE users SET name=:n, phone=:ph, address=:a, password=:p WHERE id=:id');
            return $stmt->execute([':n'=>$name, ':ph'=>$phone, ':a'=>$address, ':p'=>$password, ':id'=>$id]);
        } else {
            $stmt = $this->pdo->prepare('UPDATE users SET name=:n, phone=:ph, address=:a WHERE id=:id');
            return $stmt->execute([':n'=>$name, ':ph'=>$phone, ':a'=>$address, ':id'=>$id]);
        }
    }

    public function getAll(){
        $stmt = $this->pdo->query('SELECT id, name, email, role, active, created_at FROM users ORDER BY created_at DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function toggleActive($id, $status){
        $stmt = $this->pdo->prepare('UPDATE users SET active = :s WHERE id = :id');
        return $stmt->execute([':s'=>$status, ':id'=>$id]);
    }
}
