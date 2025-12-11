<?php
// Script para configurar las credenciales del administrador
error_reporting(E_ALL);
ini_set('display_errors',1);

$cfg = require __DIR__ . '/../app/config/database.php';

try{
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
}catch(PDOException $e){
    echo "Error: No se pudo conectar a la base de datos. " . $e->getMessage();
    exit;
}

$message = '';
$form_submitted = $_SERVER['REQUEST_METHOD'] === 'POST';

if($form_submitted){
    $admin_name = trim($_POST['admin_name'] ?? '');
    $admin_email = trim($_POST['admin_email'] ?? '');
    $admin_password = trim($_POST['admin_password'] ?? '');
    $admin_password_confirm = trim($_POST['admin_password_confirm'] ?? '');
    
    if(!$admin_name || !$admin_email || !$admin_password){
        $message = '<span style="color:red">Todos los campos son obligatorios.</span>';
    }elseif($admin_password !== $admin_password_confirm){
        $message = '<span style="color:red">Las contraseñas no coinciden.</span>';
    }elseif(strlen($admin_password) < 6){
        $message = '<span style="color:red">La contraseña debe tener al menos 6 caracteres.</span>';
    }else{
        // Hash la contraseña
        $password_hash = password_hash($admin_password, PASSWORD_DEFAULT);
        
        try{
            // Actualizar o crear admin
            $stmt = $pdo->prepare('
                INSERT INTO users (name, email, password, role) VALUES (:n, :e, :p, :r)
                ON DUPLICATE KEY UPDATE password = :p, name = :n
            ');
            $stmt->execute([
                ':n' => $admin_name,
                ':e' => $admin_email,
                ':p' => $password_hash,
                ':r' => 'admin'
            ]);
            $message = '<span style="color:green"><strong>✓ Administrador configurado correctamente.</strong></span>';
        }catch(PDOException $e){
            $message = '<span style="color:red">Error al guardar: ' . $e->getMessage() . '</span>';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Configurar Admin - Sistema Solicitudes</title>
    <style>
        body{font-family:Arial,sans-serif;background:#f5eef0;margin:0;padding:20px}
        .container{max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
        h1{color:#330914;margin-bottom:10px;font-size:24px}
        .subtitle{color:#6b5860;margin-bottom:20px}
        .form-group{margin-bottom:15px}
        label{display:block;margin-bottom:6px;color:#330914;font-weight:600}
        input{width:100%;padding:10px;border:1px solid #e0d7e0;border-radius:6px;font-size:14px;box-sizing:border-box}
        input:focus{outline:none;border-color:#7b1233;box-shadow:0 0 4px rgba(123,18,51,0.3)}
        button{width:100%;padding:12px;background:linear-gradient(90deg,#7b1233,#b33a5a);color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px}
        button:hover{opacity:0.9}
        .message{padding:12px;border-radius:6px;margin-bottom:20px}
        .info{background:#e6f0ff;color:#0f5a8a;padding:12px;border-left:4px solid #2b7bf6;border-radius:6px;margin-bottom:20px;font-size:13px}
    </style>
</head>
<body>
    <div class="container">
        <h1>Configurar Administrador</h1>
        <p class="subtitle">Crea o actualiza las credenciales del administrador del sistema</p>
        
        <?php if($message): ?>
            <div class="message"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <div class="info">
            <strong>Nota:</strong> Las credenciales del admin se guardan de forma segura. Una vez completado, podrás iniciar sesión desde la página de login.
        </div>
        
        <form method="POST">
            <div class="form-group">
                <label for="admin_name">Nombre del Administrador</label>
                <input type="text" id="admin_name" name="admin_name" placeholder="ej. Administrador" value="<?php echo htmlspecialchars($_POST['admin_name'] ?? 'Administrador'); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="admin_email">Correo Electrónico</label>
                <input type="email" id="admin_email" name="admin_email" placeholder="ej. admin@example.com" value="<?php echo htmlspecialchars($_POST['admin_email'] ?? 'admin@example.com'); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="admin_password">Contraseña</label>
                <input type="password" id="admin_password" name="admin_password" placeholder="Mínimo 6 caracteres" required>
            </div>
            
            <div class="form-group">
                <label for="admin_password_confirm">Confirmar Contraseña</label>
                <input type="password" id="admin_password_confirm" name="admin_password_confirm" placeholder="Repite la contraseña" required>
            </div>
            
            <button type="submit">Guardar Administrador</button>
        </form>
        
        <p style="text-align:center;color:#6b5860;margin-top:20px;font-size:13px">
            <a href="db_test.php" style="color:#7b1233;text-decoration:none">← Probar conexión a BD</a> | 
            <a href="app/index.html" style="color:#7b1233;text-decoration:none">Ir a la aplicación →</a>
        </p>
    </div>
</body>
</html>
