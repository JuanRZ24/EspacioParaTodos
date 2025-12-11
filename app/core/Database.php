<?php
class Database {
    private static $pdo = null;

    public static function getConnection(){
        if(self::$pdo) return self::$pdo;
        $cfg = require __DIR__ . '/../config/database.php';
        $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
        try{
            self::$pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            return self::$pdo;
        }catch(PDOException $e){
            http_response_code(500);
            echo json_encode(['error'=>'DB connection failed','msg'=>$e->getMessage()]);
            exit;
        }
    }
}
