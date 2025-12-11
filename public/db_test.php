<?php
// Test DB connection using app config
error_reporting(E_ALL);
ini_set('display_errors',1);
$cfg = require __DIR__ . '/../app/config/database.php';
$dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
try{
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "DB connection successful.\n";
    $row = $pdo->query('SELECT DATABASE() as db')->fetch();
    echo "Connected to database: " . ($row['db'] ?? 'unknown');
}catch(PDOException $e){
    http_response_code(500);
    echo "DB connection failed:\n";
    echo $e->getMessage();
}
