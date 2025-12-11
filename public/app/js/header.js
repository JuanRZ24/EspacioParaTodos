// Inyecta un header dinámico con menú de navegación
function createHeader(){
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if(!user) return; // no mostrar header si no está autenticado

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="logo" style="width:48px;height:48px;font-size:16px">SE</div>
        <nav class="header-nav">
          <a href="dashboard.html">Panel</a>
          <a href="create_request.html">Crear solicitud</a>
          <a href="my_requests.html">Mis solicitudes</a>
          ${user.role === 'admin' ? '<a href="admin_requests.html" class="admin-link">Admin</a>' : ''}
        </nav>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <div style="text-align:right">
          <div style="font-weight:600">${user.name}</div>
          <div class="muted" style="font-size:12px">${user.email}</div>
        </div>
        <button id="header_logout" style="padding:8px 12px;border-radius:8px">Salir</button>
      </div>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);
  
  // Enlazar logout
  const logoutBtn = header.querySelector('#header_logout');
  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', createHeader);
