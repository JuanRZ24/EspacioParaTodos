<?php
$cfg = require __DIR__ . '/../app/config/database.php';

try {
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Contar usuarios
    $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM users');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $count = $result['cnt'];
    
    // Listar usuarios
    $stmt = $pdo->query('SELECT id, name, email, role FROM users');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    header('Content-Type: application/json');
    echo json_encode([
        'total_users' => $count,
        'users' => $users
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}