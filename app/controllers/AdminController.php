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
}
