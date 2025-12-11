<?php
class Response {
    public function json($data, $status=200){
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
    }
}
