<?php
ini_set('display_errors', 1);
require_once __DIR__ . '/../app/core/Database.php';

try {
    $pdo = Database::getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        zone_id INT NOT NULL,
        solicitud_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
        FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
    )";

    $pdo->exec($sql);
    echo "SUCCESS: reviews table created.";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
