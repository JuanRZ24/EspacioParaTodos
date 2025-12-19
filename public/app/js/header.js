// Inyecta un header dinámico con menú de navegación
function createHeader() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return; // no mostrar header si no está autenticado

  const header = document.createElement('header');
  header.className = 'app-header';
  header.style.backgroundColor = '#9D2449';
  header.style.borderBottom = '1px solid var(--primary-700)';

  // Use new classes: container, flex, justify-between, items-center
  header.innerHTML = `
    <div class="container flex justify-between items-center" style="color:white">
      <div class="flex items-center gap-4">
        <img src="img/logo_mx.png" alt="Gobierno de México" style="height: 48px; width: auto;">
        <nav class="header-nav flex gap-4">
          <a href="dashboard.html" class="text-sm font-bold" style="color:white">Panel</a>
          <a href="create_request.html" class="text-sm font-bold" style="color:white">Crear solicitud</a>
          <a href="my_requests.html" class="text-sm font-bold" style="color:white">Mis solicitudes</a>
          <a href="map.html" class="text-sm font-bold" style="color:white">Mapa</a>
          <a href="profile.html" class="text-sm font-bold" style="color:white">Mi Perfil</a>
          ${user.role === 'admin' ? `
              <a href="admin_dashboard.html" class="admin-link text-sm font-bold" style="color:white">Métricas</a>
              <a href="admin_requests.html" class="admin-link text-sm font-bold" style="color:white">Solicitudes</a>
              <a href="admin_users.html" class="admin-link text-sm font-bold" style="color:white">Usuarios</a>
              <a href="admin_zones.html" class="admin-link text-sm font-bold" style="color:white">Zonas</a>
          ` : ''}
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right hidden sm:block">
          <div class="font-bold text-sm" style="color:white">${user.name}</div>
          <div class="text-sm" style="color:rgba(255,255,255,0.8); font-size:0.75rem">${user.email}</div>
        </div>
        <button id="header_logout" class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem">Salir</button>
      </div>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);

  // Enlazar logout
  const logoutBtn = header.querySelector('#header_logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', createHeader);
