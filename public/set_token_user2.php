<?php
$cfg = require __DIR__ . '/../app/config/database.php';
try{
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $token = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare('UPDATE users SET token = :t WHERE id = :id');
    $stmt->execute([':t'=>$token, ':id'=>2]);
    header('Content-Type: application/json');
    echo json_encode(['token'=>$token]);
}catch(Exception $e){ header('Content-Type: application/json'); echo json_encode(['error'=>$e->getMessage()]); }