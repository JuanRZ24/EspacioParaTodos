<?php
require_once __DIR__ . '/../app/helpers/helpers.php';

$hash = '$2y$10$YxE7IFPVWEsSXopXsb767.YBtFPiV6Owx3S6IBOV9Kf6K1hG5DO6W';

$passwords_to_try = [
    'admin123',
    'admin',
    'password',
    '12345678',
    'Administrador',
    '',
];

header('Content-Type: application/json');
$results = [];

foreach($passwords_to_try as $pass) {
    $is_valid = verify_password($pass, $hash);
    $results[] = [
        'password' => $pass,
        'valid' => $is_valid
    ];
    if($is_valid) {
        echo json_encode(['found' => $pass]);
        exit;
    }
}

echo json_encode(['message' => 'Password not found in common passwords', 'tried' => $results]);
