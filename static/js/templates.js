// Função para carregar templates
async function loadTemplates() {
    const response = await fetch('/api/templates');
    const templates = await response.json();
    updateTemplatesTable(templates);
}

// Função para atualizar a tabela de templates
function updateTemplatesTable(templates) {
    const tbody = document.querySelector('#templatesTable tbody');
    tbody.innerHTML = templates.map(template => `
        <tr>
            <td>${template.name}</td>
            <td>${template.category}</td>
            <td>${template.content.substring(0, 100)}...</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Função para cadastrar um novo template
async function createTemplate(event) {
    event.preventDefault();
    
    const templateData = {
        name: document.getElementById('templateName').value,
        category: document.getElementById('templateCategory').value,
        content: document.getElementById('templateContent').value
    };

    try {
        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(templateData)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar template');

        // Limpar formulário
        document.getElementById('templateForm').reset();
        
        // Recarregar lista de templates
        await loadTemplates();
    } catch (error) {
        alert('Erro ao cadastrar template: ' + error.message);
    }
}

// Função para deletar um template
async function deleteTemplate(id) {
    if (!confirm('Tem certeza que deseja excluir esta frase?')) return;

    try {
        const response = await fetch(`/api/templates/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir template');

        await loadTemplates();
    } catch (error) {
        alert('Erro ao excluir template: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('templateForm').addEventListener('submit', createTemplate);
    loadTemplates();
});
