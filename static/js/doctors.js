// Function to load doctors
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Erro ao carregar médicos');
        }

        const doctors = await response.json();
        if (!Array.isArray(doctors)) {
            throw new Error('Formato de dados inválido');
        }

        // Update table and select in order
        const updates = [];

        const doctorsTable = document.querySelector('#doctorsTable');
        if (doctorsTable) {
            updates.push(updateDoctorsTable(doctors));
        }

        const doctorSelect = document.querySelector('#selectedDoctor');
        if (doctorSelect) {
            updates.push(updateDoctorsSelect(doctors));
        }

        // Wait for all updates
        await Promise.all(updates);

    } catch (error) {
        console.error('Error:', error);
        const doctorsTable = document.querySelector('#doctorsTable');
        if (doctorsTable) {
            const tbody = doctorsTable.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar médicos: ${error.message}</td></tr>`;
            }
        }
    }
}

// Function to update doctors table
function updateDoctorsTable(doctors) {
    const doctorsTable = document.querySelector('#doctorsTable');
    if (!doctorsTable) {
        return; // We're on a page without doctors table
    }

    let tbody = doctorsTable.querySelector('tbody');
    if (!tbody) {
        console.warn("tbody element not found");
        return;
    }

    try {
        const rows = doctors.map(doctor => {
            const tr = document.createElement('tr');
            tr.dataset.id = doctor.id; // Add data-id attribute for easy selection
            tr.innerHTML = `
                <td>${doctor.full_name}</td>
                <td>${doctor.crm}</td>
                <td>${doctor.rqe || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editDoctor(${doctor.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${doctor.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            return tr;
        });

        // Clear existing tbody
        tbody.innerHTML = '';

        // Add new rows
        rows.forEach(row => tbody.appendChild(row));
    } catch (error) {
        console.error('Error updating table:', error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao atualizar tabela: ${error.message}</td></tr>`;
    }
}

// Function to update doctors select
function updateDoctorsSelect(doctors) {
    const select = document.querySelector('#selectedDoctor');
    if (!select) return;

    select.innerHTML = `
        <option value="">Selecione...</option>
        ${doctors.map(doctor => `
            <option value="${doctor.id}" data-crm="${doctor.crm}" data-rqe="${doctor.rqe || ''}">
                ${doctor.full_name}
            </option>
        `).join('')}
    `;
}

// Function to update signature preview
function updateSignaturePreview() {
    const name = document.getElementById('doctorName').value.trim();
    const crm = document.getElementById('doctorCRM').value.trim();
    const rqe = document.getElementById('doctorRQE').value.trim();

    const preview = document.getElementById('signaturePreview');
    if (preview) {
        preview.innerHTML = `
            <strong>Dr. ${name || 'Nome do Médico'}</strong><br>
            CRM: ${crm || 'XXXXX'}${rqe ? `/RQE: ${rqe}` : ''}
        `;
    }
}

// Function to save doctor (create/edit)
async function saveDoctor() {
    const form = document.getElementById('doctorForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const doctorId = document.getElementById('doctorId').value;
    const name = document.getElementById('doctorName').value.trim();
    const crm = document.getElementById('doctorCRM').value.trim();
    const rqe = document.getElementById('doctorRQE').value.trim();

    const doctorData = {
        full_name: name,
        crm: crm,
        rqe: rqe || null
    };

    try {
        const url = doctorId ? `/api/doctors/${doctorId}` : '/api/doctors';
        const method = doctorId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(doctorData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao salvar médico');
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDoctorModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');
        document.getElementById('doctorId').value = '';

        showFeedback('Médico salvo com sucesso', 'success');
        await loadDoctors();
    } catch (error) {
        console.error('Error:', error);
        showFeedback(error.message, 'danger');
    }
}

// Function to edit doctor
function editDoctor(id) {
    const row = document.querySelector(`#doctorsTable tr[data-id="${id}"]`);
    if (!row) return;

    document.getElementById('modalTitle').textContent = 'Editar Médico';
    document.getElementById('doctorId').value = id;
    document.getElementById('doctorName').value = row.cells[0].textContent;
    document.getElementById('doctorCRM').value = row.cells[1].textContent;
    document.getElementById('doctorRQE').value = row.cells[2].textContent !== '-' ? row.cells[2].textContent : '';

    updateSignaturePreview();
    const modal = new bootstrap.Modal(document.getElementById('addDoctorModal'));
    modal.show();
}

// Function to delete doctor
async function deleteDoctor(id) {
    if (!confirm('Tem certeza que deseja excluir este médico?')) {
        return;
    }

    try {
        const response = await fetch(`/api/doctors/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Erro ao excluir médico');
        }

        showFeedback('Médico excluído com sucesso', 'success');
        await loadDoctors();
    } catch (error) {
        console.error('Error:', error);
        showFeedback(error.message, 'danger');
    }
}

// Helper function to show feedback
function showFeedback(message, type = 'success') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    feedbackDiv.style.zIndex = '1050';
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);
    setTimeout(() => feedbackDiv.remove(), 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    const form = document.getElementById('doctorForm');
    if (form) {
        // Add real-time signature preview
        ['doctorName', 'doctorCRM', 'doctorRQE'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', updateSignaturePreview);
        });

        // Reset form when modal is closed
        document.getElementById('addDoctorModal')?.addEventListener('hidden.bs.modal', function() {
            form.reset();
            form.classList.remove('was-validated');
            document.getElementById('doctorId').value = '';
            document.getElementById('modalTitle').textContent = 'Adicionar Médico';
            updateSignaturePreview();
        });
        form.addEventListener('submit', saveDoctor);
    }
    loadDoctors();
});