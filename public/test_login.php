<?php
header('Content-Type: application/json');

// Cargar el sistema
require_once __DIR__ . '/../app/helpers/helpers.php';
require_once __DIR__ . '/../app/config/database.php';
require_once __DIR__ . '/../app/core/Database.php';
require_once __DIR__ . '/../app/core/Request.php';
require_once __DIR__ . '/../app/core/Response.php';
require_once __DIR__ . '/../app/core/Controller.php';

spl_autoload_register(function($class){
    $paths = [__DIR__ . '/../app/models/', __DIR__ . '/../app/services/', __DIR__ . '/../app/controllers/'];
    foreach($paths as $p){
        $file = $p . $class . '.php';
        if(file_exists($file)) require_once $file;
    }
});

// Simular un request de login
$request = new Request();
$response = new Response();

// Crear datos de prueba
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Simulación: inyectar datos directamente
$request_data = ['email' => 'admin@example.com', 'password' => 'admin123'];

// Intentar login manualmente
$service = new UserService();
$result = $service->login('admin@example.com', 'admin123');

echo json_encode($result);
