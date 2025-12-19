<?php
class ReviewController extends Controller {
    public function store($request, $response){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);

        $data = $request->all();
        $solicitudId = $data['solicitud_id'] ?? null;
        $rating = $data['rating'] ?? null;
        $comment = $data['comment'] ?? null;

        if(!$solicitudId || !$rating) return $response->json(['error'=>'Missing required fields'],400);

        // Verify solicitud exists and belongs to user
        $solModel = new SolicitudModel();
        $sol = $solModel->getById($solicitudId);
        
        if(!$sol) return $response->json(['error'=>'Solicitud not found'],404);
        if($sol['user_id'] != $user['id']) return $response->json(['error'=>'Unauthorized'],403);
        if($sol['status'] !== 'accepted') return $response->json(['error'=>'Only accepted requests can be reviewed'],400);
        
        // Check if already reviewed
        $model = new ReviewModel();
        if($model->exists($solicitudId)) return $response->json(['error'=>'Already reviewed'],400);

        $id = $model->create($user['id'], $sol['zone_id'], $solicitudId, $rating, $comment);
        return $response->json(['message'=>'Review saved', 'id'=>$id]);
    }

    public function index($request, $response){
        $zoneId = $_GET['zone_id'] ?? null;
        if(!$zoneId) return $response->json(['error'=>'Zone ID required'],400);

        $model = new ReviewModel();
        $reviews = $model->getByZone($zoneId);
        $rating = $model->getAverageRating($zoneId);

        return $response->json(['data'=>$reviews, 'meta'=>$rating]);
    }
}
