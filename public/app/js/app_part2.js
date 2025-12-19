const replyBtn = document.createElement('button');
replyBtn.textContent = 'Enviar respuesta';
replyBtn.className = 'btn btn-primary mt-2 btn-sm w-full';
replyBtn.onclick = async () => {
    const comment = replyBox.value.trim();
    if (!comment) return showAlert('Escribe una respuesta antes de enviar', 'error');
    try {
        await apiFetch(`/solicitudes/${s.id}/reply`, { method: 'POST', body: { comment } });
        showAlert('Respuesta enviada', 'success');
        loadMyRequests();
    } catch (e) { showAlert(e.error || JSON.stringify(e), 'error'); }
};
d.appendChild(replyBtn);
      }

if (s.status === 'pending' || s.status === 'questioned') {
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar Solicitud';
    delBtn.className = 'btn btn-danger mt-2 w-full text-sm';
    delBtn.onclick = () => {
        showConfirm('¿Estás seguro de que deseas eliminar esta solicitud?', async (confirmed) => {
            if (confirmed) {
                try {
                    await apiFetch(`/solicitudes/${s.id}`, { method: 'DELETE' });
                    showAlert('Solicitud eliminada', 'success');
                    loadMyRequests();
                } catch (e) { showAlert(e.error || JSON.stringify(e), 'error'); }
            }
        });
    };
    d.appendChild(delBtn);
}

grid.appendChild(d);
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
        el.innerHTML = '<div class="text-muted text-center p-4">No hay solicitudes para mostrar</div>';
        return;
    }

    const container = document.createElement('div');
    container.className = 'table-container';

    const table = document.createElement('table');
    table.innerHTML = `
    <thead>
      <tr>
        <th>Usuario</th>
        <th>Zona</th>
        <th>Fecha</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
  `;
    solicitudes.forEach(s => {
        const row = document.createElement('tr');
        // Handle custom zone display
        const zoneName = s.custom_zone ? `${s.custom_zone} (Personalizada)` : s.zone_name;

        row.innerHTML = `
      <td>
        <div class="font-bold">${s.user_name}</div>
        <div class="text-sm text-muted">${s.email || ''}</div>
      </td>
      <td>${zoneName}</td>
      <td>${s.event_date}</td>
      <td><span class="badge ${s.status}">${s.status}</span></td>
      <td>
        <button class="admin-detail-btn btn btn-primary py-1 px-3 text-sm h-auto" data-id="${s.id}">Ver detalles</button>
      </td>
    `;
        table.appendChild(row);
    });
    table.innerHTML += '</tbody>';

    container.appendChild(table);
    el.appendChild(container);

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
    const zoneName = solicitud.custom_zone ? `${solicitud.custom_zone} (Personalizada)` : solicitud.zone_name;

    content.innerHTML = `
    <div class="mb-4">
      <div class="mb-2"><strong>Usuario:</strong> ${solicitud.user_name} <span class="text-sm text-muted">(${solicitud.email})</span></div>
      <div class="mb-2"><strong>Zona:</strong> ${zoneName}</div>
      <div class="mb-2"><strong>Fecha:</strong> ${solicitud.event_date} <span class="text-sm text-muted">${times}</span></div>
      <div class="mb-2"><strong>Duración:</strong> ${solicitud.duration_hours}h</div>
      <div class="mb-2"><strong>Estado:</strong> <span class="badge ${solicitud.status}">${solicitud.status}</span></div>
    </div>
    <hr class="mb-4 border-gray-200">
    <div class="mb-4">
      <div class="font-bold">Justificación:</div>
      <div class="text-muted">${solicitud.justification}</div>
    </div>
    <div class="mb-4">
      <div class="font-bold">Descripción del evento:</div>
      <div class="text-muted">${solicitud.description}</div>
    </div>
    ${solicitud.admin_comment ? `<div class="p-4 bg-yellow-50 border border-yellow-200 rounded mb-4"><strong>Comentario admin:</strong><br>${solicitud.admin_comment}</div>` : ''}
    <hr class="mb-4 border-gray-200">
    <div>
      <div class="font-bold mb-2">Acciones:</div>
      ${['pending', 'questioned'].includes(solicitud.status) ? `
        <input id="admin_comment" type="text" placeholder="Comentario para el usuario (opcional)" class="mb-4">
        <div class="flex gap-2 flex-wrap">
          <button class="admin-action-btn btn btn-primary flex-1 bg-green-600 hover:bg-green-700" data-action="accept" data-id="${solicitud.id}" style="background-color: var(--success); border-color:var(--success);">Aceptar</button>
          <button class="admin-action-btn btn btn-danger flex-1" data-action="reject" data-id="${solicitud.id}">Rechazar</button>
          <button class="admin-action-btn btn btn-secondary flex-1" data-action="question" data-id="${solicitud.id}">Observación</button>
        </div>
      ` : '<div class="text-muted italic">Esta solicitud ya fue resuelta.</div>'}
    </div>
  `;

    modal.style.display = 'block';

    document.querySelectorAll('.admin-action-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const action = e.target.dataset.action;
            const id = parseInt(e.target.dataset.id);
            const commentInput = qs('admin_comment');
            const comment = commentInput ? commentInput.value : '';
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
        showAlert('Acción aplicada correctamente', 'success');
        qs('admin_modal').style.display = 'none';
        loadAdminRequests();
    } catch (e) {
        showAlert(e.error || JSON.stringify(e), 'error');
    }
}

function filterAdminRequests() {
    const search = qs('admin_search').value.toLowerCase();
    const statusFilter = qs('admin_filter_status').value;

    const filtered = window.adminAllRequests.filter(s => {
        const matchSearch = !search ||
            s.user_name.toLowerCase().includes(search) ||
            (s.zone_name && s.zone_name.toLowerCase().includes(search)) ||
            (s.custom_zone && s.custom_zone.toLowerCase().includes(search)) ||
            s.justification.toLowerCase().includes(search) ||
            s.description.toLowerCase().includes(search);

        const matchStatus = !statusFilter || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    renderAdminRequests(filtered);
}

// PERMIT GENERATION
function downloadPermit(request) {
    const user = currentUser();
    const zoneName = request.custom_zone ? request.custom_zone + ' (Zona Personalizada)' : request.zone_name;
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Permiso Oficial #${request.id}</title>
        <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .subtitle { font-size: 14px; text-transform: uppercase; margin-top: 5px; }
            .title { text-align: center; font-size: 28px; font-weight: bold; margin: 30px 0; text-transform: uppercase; text-decoration: underline; }
            .content { font-size: 16px; margin-bottom: 40px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
            .qr-placeholder { text-align: center; margin: 30px 0; }
            .qr-box { display: inline-block; width: 100px; height: 100px; border: 1px solid #000; background: #f0f0f0; line-height: 100px; font-family: sans-serif; font-size: 10px; }
            @media print {
                .no-print { display: none; }
                body { padding: 0; }
            }
        </style>
    </head>
    <body onload="window.print()">
        <div class="header">
            <div class="logo">Gobierno Municipal</div>
            <div class="subtitle">Departamento de Espacios Públicos</div>
        </div>

        <div class="title">Permiso de Uso de Espacio Público</div>

        <div class="content">
            <p>Por medio de la presente, se otorga permiso a:</p>
            <div class="field"><span class="label">Solicitante:</span> ${request.user_name || user.name}</div>
            
            <p>Para hacer uso del siguiente espacio público:</p>
            <div class="field"><span class="label">Zona Autorizada:</span> ${zoneName}</div>
            
            <p>Bajo los siguientes términos:</p>
            <div class="field"><span class="label">Fecha del Evento:</span> ${request.event_date}</div>
            <div class="field"><span class="label">Horario:</span> ${request.event_start_time} - ${request.event_end_time} (${request.duration_hours} horas)</div>
            <div class="field"><span class="label">Actividad Descrita:</span> ${request.description}</div>
            <div class="field"><span class="label">ID de Solicitud:</span> #${request.id}</div>
        </div>

        <div class="qr-placeholder">
            <div class="qr-box">QR CODE</div>
            <p style="font-size:10px; margin-top:5px">Escanear para verificar validez</p>
        </div>

        <div class="footer">
            <p>Este documento es oficial y debe ser presentado ante las autoridades si es requerido.</p>
            <p>Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
        </div>
    </body>
    </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(html);
        win.document.close();
    } else {
        showAlert('Habilita las ventanas emergentes para descargar el permiso', 'error');
    }
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

    if (page === 'admin_dashboard') {
        const user = currentUser();
        if (!user || user.role !== 'admin') {
            alert('Acceso denegado');
            window.location.href = 'dashboard.html';
            return;
        }
        loadAdminDashboard();
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
        if (user.role === 'admin') {
            const adm = qs('admin_quick');
            if (adm) adm.style.display = 'block';
        }
    }

    if (page === 'profile') {
        loadProfile();
        const btn = qs('btn_save_profile');
        if (btn) btn.addEventListener('click', saveProfile);
    }
});

async function loadAdminDashboard() {
    try {
        const r = await apiFetch('/admin/solicitudes/stats');
        const data = r.data;

        new Chart(document.getElementById('chartStatus'), {
            type: 'doughnut',
            data: {
                labels: data.status_counts.map(x => x.status),
                datasets: [{
                    data: data.status_counts.map(x => x.count),
                    backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'] // pending, accepted, rejected, questioned
                }]
            }
        });

        new Chart(document.getElementById('chartZones'), {
            type: 'bar',
            data: {
                labels: data.popular_zones.map(x => x.name),
                datasets: [{
                    label: 'Solicitudes',
                    data: data.popular_zones.map(x => x.count),
                    backgroundColor: '#e02424'
                }]
            }
        });

        new Chart(document.getElementById('chartTrends'), {
            type: 'line',
            data: {
                labels: data.monthly_trends.map(x => x.month),
                datasets: [{
                    label: 'Solicitudes por Mes',
                    data: data.monthly_trends.map(x => x.count),
                    borderColor: '#771d1d',
                    tension: 0.1
                }]
            }
        });
    } catch (e) {
        console.error(e);
        showAlert('Error cargando métricas: ' + e.error, 'error');
    }
}

async function loadProfile() {
    try {
        const r = await apiFetch('/profile');
        if (qs('prof_name')) qs('prof_name').value = r.name;
        if (qs('prof_email')) qs('prof_email').value = r.email;
        if (qs('prof_phone')) qs('prof_phone').value = r.phone || '';
    } catch (e) {
        showAlert('Error cargando perfil', 'error');
    }
}

async function saveProfile() {
    try {
        const name = qs('prof_name').value;
        const phone = qs('prof_phone').value;
        const pass = qs('prof_pass').value;

        if (!name) return showAlert('El nombre es obligatorio', 'error');

        await apiFetch('/profile', {
            method: 'POST',
            body: { name, phone, password: pass || null }
        });
        showAlert('Perfil actualizado correctamente', 'success');

        const user = currentUser();
        if (user) {
            user.name = name;
            localStorage.setItem('user', JSON.stringify(user));
        }

    } catch (e) {
        showAlert('Error al actualizar: ' + (e.error || e), 'error');
    }
}
