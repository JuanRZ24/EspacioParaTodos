<?php
$cfg = require __DIR__ . '/../app/config/database.php';
try{
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $stmt = $pdo->query('SELECT id,user_id,zone_id,event_date,status,admin_comment,user_comment FROM solicitudes ORDER BY id DESC LIMIT 10');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode(['rows'=>$rows], JSON_PRETTY_PRINT);
}catch(Exception $e){ header('Content-Type: application/json'); echo json_encode(['error'=>$e->getMessage()]); }