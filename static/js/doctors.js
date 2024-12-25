// Function to load doctors
async function loadDoctors() {
    try {
        console.log('Iniciando carregamento de médicos...');
        const response = await fetch('/api/doctors', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erro na resposta:', response.status, errorData);
            throw new Error(errorData.error || 'Erro ao carregar médicos');
        }

        const doctors = await response.json();
        console.log('Médicos carregados:', doctors);

        if (!Array.isArray(doctors)) {
            console.error('Formato inválido de resposta:', doctors);
            throw new Error('Formato de dados inválido');
        }

        // Update table and select in order
        const updates = [];

        const doctorsTable = document.querySelector('#doctorsTable');
        if (doctorsTable) {
            console.log('Atualizando tabela de médicos...');
            updates.push(updateDoctorsTable(doctors));
        }

        const doctorSelect = document.querySelector('#selectedDoctor');
        if (doctorSelect) {
            console.log('Atualizando select de médicos...');
            updates.push(updateDoctorsSelect(doctors));
        }

        // Wait for all updates
        await Promise.all(updates);
        console.log('Atualização de médicos concluída com sucesso');

    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
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
        console.warn('Tabela de médicos não encontrada');
        return;
    }

    let tbody = doctorsTable.querySelector('tbody');
    if (!tbody) {
        console.warn("tbody não encontrado");
        return;
    }

    try {
        console.log('Criando linhas da tabela para', doctors.length, 'médicos');
        const rows = doctors.map(doctor => {
            const tr = document.createElement('tr');
            tr.dataset.id = doctor.id;
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
        console.log('Tabela atualizada com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar tabela:', error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao atualizar tabela: ${error.message}</td></tr>`;
    }
}

// Function to update doctors select
function updateDoctorsSelect(doctors) {
    const select = document.querySelector('#selectedDoctor');
    if (!select) {
        console.warn('Select de médicos não encontrado');
        return;
    }

    console.log('Atualizando select com', doctors.length, 'médicos');
    select.innerHTML = `
        <option value="">Selecione...</option>
        ${doctors.map(doctor => `
            <option value="${doctor.id}" data-crm="${doctor.crm}" data-rqe="${doctor.rqe || ''}">
                Dr(a). ${doctor.full_name}
            </option>
        `).join('')}
    `;
}

// Function to update signature preview
function updateSignaturePreview() {
    console.log('Atualizando preview da assinatura...');
    const name = document.getElementById('doctorName').value.trim();
    const crm = document.getElementById('doctorCRM').value.trim();
    const rqe = document.getElementById('doctorRQE').value.trim();

    const preview = document.getElementById('signaturePreview');
    if (preview) {
        preview.innerHTML = `
            <strong>Dr(a). ${name || 'Nome do Médico'}</strong><br>
            CRM: ${crm || 'XXXXX'}${rqe ? `/RQE: ${rqe}` : ''}
        `;
        console.log('Preview da assinatura atualizado');
    } else {
        console.warn('Elemento de preview não encontrado');
    }
}

// Function to save doctor (create/edit)
async function saveDoctor() {
    console.log('Iniciando salvamento do médico...');
    const form = document.getElementById('doctorForm');
    if (!form.checkValidity()) {
        console.warn('Formulário inválido');
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
        console.log('Enviando dados:', doctorData);
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
            console.error('Erro na resposta:', response.status, data);
            throw new Error(data.error || 'Erro ao salvar médico');
        }

        console.log('Médico salvo com sucesso:', data);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDoctorModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');
        document.getElementById('doctorId').value = '';

        showFeedback('Médico salvo com sucesso', 'success');
        await loadDoctors();
    } catch (error) {
        console.error('Erro ao salvar médico:', error);
        showFeedback(error.message, 'danger');
    }
}

// Function to edit doctor
function editDoctor(id) {
    console.log('Iniciando edição do médico:', id);
    const row = document.querySelector(`#doctorsTable tr[data-id="${id}"]`);
    if (!row) {
        console.error('Linha da tabela não encontrada para o médico:', id);
        return;
    }

    document.getElementById('modalTitle').textContent = 'Editar Médico';
    document.getElementById('doctorId').value = id;
    document.getElementById('doctorName').value = row.cells[0].textContent;
    document.getElementById('doctorCRM').value = row.cells[1].textContent;
    document.getElementById('doctorRQE').value = row.cells[2].textContent !== '-' ? row.cells[2].textContent : '';

    updateSignaturePreview();
    const modal = new bootstrap.Modal(document.getElementById('addDoctorModal'));
    modal.show();
    console.log('Modal de edição aberto');
}

// Function to delete doctor
async function deleteDoctor(id) {
    console.log('Iniciando exclusão do médico:', id);
    if (!confirm('Tem certeza que deseja excluir este médico?')) {
        console.log('Exclusão cancelada pelo usuário');
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
            console.error('Erro na resposta:', response.status, data);
            throw new Error(data.error || 'Erro ao excluir médico');
        }

        console.log('Médico excluído com sucesso');
        showFeedback('Médico excluído com sucesso', 'success');
        await loadDoctors();
    } catch (error) {
        console.error('Erro ao excluir médico:', error);
        showFeedback(error.message, 'danger');
    }
}

// Helper function to show feedback
function showFeedback(message, type = 'success') {
    console.log(`Mostrando feedback: ${message} (${type})`);
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    feedbackDiv.style.zIndex = '1050';
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);
    setTimeout(() => feedbackDiv.remove(), 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando página de médicos...');
    // Initialize form validation
    const form = document.getElementById('doctorForm');
    if (form) {
        console.log('Configurando formulário...');
        // Add real-time signature preview
        ['doctorName', 'doctorCRM', 'doctorRQE'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updateSignaturePreview);
            } else {
                console.warn(`Elemento ${id} não encontrado`);
            }
        });

        // Reset form when modal is closed
        const modal = document.getElementById('addDoctorModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', function() {
                form.reset();
                form.classList.remove('was-validated');
                document.getElementById('doctorId').value = '';
                document.getElementById('modalTitle').textContent = 'Adicionar Médico';
                updateSignaturePreview();
                console.log('Formulário resetado após fechar modal');
            });
        } else {
            console.warn('Modal não encontrado');
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveDoctor();
        });
        console.log('Event listeners configurados com sucesso');
    } else {
        console.warn('Formulário não encontrado');
    }

    loadDoctors();
});