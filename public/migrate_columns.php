<?php
// Script de migración: añade columnas faltantes a la tabla `solicitudes` si no existen
// Úsalo desde el navegador: http://localhost/proyecto4/public/migrate_columns.php

error_reporting(E_ALL);
ini_set('display_errors',1);

$cfg = require __DIR__ . '/../app/config/database.php';
try{
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
}catch(PDOException $e){
    echo "Error connecting DB: " . $e->getMessage();
    exit;
}

$columnsNeeded = [
    'event_start_time' => "TIME DEFAULT NULL",
    'event_end_time' => "TIME DEFAULT NULL",
    'user_comment' => "TEXT DEFAULT NULL",
    // ensure description is TEXT NOT NULL (if currently nullable)
];

$report = [];

foreach($columnsNeeded as $col => $definition){
    $stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = "solicitudes" AND COLUMN_NAME = :col');
    $stmt->execute([':db'=>$cfg['dbname'], ':col'=>$col]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if($row && intval($row['cnt']) > 0){
        $report[$col] = 'exists';
        continue;
    }
    try{
        $sql = "ALTER TABLE solicitudes ADD COLUMN $col {$definition}";
        $pdo->exec($sql);
        $report[$col] = 'added';
    }catch(PDOException $e){
        $report[$col] = 'error: ' . $e->getMessage();
    }
}

// Ensure description is NOT NULL
try{
    $stmt = $pdo->prepare('SELECT IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = "solicitudes" AND COLUMN_NAME = "description"');
    $stmt->execute([':db'=>$cfg['dbname']]);
    $col = $stmt->fetch(PDO::FETCH_ASSOC);
    if($col){
        if(strtoupper($col['IS_NULLABLE']) === 'YES'){
            // alter to set NOT NULL
            $pdo->exec('ALTER TABLE solicitudes MODIFY COLUMN description TEXT NOT NULL');
            $report['description'] = 'modified to NOT NULL';
        }else{
            $report['description'] = 'ok (NOT NULL)';
        }
    }else{
        $report['description'] = 'column not found';
    }
}catch(PDOException $e){
    $report['description'] = 'error: '.$e->getMessage();
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status'=>'done', 'report'=>$report], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
