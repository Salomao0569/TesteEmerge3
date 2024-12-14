
// Função para carregar médicos
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors');
        if (!response.ok) throw new Error('Erro ao carregar médicos');
        const doctors = await response.json();
        updateDoctorsTable(doctors);
        updateDoctorsSelect(doctors);
    } catch (error) {
        console.error('Erro:', error);
    }
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
    if (!name || !crm) {
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
            },
            body: JSON.stringify(doctorData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao cadastrar médico');
        }

        document.getElementById('doctorForm').reset();
        await loadDoctors();
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para deletar um médico
async function deleteDoctor(id) {
    try {
        const response = await fetch(`/api/doctors/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao excluir médico');
        }

        await loadDoctors();
    } catch (error) {
        console.error('Erro:', error);
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
