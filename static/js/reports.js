// Função para carregar modelos de laudos
async function loadReports() {
    const response = await fetch('/api/templates?category=laudo');
    const templates = await response.json();
    updateReportsList(templates);
}

// Função para atualizar a lista de modelos
function updateReportsList(templates) {
    const tbody = document.querySelector('#reportsList');
    tbody.innerHTML = templates.map(template => `
        <tr>
            <td>${template.name}</td>
            <td>${template.content.substring(0, 100)}...</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteReport(${template.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Função para cadastrar um novo modelo
async function createReport(event) {
    event.preventDefault();
    
    const reportData = {
        name: document.getElementById('reportName').value,
        category: 'laudo',
        content: document.getElementById('reportContent').innerHTML
    };

    try {
        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar modelo de laudo');

        // Limpar formulário
        document.getElementById('reportForm').reset();
        document.getElementById('reportContent').innerHTML = '';
        
        // Recarregar lista de modelos
        await loadReports();
    } catch (error) {
        alert('Erro ao cadastrar modelo de laudo: ' + error.message);
    }
}

// Função para deletar um modelo
async function deleteReport(id) {
    if (!confirm('Tem certeza que deseja excluir este modelo?')) return;

    try {
        const response = await fetch(`/api/templates/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir modelo');

        await loadReports();
    } catch (error) {
        alert('Erro ao excluir modelo: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', createReport);
    }
    loadReports();
});
