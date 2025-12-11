<?php
class UserService {
    private $model;
    public function __construct(){ $this->model = new UserModel(); }
    public function register($name,$email,$password){
        if($this->model->findByEmail($email)) return ['error'=>'Email already exists'];
        $hash = hash_password($password);
        $id = $this->model->create($name,$email,$hash);
        return ['id'=>$id];
    }
    public function login($email,$password){
        $user = $this->model->findByEmail($email);
        if(!$user) return ['error'=>'Invalid credentials'];
        if(!verify_password($password, $user['password'])) return ['error'=>'Invalid credentials'];
        $token = generate_token();
        $this->model->setToken($user['id'],$token);
        return ['token'=>$token,'user'=>['id'=>$user['id'],'name'=>$user['name'],'email'=>$user['email'],'role'=>$user['role']]];
    }
}
