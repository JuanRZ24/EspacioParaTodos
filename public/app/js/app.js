const API_BASE = '../index.php/api';

/* Custom Alert/Toast System */
function showAlert(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span class="close">&times;</span>
    `;

    container.appendChild(toast);

    // Auto remove
    const duration = 4000;
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);

    // Manual remove
    toast.querySelector('.close').onclick = () => toast.remove();
}

function showConfirm(message, callback) {
    let modal = document.getElementById('confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirm-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <h3>Confirmación</h3>
            <p>${message}</p>
            <div class="actions">
                <button id="confirm-btn-yes" class="btn btn-danger">Sí, eliminar</button>
                <button id="confirm-btn-no" class="btn btn-secondary">Cancelar</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('confirm-btn-yes').onclick = () => {
        modal.style.display = 'none';
        callback(true);
    };

    document.getElementById('confirm-btn-no').onclick = () => {
        modal.style.display = 'none';
        callback(false);
    };
}



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
    console.log("Register function called");
    try {
        const nameEl = qs('reg_name');
        const emailEl = qs('reg_email');
        const passEl = qs('reg_pass');
        const passConfirmEl = qs('reg_pass_confirm');
        const curpEl = qs('reg_curp');
        const addrEl = qs('reg_address');
        const phoneEl = qs('reg_phone');

        if (!nameEl || !emailEl || !passEl || !passConfirmEl || !curpEl || !addrEl || !phoneEl) return;

        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const pass = passEl.value;
        const passConfirm = passConfirmEl.value;
        const curp = curpEl.value.trim().toUpperCase();
        const address = addrEl.value.trim();
        const phone = phoneEl.value.trim();

        if (!name || !email || !pass || !passConfirm || !curp || !address || !phone) {
            return showAlert('Todos los campos son obligatorios', 'error');
        }

        if (pass !== passConfirm) {
            return showAlert('Las contraseñas no coinciden', 'error');
        }

        if (curp.length !== 18) {
            return showAlert('El CURP debe tener exactamente 18 caracteres', 'error');
        }

        const body = {
            name: name,
            email: email,
            password: pass,
            curp: curp,
            address: address,
            phone: phone
        };

        const r = await apiFetch('/register', { method: 'POST', body });
        showAlert('Registrado correctamente. ID: ' + r.id, 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (e) { showAlert(e.error || JSON.stringify(e), 'error'); }
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
    } catch (e) { showAlert(e.error || JSON.stringify(e), 'error'); }
}

async function saveZone() {
    const nameEl = qs('zone_name');
    const descEl = qs('zone_desc');
    const imgEl = qs('zone_image');
    const latEl = qs('zone_lat');
    const lngEl = qs('zone_lng');
    const cityEl = qs('zone_city');

    const name = nameEl ? nameEl.value.trim() : '';
    const desc = descEl ? descEl.value.trim() : '';
    const img = imgEl ? imgEl.value.trim() : '';
    const lat = latEl ? latEl.value.trim() : '';
    const lng = lngEl ? lngEl.value.trim() : '';
    const city = cityEl ? cityEl.value.trim() : '';

    if (!name || !desc) {
        return showAlert('Nombre y descripción son requeridos', 'error');
    }

    try {
        await apiFetch('/zones', {
            method: 'POST',
            body: {
                name: name,
                description: desc,
                image_url: img || null, // Send null if empty string
                lat: lat || null,
                lng: lng || null,
                city: city || null
            }
        });
        showAlert('Zona guardada correctamente', 'success');
        setTimeout(() => window.location.href = 'admin_zones.html', 1000);
    } catch (e) {
        showAlert('Error guardando zona: ' + (e.error || JSON.stringify(e)), 'error');
    }
}

function logout() { clearToken(); localStorage.removeItem('user'); window.location.href = 'login.html'; }

function currentUser() {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
}

async function loadZones() {
    try {
        const select = qs('zone_select');
        if (!select) {
            console.error('zone_select element not found');
            return;
        }
        const r = await apiFetch('/zones');
        const zones = r.data || [];

        // Get pre-selected value if any (e.g. from URL or reloading)
        const urlParams = new URLSearchParams(window.location.search);
        const selId = urlParams.get('zone_id');

        select.innerHTML = '<option value="">Selecciona una zona</option>';
        zones.forEach(z => {
            const opt = document.createElement('option');
            opt.value = z.id;
            opt.textContent = z.name;
            opt.dataset.image = z.image_url || '';
            const selected = (selId && String(z.id) === String(selId)) ? 'selected' : '';
            if (selected) {
                opt.selected = true;
                updatePreview(z.image_url);
            }
            select.appendChild(opt);
        });

        // Add "Other" option
        const otherOpt = document.createElement('option');
        otherOpt.value = 'custom';
        otherOpt.textContent = 'Otra / Sugerir ubicación...';
        select.appendChild(otherOpt);

        // Event listener for change
        select.addEventListener('change', () => {
            const val = select.value;
            const customContainer = document.getElementById('custom_zone_container');
            const customInput = document.getElementById('custom_zone');
            const imgPreview = document.getElementById('zone_image_preview');

            if (val === 'custom') {
                customContainer.classList.remove('hidden');
                customInput.focus();
                imgPreview.classList.add('hidden');
                loadAvailability(-1); // Clear availability or handle differently
            } else {
                customContainer.classList.add('hidden');
                customInput.value = ''; // Clear custom input
                // Show image if available
                const opt = select.options[select.selectedIndex];
                updatePreview(opt.dataset.image);
                if (val) loadAvailability(val);
            }
        });

        if (selId) loadAvailability(selId);

    } catch (e) {
        console.error(e);
    }
}

function updatePreview(url) {
    const div = document.getElementById('zone_image_preview');
    if (url) {
        div.innerHTML = `<img src="${url}" class="w-full h-48 object-cover rounded shadow-md" alt="Vista previa de zona">`;
        div.classList.remove('hidden');
    } else {
        div.classList.add('hidden');
        div.innerHTML = '';
    }
}





async function loadAvailability(zoneId) {
    const info = qs('availability_info');
    if (!info) return;

    if (!zoneId || zoneId == -1) {
        info.style.display = 'none';
        return;
    }

    try {
        info.innerHTML = 'Cargando disponibilidad...';
        info.style.display = 'block';

        const r = await apiFetch(`/solicitudes/accepted?zone_id=${zoneId}`);
        const events = r.data || [];

        if (events.length === 0) {
            info.innerHTML = '<strong>Disponibilidad:</strong> Esta zona está libre para futuras reservas.';
            return;
        }

        let html = '<strong>Fechas reservadas (No disponibles):</strong><ul class="list-disc pl-5 mt-2">';
        events.forEach(s => {
            html += `<li>${s.event_date} (${s.event_start_time} - ${s.event_end_time})</li>`;
        });
        html += '</ul>';
        info.innerHTML = html;

    } catch (e) {
        console.error(e);
        info.innerText = 'Error cargando disponibilidad';
    }
}

async function createRequest() {
    try {
        const zoneSelect = qs('zone_select');
        const customZoneInput = qs('custom_zone');
        const date = qs('event_date');
        const start = qs('start_time');
        const end = qs('end_time');
        const just = qs('justification');
        const desc = qs('description');

        if (!zoneSelect || !date || !start || !end || !just || !desc) return showAlert('Faltan campos obligatorios', 'error');

        let zoneId = zoneSelect.value;
        let customZone = '';

        if (zoneId === 'custom') {
            zoneId = '';
            customZone = customZoneInput.value.trim();
            if (!customZone) {
                showAlert('Por favor especifica la ubicación personalizada', 'error');
                return;
            }
        } else if (!zoneId) {
            showAlert('Selecciona una zona', 'error');
            return;
        }

        if (!date.value) return showAlert('Selecciona una fecha', 'error');

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date.value)) return showAlert('Formato de fecha inválido', 'error');

        const today = new Date().toISOString().slice(0, 10);
        if (date.value <= today) return showAlert('La fecha debe ser futura', 'error');

        if (!start.value || !end.value) return showAlert('Especifica horarios de inicio y fin', 'error');
        if (end.value <= start.value) return showAlert('La hora de fin debe ser posterior a la hora de inicio', 'error');

        if (!just.value.trim()) return showAlert('La justificación es obligatoria', 'error');
        if (!desc.value.trim()) return showAlert('La descripción es obligatoria', 'error');

        const body = {
            zone_id: zoneId,
            custom_zone: customZone,
            event_date: date.value,
            start_time: start.value,
            end_time: end.value,
            justification: just.value.trim(),
            description: desc.value.trim()
        };
        const r = await apiFetch('/solicitudes', { method: 'POST', body });
        showAlert('Solicitud creada exitosamente', 'success');
        setTimeout(() => window.location.href = 'my_requests.html', 1500);
    } catch (e) { showAlert('Error: ' + (e.error || JSON.stringify(e)), 'error'); }
}

async function loadMyRequests() {
    try {
        const el = qs('my_requests'); if (!el) return;
        const r = await apiFetch('/solicitudes');
        el.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'grid-cards';
        el.appendChild(grid);

        r.data.forEach(s => {
            const d = document.createElement('div');
            d.className = 'card';
            const times = s.event_start_time && s.event_end_time ? ` <span class="text-sm text-muted">(${s.event_start_time} - ${s.event_end_time})</span>` : '';

            const header = document.createElement('div');
            header.className = 'mb-2';
            // Handle custom zone display
            const zoneName = s.custom_zone ? `${s.custom_zone} (Personalizada)` : s.zone_name;
            header.innerHTML = `<div class="font-bold text-lg">${zoneName}</div><div class="text-sm text-muted">${s.event_date}${times} • ${s.duration_hours}h</div>`;
            d.appendChild(header);

            const statusEl = document.createElement('div');
            statusEl.className = 'mb-2';
            statusEl.innerHTML = `<span class="badge ${s.status}">${s.status}</span>`;
            d.appendChild(statusEl);

            const justEl = document.createElement('div');
            justEl.className = 'mb-2 text-sm';
            justEl.innerHTML = `<strong>Justificación:</strong> ${s.justification}`;
            d.appendChild(justEl);

            const descEl = document.createElement('div');
            descEl.className = 'text-sm text-muted mb-2';
            descEl.innerText = s.description;
            d.appendChild(descEl);

            // Download Permit Button (if accepted)
            if (s.status === 'accepted') {
                const permitBtn = document.createElement('button');
                permitBtn.textContent = '📄 Descargar Permiso Oficial';
                permitBtn.className = 'btn btn-primary w-full mt-2 text-sm bg-blue-600 hover:bg-blue-700';
                permitBtn.style.backgroundColor = '#2563eb';
                permitBtn.onclick = () => downloadPermit(s);
                d.appendChild(permitBtn);

                // Add Rate Button if date passed (mock check for now, ideally strictly check date)
                // For demo simplicity, we allow rating any accepted request
                const rateBtn = document.createElement('button');
                rateBtn.textContent = '⭐ Calificar';
                rateBtn.className = 'btn btn-secondary w-full mt-2 text-sm';
                rateBtn.onclick = () => openRateModal(s);
                d.appendChild(rateBtn);
            }

            if (s.admin_comment) {
                const adminC = document.createElement('div');
                adminC.className = 'p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 mt-2';
                adminC.innerHTML = '<strong>Admin:</strong> ' + s.admin_comment;
                d.appendChild(adminC);
            }

            if (s.status === 'questioned') {
                if (s.user_comment) {
                    const userReplyView = document.createElement('div');
                    userReplyView.className = 'mt-2 p-2 bg-gray-50 border rounded text-sm';
                    userReplyView.innerHTML = '<strong>Tu respuesta:</strong><div class="text-muted">' + s.user_comment + '</div>';
                    d.appendChild(userReplyView);
                }

                const replyBox = document.createElement('textarea');
                replyBox.placeholder = 'Responder a la observación del administrador';
                replyBox.className = 'mt-2';
                d.appendChild(replyBox);
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
        initAdminMapPicker();
    }

    if (page === 'map') {
        loadMap();
    }

    if (page === 'admin_users') {
        const user = currentUser();
        if (!user || user.role !== 'admin') {
            alert('Acceso denegado');
            window.location.href = 'dashboard.html';
            return;
        }
        loadAdminUsers();
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
        if (qs('prof_name')) qs('prof_name').value = r.name || '';
        if (qs('prof_email')) qs('prof_email').value = r.email || '';
        if (qs('prof_curp')) qs('prof_curp').value = r.curp || '';
        if (qs('prof_phone')) qs('prof_phone').value = r.phone || '';
        if (qs('prof_address')) qs('prof_address').value = r.address || '';
    } catch (e) {
        showAlert('Error cargando perfil', 'error');
    }
}

async function loadMap() {
    try {
        const map = L.map('map').setView([19.432608, -99.133209], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '© OpenStreetMap'
        }).addTo(map);

        const r = await apiFetch('/zones');
        const zones = r.data || [];
        const markers = {}; // Store markers by ID for quick access
        const zoneList = document.getElementById('map_zone_list');
        const cityFilter = document.getElementById('map_city_filter');

        // Extract unique cities
        const cities = [...new Set(zones.map(z => z.city).filter(c => c))];
        cities.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            cityFilter.appendChild(opt);
        });

        function renderList(filterCity = '') {
            zoneList.innerHTML = '';
            // Clear existing markers
            Object.values(markers).forEach(m => map.removeLayer(m));

            const bounds = [];
            const filtered = zones.filter(z => !filterCity || z.city === filterCity);

            filtered.forEach(z => {
                if (z.lat && z.lng) {
                    // Fetch rating (quick hack, ideally should be eager loaded or separate call optimized)
                    // For now, let's just show a placeholder or do a quick async fetch if possible? 
                    // Leaflet popups usually want sync content or HTML element.
                    // We will fetch all reviews first? No, too heavy.
                    // Better: The /zones API should return avg_rating. 
                    // Let's assume we update /zones to return avg_rating later. 
                    // For now we can format it if it exists.

                    const ratingHtml = z.avg_rating ? `<div>⭐ ${parseFloat(z.avg_rating).toFixed(1)}</div>` : '';

                    const marker = L.marker([z.lat, z.lng]).addTo(map);
                    marker.bindPopup(`
                    <div class="text-center">
                        <b>${z.name}</b><br>
                        ${ratingHtml}
                        ${z.description}<br>
                        <a href="create_request.html?zone_id=${z.id}" class="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 decoration-none">
                            📅 Solicitar Aquí
                        </a>
                    </div>
                `);
                    markers[z.id] = marker;
                    bounds.push([z.lat, z.lng]);

                    // Add list item
                    const item = document.createElement('div');
                    item.className = 'p-3 bg-white border rounded shadow-sm hover:bg-gray-100 cursor-pointer transition';
                    item.innerHTML = `<div class="font-bold">${z.name}</div><div class="text-xs text-muted">${z.city || 'Sin ciudad'}</div>`;
                    item.onclick = () => {
                        map.flyTo([z.lat, z.lng], 16);
                        marker.openPopup();
                    };
                    zoneList.appendChild(item);
                }
            });

            if (bounds.length > 0) map.fitBounds(bounds);
        }

        renderList(); // Initial render

        cityFilter.addEventListener('change', () => {
            renderList(cityFilter.value);
        });

    } catch (e) {
        console.error(e);
        showAlert('Error al cargar el mapa', 'error');
    }
}

async function loadAdminUsers() {
    try {
        const el = qs('admin_users_list');
        if (!el) return;

        const r = await apiFetch('/admin/users');
        window.adminAllUsers = r.data || [];
        renderAdminUsers(window.adminAllUsers);

        qs('admin_user_search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = window.adminAllUsers.filter(u =>
                u.name.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                (u.curp && u.curp.toLowerCase().includes(term))
            );
            renderAdminUsers(filtered);
        });

    } catch (e) {
        console.error(e);
        showAlert('Error cargando usuarios', 'error');
    }
}

function renderAdminUsers(users) {
    const el = qs('admin_users_list');
    if (!el) return;

    if (users.length === 0) {
        el.innerHTML = '<p class="text-muted text-center">No se encontraron usuarios.</p>';
        return;
    }

    let html = '<div class="table-container"><table><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';

    users.forEach(u => {
        const statusBadge = u.active ? '<span class="badge accepted">Activo</span>' : '<span class="badge rejected">Inactivo</span>';
        const actionBtn = u.role === 'admin' ? '' : `
            <button class="btn btn-sm ${u.active ? 'btn-danger' : 'btn-primary'}" onclick="toggleUserStatus(${u.id}, ${u.active})">
                ${u.active ? 'Desactivar' : 'Activar'}
            </button>`;

        html += `
            <tr>
                <td>
                    <div class="font-bold">${u.name}</div>
                    <div class="text-xs text-muted">${u.curp || 'Sin CURP'}</div>
                </td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${statusBadge}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    el.innerHTML = html;
}

async function toggleUserStatus(id, currentStatus) {
    const newStatus = currentStatus ? 0 : 1;
    const action = newStatus ? 'activar' : 'desactivar';

    showConfirm(`¿Estás seguro de que deseas ${action} este usuario?`, async (yes) => {
        if (yes) {
            try {
                await apiFetch(`/admin/users/${id}/toggle`, { method: 'POST', body: { active: newStatus } });
                showAlert('Estado actualizado', 'success');
                loadAdminUsers();
            } catch (e) {
                showAlert('Error actualizando estado', 'error');
            }
        }
    });
}



async function initAdminMapPicker() {
    try {
        const mapEl = document.getElementById('map_picker');
        if (!mapEl) return;

        // Default to Mexico City if no coords
        const map = L.map('map_picker').setView([19.4326, -99.1332], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '© OpenStreetMap'
        }).addTo(map);

        let marker = null;

        function updateInputs(lat, lng) {
            qs('zone_lat').value = lat.toFixed(6);
            qs('zone_lng').value = lng.toFixed(6);

            // Reverse geocoding (Nominatim) - Simplified
            // In a real app, use a proper geocoding service with rate limiting
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                        if (city) qs('zone_city').value = city;
                    }
                })
                .catch(err => console.error('Geocoding error', err));
        }

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                marker.on('dragend', (ev) => {
                    const pos = ev.target.getLatLng();
                    updateInputs(pos.lat, pos.lng);
                });
            }
            updateInputs(lat, lng);
        });

    } catch (e) {
        console.error('Error init map picker', e);
    }
}
