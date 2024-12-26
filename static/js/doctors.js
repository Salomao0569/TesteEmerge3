// Function to get CSRF token from cookie
function getCSRFToken() {
    const name = 'csrf_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for(let cookie of cookieArray) {
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return '';
}

// Function to add CSRF token to headers
function addCSRFToken(headers = {}) {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    return { ...headers, 'X-CSRFToken': token };
}

// Function to format doctor name
function formatDoctorName(name) {
    console.log('Formatting doctor name:', name);
    // Remove any existing "Dr." or "Dr" prefix
    const cleanName = name.replace(/^Dr\.?\s+/i, '').trim();
    console.log('Cleaned name:', cleanName);
    return `Dr. ${cleanName}`;
}

// Function to load doctors
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
            throw new Error('Erro ao carregar médicos');
        }
        const doctors = await response.json();
        console.log('Loaded doctors:', doctors);
        updateDoctorsTable(doctors);
        updateDoctorsSelect(doctors);
    } catch (error) {
        showFeedback('Erro ao carregar médicos: ' + error.message, 'danger');
    }
}

// Function to update doctors table
function updateDoctorsTable(doctors) {
    const tbody = document.querySelector('#doctorsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = doctors.map(doctor => {
        const formattedName = formatDoctorName(doctor.full_name);
        console.log('Formatting for table:', formattedName);
        return `
            <tr data-id="${doctor.id}">
                <td>
                    ${formattedName}<br>
                    <small class="text-muted">CRM: ${doctor.crm} RQE: ${doctor.rqe || ''}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editDoctor(${doctor.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${doctor.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Function to update doctors select
function updateDoctorsSelect(doctors) {
    const select = document.querySelector('#selectedDoctor');
    if (!select) return;

    select.innerHTML = `
        <option value="">Selecione o médico...</option>
        ${doctors.map(doctor => {
            const formattedName = formatDoctorName(doctor.full_name);
            console.log('Formatting for select:', formattedName);
            return `
                <option value="${doctor.id}">
                    ${formattedName}<br>
                    CRM: ${doctor.crm} RQE: ${doctor.rqe || ''}
                </option>
            `;
        }).join('')}
    `;
}

// Function to update signature preview
function updateSignaturePreview() {
    const name = document.getElementById('doctorName')?.value || '';
    const crm = document.getElementById('doctorCRM')?.value || '';
    const rqe = document.getElementById('doctorRQE')?.value || '';

    const preview = document.getElementById('signaturePreview');
    if (preview) {
        const formattedName = formatDoctorName(name);
        console.log('Formatting for preview:', formattedName);
        preview.innerHTML = `
            ${formattedName}<br>
            <small>CRM: ${crm || 'XXXXX'} RQE: ${rqe || ''}</small>
        `;
    }
}

// Function to save doctor
async function saveDoctor() {
    const form = document.getElementById('doctorForm');
    if (!form) return;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const doctorId = document.getElementById('doctorId')?.value;
    const doctorData = {
        full_name: document.getElementById('doctorName')?.value,
        crm: document.getElementById('doctorCRM')?.value,
        rqe: document.getElementById('doctorRQE')?.value || null
    };

    console.log('Saving doctor data:', doctorData);

    try {
        const response = await fetch(
            doctorId ? `/api/doctors/${doctorId}` : '/api/doctors',
            {
                method: doctorId ? 'PUT' : 'POST',
                headers: addCSRFToken({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(doctorData)
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao salvar médico');
        }

        showFeedback('Médico salvo com sucesso!', 'success');
        await loadDoctors();

        // Só fecha o modal se o salvamento foi bem-sucedido
        const modal = bootstrap.Modal.getInstance(document.getElementById('doctorsModal'));
        if (modal) {
            modal.hide();
            form.reset();
            form.classList.remove('was-validated');
            document.getElementById('doctorId').value = '';
        }
    } catch (error) {
        showFeedback(error.message, 'danger');
    }
}

// Function to edit doctor
function editDoctor(id) {
    const row = document.querySelector(`#doctorsTable tr[data-id="${id}"]`);
    if (!row) return;

    const cells = row.getElementsByTagName('td');
    const nameCell = cells[0].childNodes[0].textContent.trim();
    console.log('Editing doctor, raw name:', nameCell);

    document.getElementById('doctorId').value = id;
    // Remove 'Dr.' prefix when editing
    const cleanName = nameCell.replace(/^Dr\.?\s+/i, '').trim();
    console.log('Cleaned name for editing:', cleanName);

    document.getElementById('doctorName').value = cleanName;

    const crmRqeText = cells[0].querySelector('.text-muted').textContent;
    const crm = crmRqeText.split('CRM:')[1].split('RQE:')[0].trim();
    const rqe = crmRqeText.includes('RQE:') ? crmRqeText.split('RQE:')[1].trim() : '';

    document.getElementById('doctorCRM').value = crm;
    document.getElementById('doctorRQE').value = rqe;

    updateSignaturePreview();
}

// Function to delete doctor
async function deleteDoctor(id) {
    try {
        const response = await fetch(`/api/doctors/${id}`, {
            method: 'DELETE',
            headers: addCSRFToken()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao excluir médico');
        }

        showFeedback('Médico excluído com sucesso!', 'success');
        await loadDoctors();
    } catch (error) {
        showFeedback(error.message, 'danger');
    }
}

// Function to show feedback
function showFeedback(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadDoctors();

    // Set up form validation and preview
    const form = document.getElementById('doctorForm');
    if (form) {
        ['doctorName', 'doctorCRM', 'doctorRQE'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', updateSignaturePreview);
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveDoctor();
        });
    }

    // Modal reset handler
    const modal = document.getElementById('doctorsModal');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', function() {
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
            document.getElementById('doctorId').value = '';
            updateSignaturePreview();
        });
    }
});