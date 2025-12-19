<?php
class AdminController extends Controller {
    public function index($request,$response){
        $user = $this->authUserFromRequest($request);
        if(!$user || $user['role'] !== 'admin') return $response->json(['error'=>'Unauthorized'],401);
        $service = new SolicitudService();
        $rows = $service->adminList();
        return $response->json(['data'=>$rows]);
    }
    public function action($request,$response,$id){
        $user = $this->authUserFromRequest($request);
        if(!$user || $user['role'] !== 'admin') return $response->json(['error'=>'Unauthorized'],401);
        $data = $request->all();
        $action = $data['action'] ?? null; // accept|reject|question
        $comment = $data['comment'] ?? null;
        if(!$action) return $response->json(['error'=>'Missing action'],400);
        $service = new SolicitudService();
        $ok = $service->adminAction($id,$action,$comment);
        if(!$ok) return $response->json(['error'=>'Invalid action or failed'],400);
        return $response->json(['message'=>'Action applied']);
    }

    public function stats($request,$response){
        $user = $this->authUserFromRequest($request);
        if(!$user || $user['role'] !== 'admin') return $response->json(['error'=>'Unauthorized'],401);
        $service = new SolicitudService();
        $data = $service->getStats();
        return $response->json(['data'=>$data]);
    }

    public function getUsers($request, $response){
        $user = $this->authUserFromRequest($request);
        if(!$user || $user['role'] !== 'admin') return $response->json(['error'=>'Unauthorized'],401);
        
        $userModel = new UserModel();
        $users = $userModel->getAll();
        return $response->json(['data'=>$users]);
    }

    public function toggleUser($request, $response, $id){
        $user = $this->authUserFromRequest($request);
        if(!$user || $user['role'] !== 'admin') return $response->json(['error'=>'Unauthorized'],401);

        $data = $request->all();
        $active = isset($data['active']) ? (int)$data['active'] : 1;

        $userModel = new UserModel();
        $userModel->toggleActive($id, $active);
        
        return $response->json(['message'=>'User status updated']);
    }
}
