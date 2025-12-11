<?php
class AuthController extends Controller {
    public function register($request,$response){
        $data = $request->all();
        $name = $data['name'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        if(!$name || !$email || !$password) return $response->json(['error'=>'Missing fields'],400);
        $service = new UserService();
        $res = $service->register($name,$email,$password);
        if(isset($res['error'])) return $response->json($res,400);
        return $response->json(['message'=>'User created','id'=>$res['id']]);
    }
    public function login($request,$response){
        $data = $request->all();
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        if(!$email || !$password) return $response->json(['error'=>'Missing fields'],400);
        $service = new UserService();
        $res = $service->login($email,$password);
        if(isset($res['error'])) return $response->json($res,401);
        return $response->json($res);
    }
}
