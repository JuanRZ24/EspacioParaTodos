<?php
// Front controller simple
require_once __DIR__ . '/../app/helpers/helpers.php';
require_once __DIR__ . '/../app/config/database.php';
require_once __DIR__ . '/../app/core/Database.php';
require_once __DIR__ . '/../app/core/Request.php';
require_once __DIR__ . '/../app/core/Response.php';
require_once __DIR__ . '/../app/core/Controller.php';

// Autoload models, services and controllers
spl_autoload_register(function($class){
    $paths = [__DIR__ . '/../app/models/', __DIR__ . '/../app/services/', __DIR__ . '/../app/controllers/'];
    foreach($paths as $p){
        $file = $p . $class . '.php';
        if(file_exists($file)) require_once $file;
    }
});

$request = new Request();
$response = new Response();

$path = $request->getPath();
$method = $request->getMethod();

// Simple routing
if($path === '/api/register' && $method === 'POST'){
    $c = new AuthController();
    $c->register($request, $response);
    exit;
}

if($path === '/api/login' && $method === 'POST'){
    $c = new AuthController();
    $c->login($request, $response);
    exit;
}

if($path === '/api/zones'){
    $c = new ZoneController();
    if($method === 'GET') $c->index($request, $response);
    if($method === 'POST') $c->store($request, $response);
    exit;
}

if(str_starts_with($path, '/api/solicitudes')){
    $c = new SolicitudController();
    
    // /api/solicitudes/accepted
    if($path === '/api/solicitudes/accepted' && $method === 'GET'){
        $c->accepted($request, $response);
        exit;
    }

    // /api/solicitudes or /api/solicitudes/{id}
    $parts = explode('/', trim($path,'/'));
    if(count($parts) === 2){
        if($method === 'GET') $c->index($request, $response);
        if($method === 'POST') $c->create($request, $response);
        exit;
    }
    if(count($parts) === 3){
        $id = intval($parts[2]);
        if($method === 'GET') $c->show($request, $response, $id);
        if($method === 'DELETE') $c->delete($request, $response, $id);
        exit;
    }
    // /api/solicitudes/{id}/reply
    if(count($parts) === 4 && $parts[3] === 'reply' && $method === 'POST'){
        $id = intval($parts[2]);
        $c->reply($request, $response, $id);
        exit;
    }
}

if(str_starts_with($path, '/api/admin/solicitudes')){
    $parts = explode('/', trim($path,'/'));
    $admin = new AdminController();
    if(count($parts) === 3 && $_SERVER['REQUEST_METHOD'] === 'GET'){
        $admin->index($request, $response);
        exit;
    }
    if(count($parts) === 5 && $parts[4] === 'action' && $method === 'POST'){
        $id = intval($parts[3]);
        $admin->action($request, $response, $id);
        exit;
    }
}

$response->json(['error'=>'Route not found'], 404);
