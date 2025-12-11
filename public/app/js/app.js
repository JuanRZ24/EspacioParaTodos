const API_BASE = '../index.php/api';

function qs(id) { return document.getElementById(id) }

function setToken(t) { localStorage.setItem('token', t); }
function getToken() { return localStorage.getItem('token'); }
function clearToken() { localStorage.removeItem('token'); }

async function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  const res = await fetch(API_BASE + path, opts);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw { error: 'Invalid JSON response from server: ' + text };
  }
  if (!res.ok) throw data;
  return data;
}

async function register() {
  try {
    const nameEl = qs('reg_name');
    const emailEl = qs('reg_email');
    const passEl = qs('reg_pass');
    if (!nameEl || !emailEl || !passEl) return;
    const r = await apiFetch('/register', { method: 'POST', body: { name: nameEl.value, email: emailEl.value, password: passEl.value } });
    alert('Registrado. ID: ' + r.id);
    window.location.href = 'login.html';
  } catch (e) { alert(e.error || JSON.stringify(e)); }
}

async function login() {
  try {
    const emailEl = qs('log_email');
    const passEl = qs('log_pass');
    if (!emailEl || !passEl) return;
    const r = await apiFetch('/login', { method: 'POST', body: { email: emailEl.value, password: passEl.value } });
    setToken(r.token);
    localStorage.setItem('user', JSON.stringify(r.user));
    window.location.href = 'dashboard.html';
  } catch (e) { alert(e.error || JSON.stringify(e)); }
}

async function saveZone() {
  try {
    const nameEl = qs('zone_name');
    const descEl = qs('zone_desc');
    if (!nameEl || !descEl) return;
    if (!nameEl.value || !descEl.value) return alert('Todos los campos son obligatorios');

    await apiFetch('/zones', { method: 'POST', body: { name: nameEl.value, description: descEl.value } });
    alert('Zona creada correctamente');
    window.location.href = 'admin_requests.html';
  } catch (e) { alert(e.error || JSON.stringify(e)); }
}

function logout() { clearToken(); localStorage.removeItem('user'); window.location.href = 'login.html'; }

function currentUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
}

async function loadZones() {
  try {
    const sel = qs('zone_select');
    if (!sel) {
      console.error('zone_select element not found');
      return;
    }
    console.log('Calling API to load zones...');
    const r = await apiFetch('/zones');
    console.log('Zones response:', r);

    if (!r.data || r.data.length === 0) {
      console.warn('No zones returned from API');
      sel.innerHTML = '<option>No hay zonas disponibles</option>';
      return;
    }

    sel.innerHTML = '<option value="">Selecciona una zona</option>';
    r.data.forEach(z => {
      const o = document.createElement('option');
      o.value = z.id;
      o.textContent = z.name;
      sel.appendChild(o);
    });

    sel.addEventListener('change', () => {
      loadAvailability(sel.value);
    });

  } catch (e) {
    console.error('Error loading zones:', e);
    const sel = qs('zone_select');
    if (sel) sel.innerHTML = '<option>Error cargando zonas</option>';
  }
}

async function loadAvailability(zoneId) {
  const info = qs('availability_info');
  if (!info) return;
  if (!zoneId) {
    info.style.display = 'none';
    return;
  }

  try {
    info.innerHTML = 'Cargando disponibilidad...';
    info.style.display = 'block';
    const r = await apiFetch(`/solicitudes/accepted?zone_id=${zoneId}`);
    if (!r.data || r.data.length === 0) {
      info.innerHTML = '<strong>Disponibilidad:</strong> Esta zona está libre para futuras reservas.';
      return;
    }

    let html = '<strong>Fechas reservadas (No disponibles):</strong><ul style="margin:5px 0 0 20px;padding:0">';
    r.data.forEach(s => {
      // Show only future dates
      html += `<li>${s.event_date} (${s.event_start_time} - ${s.event_end_time})</li>`;
    });
    html += '</ul>';
    info.innerHTML = html;

  } catch (e) {
    info.innerText = 'Error cargando disponibilidad';
  }
}

async function createRequest() {
  try {
    const zone = qs('zone_select');
    const date = qs('event_date');
    const start = qs('start_time');
    const end = qs('end_time');
    const just = qs('justification');
    const desc = qs('description');
    if (!zone || !date || !start || !end || !just || !desc) return alert('Faltan campos obligatorios');

    if (!zone.value) return alert('Selecciona una zona');
    if (!date.value) return alert('Selecciona una fecha');

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.value)) return alert('Formato de fecha inválido');

    const today = new Date().toISOString().slice(0, 10);
    if (date.value <= today) return alert('La fecha debe ser futura');

    if (!start.value || !end.value) return alert('Especifica horarios de inicio y fin');
    if (end.value <= start.value) return alert('La hora de fin debe ser posterior a la hora de inicio');

    if (!just.value.trim()) return alert('La justificación es obligatoria');
    if (!desc.value.trim()) return alert('La descripción es obligatoria');

    const body = {
      zone_id: zone.value,
      event_date: date.value,
      start_time: start.value,
      end_time: end.value,
      justification: just.value.trim(),
      description: desc.value.trim()
    };
    const r = await apiFetch('/solicitudes', { method: 'POST', body });
    alert('Solicitud creada ID: ' + r.id);
    window.location.href = 'my_requests.html';
  } catch (e) { alert('Error: ' + (e.error || JSON.stringify(e))); }
}

async function loadMyRequests() {
  try {
    const el = qs('my_requests'); if (!el) return;
    const r = await apiFetch('/solicitudes');
    el.innerHTML = '';
    r.data.forEach(s => {
      const d = document.createElement('div'); d.className = 'card';
      const times = s.event_start_time && s.event_end_time ? ` - ${s.event_start_time} → ${s.event_end_time}` : '';
      // Header
      const header = document.createElement('div');
      header.innerHTML = `<strong>${s.zone_name}</strong> - ${s.event_date}${times} (${s.duration_hours}h)`;
      d.appendChild(header);

      // Status and justification
      const statusEl = document.createElement('div');
      statusEl.innerHTML = `Status: <span class="badge ${s.status}">${s.status}</span>`;
      d.appendChild(statusEl);

      const justEl = document.createElement('div'); justEl.innerHTML = s.justification; d.appendChild(justEl);
      const descEl = document.createElement('div'); descEl.className = 'muted'; descEl.innerText = s.description; d.appendChild(descEl);

      // Admin comment (if any)
      if (s.admin_comment) {
        const adminC = document.createElement('div'); adminC.innerHTML = '<em>Admin:</em> ' + s.admin_comment; adminC.style.marginTop = '8px'; d.appendChild(adminC);
      }

      // If admin questioned the request, show reply area and previous user reply if any
      if (s.status === 'questioned') {
        if (s.user_comment) {
          const userReplyView = document.createElement('div');
          userReplyView.style.marginTop = '8px';
          userReplyView.innerHTML = '<strong>Tu respuesta:</strong><div class="muted">' + s.user_comment + '</div>';
          d.appendChild(userReplyView);
        }

        const replyBox = document.createElement('textarea');
        replyBox.placeholder = 'Responder a la observación del administrador';
        replyBox.style.width = '100%';
        replyBox.style.marginTop = '8px';
        d.appendChild(replyBox);

        const replyBtn = document.createElement('button');
        replyBtn.textContent = 'Enviar respuesta';
        replyBtn.style.marginTop = '8px';
        replyBtn.style.background = 'linear-gradient(90deg,#7b1233,#b33a5a)';
        replyBtn.onclick = async () => {
          const comment = replyBox.value.trim();
          if (!comment) return alert('Escribe una respuesta antes de enviar');
          try {
            await apiFetch(`/solicitudes/${s.id}/reply`, { method: 'POST', body: { comment } });
            alert('Respuesta enviada');
            loadMyRequests();
          } catch (e) { alert(e.error || JSON.stringify(e)); }
        };
        d.appendChild(replyBtn);
      }

      // Delete button for pending or questioned
      if (s.status === 'pending' || s.status === 'questioned') {
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.style.marginTop = '8px';
        delBtn.style.background = 'linear-gradient(90deg,#fb7185,#dc2626)';
        delBtn.onclick = async () => {
          if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) return;
          try {
            await apiFetch(`/solicitudes/${s.id}`, { method: 'DELETE' });
            alert('Solicitud eliminada');
            loadMyRequests();
          } catch (e) { alert(e.error || JSON.stringify(e)); }
        };
        d.appendChild(delBtn);
      }

      el.appendChild(d);
    });
  } catch (e) { console.error(e); if (e.error) { qs('my_requests') && (qs('my_requests').innerText = 'Error: ' + e.error); } }
}

async function loadAdminRequests() {
  try {
    const el = qs('admin_requests'); if (!el) return;
    const r = await apiFetch('/admin/solicitudes');
    window.adminAllRequests = r.data;
    renderAdminRequests(r.data);
  } catch (e) { console.error(e); if (e.error) { qs('admin_requests') && (qs('admin_requests').innerText = 'Error: ' + e.error); } }
}

function renderAdminRequests(solicitudes) {
  const el = qs('admin_requests'); if (!el) return;
  el.innerHTML = '';
  if (solicitudes.length === 0) {
    el.innerHTML = '<div class="muted">No hay solicitudes</div>';
    return;
  }
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.innerHTML = `
    <thead style="background:#f5eef0;border-bottom:2px solid #e0d7e0">
      <tr>
        <th style="padding:10px;text-align:left">Usuario</th>
        <th style="padding:10px;text-align:left">Zona</th>
        <th style="padding:10px;text-align:left">Fecha</th>
        <th style="padding:10px;text-align:left">Estado</th>
        <th style="padding:10px;text-align:left">Acciones</th>
      </tr>
    </thead>
    <tbody>
  `;
  solicitudes.forEach(s => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #e0d7e0';
    row.innerHTML = `
      <td style="padding:10px">${s.user_name}</td>
      <td style="padding:10px">${s.zone_name}</td>
      <td style="padding:10px">${s.event_date}</td>
      <td style="padding:10px"><span class="badge ${s.status}">${s.status}</span></td>
      <td style="padding:10px">
        <button class="admin-detail-btn" data-id="${s.id}" style="padding:6px 10px;border-radius:6px;background:var(--primary-500);color:#fff;border:none;cursor:pointer;font-size:12px">Ver detalles</button>
      </td>
    `;
    table.appendChild(row);
  });
  table.innerHTML += '</tbody>';
  el.appendChild(table);

  document.querySelectorAll('.admin-detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const solicitud = solicitudes.find(s => s.id === id);
      showAdminModal(solicitud);
    });
  });
}

function showAdminModal(solicitud) {
  const modal = qs('admin_modal');
  const content = qs('admin_modal_content');
  const times = solicitud.event_start_time && solicitud.event_end_time ? `${solicitud.event_start_time} → ${solicitud.event_end_time}` : 'N/A';

  content.innerHTML = `
    <div style="margin-bottom:12px">
      <div><strong>Usuario:</strong> ${solicitud.user_name} (${solicitud.email})</div>
      <div><strong>Zona:</strong> ${solicitud.zone_name}</div>
      <div><strong>Fecha y hora:</strong> ${solicitud.event_date} ${times}</div>
      <div><strong>Duración:</strong> ${solicitud.duration_hours}h</div>
      <div><strong>Estado:</strong> <span class="badge ${solicitud.status}">${solicitud.status}</span></div>
    </div>
    <hr>
    <div style="margin-bottom:12px">
      <div><strong>Justificación:</strong></div>
      <div class="muted">${solicitud.justification}</div>
    </div>
    <div style="margin-bottom:12px">
      <div><strong>Descripción del evento:</strong></div>
      <div class="muted">${solicitud.description}</div>
    </div>
    ${solicitud.admin_comment ? `<div style="margin-bottom:12px;background:#fff3cd;padding:10px;border-left:4px solid #f59e0b;border-radius:6px"><strong>Comentario admin:</strong><br>${solicitud.admin_comment}</div>` : ''}
    <hr>
    <div style="margin-bottom:12px">
      <strong>Acciones:</strong><br><br>
      ${['pending', 'questioned'].includes(solicitud.status) ? `
        <input id="admin_comment" type="text" placeholder="Comentario (opcional)" style="margin-bottom:8px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="admin-action-btn" data-action="accept" data-id="${solicitud.id}">Aceptar</button>
          <button class="admin-action-btn" data-action="reject" data-id="${solicitud.id}">Rechazar</button>
          <button class="admin-action-btn" data-action="question" data-id="${solicitud.id}">Solicitar aclaraciones</button>
        </div>
      ` : '<div class="muted">Esta solicitud ya fue resuelta y no se puede cambiar su estado.</div>'}
    </div>
  `;

  modal.style.display = 'block';

  document.querySelectorAll('.admin-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const action = e.target.dataset.action;
      const id = parseInt(e.target.dataset.id);
      const comment = qs('admin_comment') ? qs('admin_comment').value : '';
      await applyAdminAction(id, action, comment);
    });
  });
}

async function applyAdminAction(id, action, comment) {
  try {
    await apiFetch(`/admin/solicitudes/${id}/action`, {
      method: 'POST',
      body: { action, comment }
    });
    alert('Acción aplicada');
    qs('admin_modal').style.display = 'none';
    loadAdminRequests();
  } catch (e) {
    alert(e.error || JSON.stringify(e));
  }
}

function filterAdminRequests() {
  const search = qs('admin_search').value.toLowerCase();
  const statusFilter = qs('admin_filter_status').value;

  const filtered = window.adminAllRequests.filter(s => {
    const matchSearch = !search ||
      s.user_name.toLowerCase().includes(search) ||
      s.zone_name.toLowerCase().includes(search) ||
      s.justification.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search);

    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  renderAdminRequests(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page') || '';

  if (page === 'register') {
    const btn = qs('btn_register');
    if (btn) btn.addEventListener('click', register);
  }

  if (page === 'login') {
    const btn = qs('btn_login');
    if (btn) btn.addEventListener('click', login);
  }

  if (page === 'create') {
    const btn = qs('btn_create_request');
    if (btn) btn.addEventListener('click', createRequest);
    const user = currentUser();
    if (!user) {
      alert('Debes iniciar sesión');
      window.location.href = 'login.html';
      return;
    }
    loadZones();
  }

  if (page === 'my_requests') {
    const user = currentUser();
    if (!user) {
      alert('Debes iniciar sesión');
      window.location.href = 'login.html';
      return;
    }
    loadMyRequests();
  }

  if (page === 'admin') {
    const user = currentUser();
    if (!user) {
      alert('Debes iniciar sesión');
      window.location.href = 'login.html';
      return;
    }
    if (user.role !== 'admin') {
      alert('Acceso denegado: admin only');
      window.location.href = 'dashboard.html';
      return;
    }
    loadAdminRequests();

    const searchEl = qs('admin_search');
    const statusEl = qs('admin_filter_status');
    if (searchEl) searchEl.addEventListener('input', filterAdminRequests);
    if (statusEl) statusEl.addEventListener('change', filterAdminRequests);

    const modal = qs('admin_modal');
    const closeBtn = qs('admin_modal_close');
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }

  if (page === 'admin_zones') {
    const user = currentUser();
    if (!user || user.role !== 'admin') {
      alert('Acceso denegado');
      window.location.href = 'dashboard.html';
      return;
    }
    const btn = qs('btn_save_zone');
    if (btn) btn.addEventListener('click', saveZone);
  }

  if (page === 'dashboard') {
    const user = currentUser();
    if (!user) {
      alert('Debes iniciar sesión');
      window.location.href = 'login.html';
      return;
    }
    const nameEl = qs('dash_user_name');
    const emailEl = qs('dash_user_email');
    if (nameEl) nameEl.textContent = user.name || 'Usuario';
    if (emailEl) emailEl.textContent = user.email || '';
    const logoutBtn = qs('btn_logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (user.role === 'admin') {
      const adm = qs('admin_quick');
      if (adm) adm.style.display = 'block';
    }
  }
});
