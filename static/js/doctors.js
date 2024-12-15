
// Função para carregar médicos
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
        if (Array.isArray(doctors)) {
            // Atualizar tabela se estivermos na página de médicos
            const doctorsTable = document.querySelector('#doctorsTable');
            if (doctorsTable) {
                updateDoctorsTable(doctors);
            }
            
            // Atualizar select de médicos em todas as páginas
            const doctorSelect = document.querySelector('#selectedDoctor');
            if (doctorSelect) {
                updateDoctorsSelect(doctors);
            }
        } else {
            throw new Error('Formato de dados inválido');
        }
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

// Função para atualizar a tabela de médicos
function updateDoctorsTable(doctors) {
    const doctorsTable = document.querySelector('#doctorsTable');
    if (!doctorsTable) {
        return; // Estamos em uma página sem tabela de médicos
    }
    
    let tbody = doctorsTable.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        doctorsTable.appendChild(tbody);
    }
    
    try {
        tbody.innerHTML = doctors.map(doctor => `
            <tr>
                <td>${doctor.full_name}</td>
                <td>${doctor.crm}</td>
                <td>${doctor.rqe || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${doctor.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao atualizar tabela:', error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao atualizar tabela: ${error.message}</td></tr>`;
    }
}

// Função para atualizar o select de médicos
function updateDoctorsSelect(doctors) {
    const select = document.querySelector('#selectedDoctor');
    if (!select) return;
    
    select.innerHTML = `
        <option value="">Selecione...</option>
        ${doctors.map(doctor => `
            <option value="${doctor.id}" data-crm="${doctor.crm}" data-rqe="${doctor.rqe}">
                ${doctor.full_name}
            </option>
        `).join('')}
    `;
}

// Função para cadastrar um novo médico
async function createDoctor(event) {
    event.preventDefault();
    
    const name = document.getElementById('doctorName').value.trim();
    const crm = document.getElementById('doctorCRM').value.trim();
    const rqe = document.getElementById('doctorRQE').value.trim();

    // Validação
    if (!name) {
        showFeedback('Nome do médico é obrigatório', 'danger');
        return;
    }
    if (!crm) {
        showFeedback('CRM é obrigatório', 'danger');
        return;
    }

    const doctorData = {
        full_name: name,
        crm: crm,
        rqe: rqe
    };

    try {
        const response = await fetch('/api/doctors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(doctorData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao cadastrar médico');
        }

        showFeedback('Médico cadastrado com sucesso', 'success');
        document.getElementById('doctorForm').reset();
        await loadDoctors();
    } catch (error) {
        console.error('Erro:', error);
        showFeedback(error.message, 'danger');
    }
}

// Função auxiliar para mostrar feedback
function showFeedback(message, type = 'success') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    feedbackDiv.style.zIndex = '1050';
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);
    setTimeout(() => feedbackDiv.remove(), 3000);
}

// Função para deletar um médico
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

        // Feedback visual
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'alert alert-success position-fixed top-0 end-0 m-3';
        feedbackDiv.textContent = 'Médico excluído com sucesso';
        document.body.appendChild(feedbackDiv);
        setTimeout(() => feedbackDiv.remove(), 3000);

        await loadDoctors();
    } catch (error) {
        console.error('Erro:', error);
        // Feedback visual de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
        errorDiv.textContent = error.message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('doctorForm');
    if (form) {
        form.addEventListener('submit', createDoctor);
    }
    loadDoctors();
});
