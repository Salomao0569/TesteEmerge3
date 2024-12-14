// Função para carregar médicos
async function loadDoctors() {
    const response = await fetch('/api/doctors');
    const doctors = await response.json();
    updateDoctorsTable(doctors);
    updateDoctorsSelect(doctors);
}

// Função para atualizar a tabela de médicos
function updateDoctorsTable(doctors) {
    const tbody = document.querySelector('#doctorsTable tbody');
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
}

// Função para atualizar o select de médicos
function updateDoctorsSelect(doctors) {
    const select = document.querySelector('#selectedDoctor');
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
    
    const doctorData = {
        full_name: document.getElementById('doctorName').value,
        crm: document.getElementById('doctorCRM').value,
        rqe: document.getElementById('doctorRQE').value
    };

    try {
        const response = await fetch('/api/doctors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doctorData)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar médico');

        // Limpar formulário
        document.getElementById('doctorForm').reset();
        
        // Recarregar lista de médicos
        await loadDoctors();
    } catch (error) {
        alert('Erro ao cadastrar médico: ' + error.message);
    }
}

// Função para deletar um médico
async function deleteDoctor(id) {
    if (!confirm('Tem certeza que deseja excluir este médico?')) return;

    try {
        const response = await fetch(`/api/doctors/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir médico');

        await loadDoctors();
    } catch (error) {
        alert('Erro ao excluir médico: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('doctorForm').addEventListener('submit', createDoctor);
    loadDoctors();
});
