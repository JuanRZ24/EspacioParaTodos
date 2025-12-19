<?php
require_once __DIR__ . '/../app/core/Database.php';

// Usage: php reset_admin_password.php <new_password>
// If no password provided, defaults to 'admin123'

$newPass = $argv[1] ?? 'admin123';

try {
    $pdo = Database::getConnection();
    
    // Find admin
    $stmt = $pdo->query("SELECT id, email FROM users WHERE role = 'admin' LIMIT 1");
    $admin = $stmt->fetch();
    
    if (!$admin) {
        die("Error: No admin user found.\n");
    }
    
    // Hash password
    $hash = password_hash($newPass, PASSWORD_DEFAULT);
    
    // Update
    $update = $pdo->prepare("UPDATE users SET password = :p WHERE id = :id");
    $update->execute([':p' => $hash, ':id' => $admin['id']]);
    
    echo "Success! Password for admin ({$admin['email']}) changed to: $newPass\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}