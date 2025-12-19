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
    try {
        const nameEl = qs('reg_name');
        const emailEl = qs('reg_email');
        const passEl = qs('reg_pass');
        if (!nameEl || !emailEl || !passEl) return;
        const r = await apiFetch('/register', { method: 'POST', body: { name: nameEl.value, email: emailEl.value, password: passEl.value } });
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
    try {
        const nameEl = qs('zone_name');
        const descEl = qs('zone_desc');
        const imgEl = qs('zone_image');
        if (!nameEl || !descEl) return;
        if (!nameEl.value || !descEl.value) return showAlert('Todos los campos son obligatorios', 'error');

        await apiFetch('/zones', {
            method: 'POST',
            body: {
                name: nameEl.value,
                description: descEl.value,
                image_url: imgEl ? imgEl.value : null
            }
        });
        showAlert('Zona creada correctamente', 'success');
        setTimeout(() => window.location.href = 'admin_requests.html', 1000);
    } catch (e) { showAlert(e.error || JSON.stringify(e), 'error'); }
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

        if (!r.data || r.data.length === 0) {
            info.innerHTML = '<strong>Disponibilidad:</strong> Esta zona está libre para futuras reservas.';
            return;
        }

        let html = '<strong>Fechas reservadas (No disponibles):</strong><ul class="list-disc pl-5 mt-2">';
        r.data.forEach(s => {
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
