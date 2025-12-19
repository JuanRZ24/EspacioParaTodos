<?php
class SolicitudController extends Controller {
    public function index($request,$response){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);
        $service = new SolicitudService();
        $rows = $service->listByUser($user['id']);
        return $response->json(['data'=>$rows]);
    }
    public function create($request,$response){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);
        $data = $request->all();
        $required = ['event_date','start_time','end_time','justification','description'];
        foreach($required as $r) if(!isset($data[$r]) || $data[$r] === '') return $response->json(['error'=>"Missing $r"],400);

       
        if((!isset($data['zone_id']) || $data['zone_id'] === '') && (!isset($data['custom_zone']) || trim($data['custom_zone']) === '')){
             return $response->json(['error'=>'Must specify a zone or custom zone'],400);
        }

        
        $today = new DateTimeImmutable('today');
        $eventDate = DateTimeImmutable::createFromFormat('Y-m-d', $data['event_date']);
        if(!$eventDate) return $response->json(['error'=>'Invalid event_date format, expected YYYY-MM-DD'],400);
        if($eventDate <= $today) return $response->json(['error'=>'event_date must be a future date'],400);

        
        $start = DateTimeImmutable::createFromFormat('H:i', $data['start_time']);
        $end = DateTimeImmutable::createFromFormat('H:i', $data['end_time']);
        if(!$start || !$end) return $response->json(['error'=>'Invalid time format, expected HH:MM'],400);
        if($end <= $start) return $response->json(['error'=>'end_time must be after start_time'],400);

      
        $dtStart = DateTimeImmutable::createFromFormat('Y-m-d H:i', $data['event_date'].' '.$data['start_time']);
        $dtEnd = DateTimeImmutable::createFromFormat('Y-m-d H:i', $data['event_date'].' '.$data['end_time']);
        if(!$dtStart || !$dtEnd) return $response->json(['error'=>'Invalid date/time combination'],400);
        $interval = $dtEnd->getTimestamp() - $dtStart->getTimestamp();
        if($interval <= 0) return $response->json(['error'=>'Invalid interval between start and end'],400);
        $durationHours = (int) ceil($interval / 3600);

        $payload = [
            'user_id'=>$user['id'],
            'zone_id'=>isset($data['zone_id']) && $data['zone_id'] !== '' ? intval($data['zone_id']) : null,
            'custom_zone'=>isset($data['custom_zone']) ? $data['custom_zone'] : null,
            'event_date'=>$data['event_date'],
            'event_start_time'=>$data['start_time'],
            'event_end_time'=>$data['end_time'],
            'duration_hours'=>$durationHours,
            'justification'=>$data['justification'],
            'description'=>$data['description']
        ];
        $service = new SolicitudService();
        $id = $service->create($payload);
        return $response->json(['message'=>'Solicitud creada','id'=>$id]);
    }
    public function show($request,$response,$id){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);
        $service = new SolicitudService();
        $s = $service->get($id);
        if(!$s) return $response->json(['error'=>'Not found'],404);
        if($s['user_id'] != $user['id'] && $user['role'] !== 'admin') return $response->json(['error'=>'Forbidden'],403);
        return $response->json(['data'=>$s]);
    }
    public function delete($request,$response,$id){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);
        $service = new SolicitudService();
        $s = $service->get($id);
        if(!$s) return $response->json(['error'=>'Not found'],404);
        // Solo el propietario o un admin puede eliminar
        if($s['user_id'] != $user['id'] && $user['role'] !== 'admin') return $response->json(['error'=>'Forbidden'],403);
        $ok = $service->delete($id);
        if(!$ok) return $response->json(['error'=>'Delete failed'],500);
        return $response->json(['message'=>'Solicitud eliminada']);
    }

    public function reply($request,$response,$id){
        $user = $this->authUserFromRequest($request);
        if(!$user) return $response->json(['error'=>'Unauthorized'],401);
        $data = $request->all();
        $comment = trim($data['comment'] ?? '');
        if($comment === '') return $response->json(['error'=>'Missing comment'],400);
        $service = new SolicitudService();
        $res = $service->userReply($id, $user['id'], $comment);
        if(isset($res['error'])) return $response->json($res, 400);
        return $response->json(['message'=>'Reply saved']);
    }

    public function accepted($request, $response){
        $zoneId = $_GET['zone_id'] ?? null;
        $model = new SolicitudModel(); // Direct model usage for simplicity in this method
        $data = $model->getAccepted($zoneId);
        return $response->json(['data'=>$data]);
    }
}
