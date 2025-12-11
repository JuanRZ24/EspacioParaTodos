<?php
// Migration: add user_comment column to solicitudes if missing
error_reporting(E_ALL);
ini_set('display_errors',1);

$cfg = require __DIR__ . '/../app/config/database.php';
try{
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
}catch(PDOException $e){
    echo "DB connect error: " . $e->getMessage();
    exit;
}

$stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = "solicitudes" AND COLUMN_NAME = "user_comment"');
$stmt->execute([':db'=>$cfg['dbname']]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if($row && intval($row['cnt']) === 0){
    try{
        $pdo->exec('ALTER TABLE solicitudes ADD COLUMN user_comment TEXT DEFAULT NULL');
        echo "Added column user_comment\n";
    }catch(PDOException $e){
        echo "Error adding column: " . $e->getMessage();
    }
}else{
    echo "Column user_comment already exists\n";
}

echo "Done.\n";

?>
