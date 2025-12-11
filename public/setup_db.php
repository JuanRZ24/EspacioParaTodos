<?php
// Setup DB by executing db.sql using credentials in app/config/database.php
error_reporting(E_ALL);
ini_set('display_errors',1);

$cfg = require __DIR__ . '/../app/config/database.php';

try{
    // Connect without selecting a database so we can create it if missing
    $dsn = "mysql:host={$cfg['host']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
}catch(PDOException $e){
    echo "Could not connect to MySQL: " . $e->getMessage();
    exit;
}

$sqlFile = __DIR__ . '/../db.sql';
if(!file_exists($sqlFile)){
    echo "SQL file not found at $sqlFile";
    exit;
}

$sql = file_get_contents($sqlFile);
// Simple split by semicolon. db.sql is simple so this is sufficient here.
$parts = array_filter(array_map('trim', explode(';', $sql)));

$executed = 0;
foreach($parts as $part){
    if($part === '') continue;
    try{
        $pdo->exec($part);
        $executed++;
    }catch(PDOException $e){
        echo "Error executing statement: " . PHP_EOL . htmlspecialchars($part) . PHP_EOL;
        echo "Message: " . $e->getMessage() . PHP_EOL . "<br>\n";
    }
}

echo "Done. Executed $executed statements.\n";
echo "You can now run db_test.php to verify the connection.\n";
echo "<br><br><strong>Siguiente paso: <a href='setup_admin.php'>Configurar credenciales del administrador</a></strong>\n";

// Ensure new columns exist if DB already existed
try{
    $pdo->exec("ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS event_start_time TIME DEFAULT NULL");
    $pdo->exec("ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS event_end_time TIME DEFAULT NULL");
    $pdo->exec("ALTER TABLE solicitudes MODIFY COLUMN description TEXT NOT NULL");
}catch(PDOException $e){
    // ignore alter errors
}
