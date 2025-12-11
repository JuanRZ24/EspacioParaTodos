<?php
// Test script para verificar la API
header('Content-Type: application/json');

$cfg = require __DIR__ . '/../app/config/database.php';

try {
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo json_encode(['db' => 'OK']);
} catch (Exception $e) {
    echo json_encode(['db' => 'ERROR', 'message' => $e->getMessage()]);
    exit;
}