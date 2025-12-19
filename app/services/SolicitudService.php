<?php
class SolicitudService {
    private $model;
    public function __construct(){ $this->model = new SolicitudModel(); }
    public function create($data){
        // data debe contener: user_id, zone_id, event_date, duration_hours, justification, description
        return $this->model->create($data);
    }
    public function listByUser($userId){
        return $this->model->findByUser($userId);
    }
    public function get($id){
        return $this->model->find($id);
    }
    public function adminList(){ return $this->model->all(); }
    public function adminAction($id,$action,$comment=null){
        $map = ['accept'=>'accepted','reject'=>'rejected','question'=>'questioned'];
        if(!isset($map[$action])) return false;
        return $this->model->updateStatus($id, $map[$action], $comment);
    }
    public function userReply($id,$userId,$comment){
        // verify ownership
        $s = $this->model->find($id);
        if(!$s) return ['error'=>'Not found'];
        if($s['user_id'] != $userId) return ['error'=>'Forbidden'];
        if($s['status'] !== 'questioned') return ['error'=>'Not in questioned state'];
        $ok = $this->model->addUserReply($id,$comment);
        return $ok ? ['ok'=>true] : ['error'=>'Failed to save reply'];
    }
    public function delete($id){
        return $this->model->delete($id);
    }
    public function getStats(){
        return $this->model->getStats();
    }
}
