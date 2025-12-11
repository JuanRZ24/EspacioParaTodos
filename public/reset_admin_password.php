<?php
require_once __DIR__ . '/../app/helpers/helpers.php';
require_once __DIR__ . '/../app/config/database.php';

$cfg = require __DIR__ . '/../app/config/database.php';

try {
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Generar una nueva contraseña para el admin
    $new_password = 'admin123';
    $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Actualizar el admin
    $stmt = $pdo->prepare('UPDATE users SET password = :p WHERE email = :e AND role = :r');
    $stmt->execute([
        ':p' => $new_hash,
        ':e' => 'admin@example.com',
        ':r' => 'admin'
    ]);
    
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'Admin password reset successfully',
        'email' => 'admin@example.com',
        'password' => $new_password,
        'warning' => 'Cambia esta contraseña después de hacer login'
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}