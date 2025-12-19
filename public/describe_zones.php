<?php
require_once __DIR__ . '/../app/core/Database.php';

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query("DESCRIBE zones");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($columns);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
