<?php
require_once __DIR__ . '/../app/core/Database.php';

try {
    $pdo = Database::getConnection();
    
    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM zones LIKE 'image_url'");
    $col = $stmt->fetch();
    
    if(!$col){
        echo "Adding image_url column to zones table...\n";
        $pdo->exec("ALTER TABLE zones ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER description");
        echo "Column added successfully.\n";
    } else {
        echo "Column image_url already exists.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
