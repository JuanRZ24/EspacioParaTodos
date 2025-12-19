<?php
class AuthController extends Controller {
    public function register($request,$response){
        $data = $request->all();
        $name = $data['name'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $curp = $data['curp'] ?? null;
        $address = $data['address'] ?? null;
        $phone = $data['phone'] ?? null;

        if(!$name || !$email || !$password) return $response->json(['error'=>'Missing fields'],400);

        $service = new UserService();
        $res = $service->register($name,$email,$password,$curp,$address,$phone);
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
    public function profile($request,$response){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);
        $service = new UserService();
        $profile = $service->getProfile($user['id']);
        unset($profile['password']); // security
        return $response->json($profile);
    }
    public function updateProfile($request,$response){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);
        $data = $request->all();
        $service = new UserService();
        $ok = $service->updateProfile($user['id'], $data['name'], $data['phone'] ?? null, $data['address'] ?? null, $data['password'] ?? null);
        if(!$ok) return $response->json(['error'=>'Failed to update'],400);
        return $response->json(['message'=>'Profile updated']);
    }
}
