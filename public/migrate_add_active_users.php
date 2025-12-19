<?php
ini_set('display_errors', 1);
require_once __DIR__ . '/../app/core/Database.php';

try {
    $pdo = Database::getConnection();
    
    // Check if active exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'active'");
    if ($stmt->fetch()) {
        die("Column 'active' already exists.");
    }
    
    // Add active column, default 1 (true)
    $pdo->exec("ALTER TABLE users ADD COLUMN active TINYINT(1) DEFAULT 1 AFTER role");
    
    echo "SUCCESS: active column added to users.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
