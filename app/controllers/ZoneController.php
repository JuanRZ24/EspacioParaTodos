<?php
class ZoneController extends Controller {
    public function index($request,$response){
        $model = new ZoneModel();
        $zones = $model->all();
        return $response->json(['data'=>$zones]);
    }
    public function store($request, $response){
        $user = $this->authUserFromRequest($request);
        if(!$user || $user['role'] !== 'admin') return $response->json(['error'=>'Unauthorized'],401);

        $data = $request->all();
        if(empty($data['name']) || empty($data['description'])) {
            return $response->json(['error'=>'Name and description are required'], 400);
        }

        $lat = $data['lat'] ?? null;
        $lng = $data['lng'] ?? null;
        $city = $data['city'] ?? null;

        $model = new ZoneModel();
        $id = $model->create($data['name'], $data['description'], $data['image_url'] ?? null, $lat, $lng, $city);
        return $response->json(['message'=>'Zone created', 'id'=>$id]);
    }
}
