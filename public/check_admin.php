<?php
$cfg = require __DIR__ . '/../app/config/database.php';

try {
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $stmt = $pdo->query('SELECT id, email, password FROM users WHERE role = "admin"');
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    header('Content-Type: application/json');
    if($admin){
        echo json_encode([
            'id' => $admin['id'],
            'email' => $admin['email'],
            'password_hash' => $admin['password']
        ]);
    } else {
        echo json_encode(['error' => 'No admin found']);
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}