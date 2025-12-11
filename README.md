# Sistema de Solicitudes de Espacios Públicos

API en PHP (MVC por capas) para solicitar uso de espacios públicos.

## Setup rápido

### 1. Inicializar la base de datos
Accede a: `http://localhost/proyecto4/public/setup_db.php`

### 2. Configurar credenciales del administrador
Accede a: `http://localhost/proyecto4/public/setup_admin.php`

O para resetear la contraseña del admin a `admin123`:
Accede a: `http://localhost/proyecto4/public/reset_admin_password.php`

### 3. Acceder a la aplicación
```
http://localhost/proyecto4/public/app/index.html
```

## Credenciales de testing

**Admin:**
- Email: `admin@example.com`
- Contraseña: `admin123`

## Rutas principales

- **Inicio:** `public/app/index.html`
- **Registro:** `public/app/register.html`
- **Login:** `public/app/login.html`
- **Dashboard:** `public/app/dashboard.html` (requiere login)
- **Crear solicitud:** `public/app/create_request.html` (requiere login)
- **Mis solicitudes:** `public/app/my_requests.html` (requiere login)
- **Panel admin:** `public/app/admin_requests.html` (requiere login + role admin)

## API Endpoints

### Autenticación
- `POST /api/register` - Registrar nuevo usuario
- `POST /api/login` - Iniciar sesión

### Zonas
- `GET /api/zones` - Listar zonas disponibles

### Solicitudes
- `GET /api/solicitudes` - Obtener mis solicitudes
- `POST /api/solicitudes` - Crear nueva solicitud
- `GET /api/solicitudes/:id` - Ver detalles de una solicitud
- `DELETE /api/solicitudes/:id` - Eliminar una solicitud

### Admin
- `GET /api/admin/solicitudes` - Listar todas las solicitudes
- `POST /api/admin/solicitudes/:id/action` - Tomar acción sobre solicitud

## Tecnologías

- **Backend:** PHP 7.4+ con PDO
- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Base de datos:** MySQL
- **Autenticación:** Token simple almacenado en localStorage
- **Color scheme:** Inspirado en gob.mx (tonos burgundy/maroon)

Requisitos mínimos:
- PHP 7.4+
- MySQL
- XAMPP (opcional)

Instalación rápida:
1. Copiar la carpeta en `c:/xampp/htdocs/proyecto4`.
2. Importar `db.sql` en MySQL (por ejemplo usando phpMyAdmin).
3. Ajustar credenciales en `app/config/database.php`.
4. Acceder a `http://localhost/proyecto4/public/index.php` o apuntar virtual host a `public`.

Rutas principales (JSON):
- `POST /api/register` -> registrar usuario {name,email,password}
- `POST /api/login` -> login {email,password} -> devuelve token
- `GET /api/solicitudes` -> obtener solicitudes del usuario (header `Authorization: Bearer <token>`)
- `POST /api/solicitudes` -> crear solicitud {zone_id,date,duration_hours,justification,description}
- `GET /api/solicitudes/{id}` -> ver solicitud del usuario

Admin:
- `GET /api/admin/solicitudes` -> listar todas las solicitudes (token de admin)
- `POST /api/admin/solicitudes/{id}/action` -> {action: "accept|reject|question", comment: "..."}

Notas:
- Esta implementación usa tokens simples generados y guardados en tabla `users`.
- Para producción, reemplazar por JWT o OAuth y HTTPS.
