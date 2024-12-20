
async function createReport(event) {
    event.preventDefault();
    
    try {
        const form = {
            name: document.getElementById('reportName').value,
            content: tinymce.get('editor').getContent(),
            category: 'laudo',
            doctor_id: document.getElementById('doctorId').value
        };

        if (!form.name || !form.content || !form.doctor_id) {
            throw new Error('Por favor, preencha todos os campos');
        }

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
        });

        if (!response.ok) {
            throw new Error('Erro ao cadastrar laudo');
        }

        document.getElementById('reportForm').reset();
        await loadReports();
        alert('Laudo cadastrado com sucesso!');
    } catch (error) {
        alert(error.message);
    }
}

async function loadReports() {
    try {
        const response = await fetch('/api/templates?category=laudo');
        const templates = await response.json();
        
        const tbody = document.querySelector('#reportsList');
        tbody.innerHTML = templates.map(template => `
            <tr>
                <td>${template.name}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewReport(${template.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteReport(${template.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar laudos:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', createReport);
    }
    loadReports();
});
