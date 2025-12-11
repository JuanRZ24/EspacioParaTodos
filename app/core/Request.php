<?php
class Request {
    private $body;
    public function __construct(){
        $raw = file_get_contents('php://input');
        $this->body = json_decode($raw, true);
        // Si no es JSON válido, intentar con $_POST
        if($this->body === null){
            $this->body = $_POST;
        }
        // Si aún está vacío, es un error
        if(!is_array($this->body)){
            $this->body = [];
        }
    }
    public function input($key, $default=null){
        return $this->body[$key] ?? $default;
    }
    public function all(){ return $this->body; }
    public function getPath(){
        $u = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Normalizar para devolver la parte a partir de /api/... o lo que sigue a index.php
        // Buscar '/index.php' y recortar todo lo anterior
        $indexPos = strpos($u, '/index.php');
        if($indexPos !== false){
            $u = substr($u, $indexPos + strlen('/index.php'));
            if($u === '') $u = '/';
            return $u;
        }
        // Si la URL contiene /api/ en cualquier parte, extraer desde allí
        $apiPos = strpos($u, '/api/');
        if($apiPos !== false){
            return substr($u, $apiPos);
        }
        // Devolver ruta normal por defecto
        return $u;
    }
    public function getMethod(){ return $_SERVER['REQUEST_METHOD']; }
    public function header($key){
        if(function_exists('getallheaders')){
            $h = getallheaders();
        }else{
            // Polyfill: collect HTTP_ headers from $_SERVER
            $h = [];
            foreach($_SERVER as $k=>$v){
                if(str_starts_with($k,'HTTP_')){
                    $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_',' ',$k))));
                    $h[$name] = $v;
                }
            }
        }
        // Try direct key or case-insensitive
        if(isset($h[$key])) return $h[$key];
        $lk = strtolower($key);
        foreach($h as $hk=>$hv) if(strtolower($hk) === $lk) return $hv;
        return null;
    }
}