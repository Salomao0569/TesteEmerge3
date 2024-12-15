// Função para carregar templates
async function loadTemplates() {
    const response = await fetch('/api/templates');
    const templates = await response.json();
    updateTemplatesTable(templates);
}

// Função para atualizar a tabela de templates
function updateTemplatesTable(templates) {
    // Atualizar laudos
    const laudosTable = document.querySelector('#laudos table tbody');
    if (laudosTable) {
        laudosTable.innerHTML = templates
            .filter(template => template.category === 'laudo')
            .map(template => `
                <tr>
                    <td>${template.name}</td>
                    <td>${template.content.substring(0, 100)}...</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    // Atualizar frases normais
    const normalTable = document.querySelector('#normalFrases table tbody');
    if (normalTable) {
        normalTable.innerHTML = templates
            .filter(template => template.category === 'normal')
            .map(template => `
                <tr>
                    <td>${template.name}</td>
                    <td>${template.content.substring(0, 100)}...</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    // Atualizar frases alteradas
    const alteradoTable = document.querySelector('#alteradoFrases table tbody');
    if (alteradoTable) {
        alteradoTable.innerHTML = templates
            .filter(template => template.category === 'alterado')
            .map(template => `
                <tr>
                    <td>${template.name}</td>
                    <td>${template.content.substring(0, 100)}...</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    // Atualizar frases de conclusão
    const conclusaoTable = document.querySelector('#conclusaoFrases table tbody');
    if (conclusaoTable) {
        conclusaoTable.innerHTML = templates
            .filter(template => template.category === 'conclusao')
            .map(template => `
                <tr>
                    <td>${template.name}</td>
                    <td>${template.content.substring(0, 100)}...</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }
}

// Função para cadastrar um novo template
async function createTemplate(event) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('templateName').value.trim();
        const category = document.getElementById('templateCategory').value;
        const contentArea = document.getElementById('templateContent');
        
        if (!name || !category || !contentArea.innerHTML.trim()) {
            alert('Todos os campos são obrigatórios');
            return;
        }

        const content = contentArea.innerHTML;
        const templateData = { name, category, content };
        
        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(templateData)
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || 'Erro ao cadastrar frase');
        }

        console.log('Frase cadastrada com sucesso:', responseData);
        
        // Limpar formulário apenas após sucesso
        document.getElementById('templateForm').reset();
        
        // Recarregar lista de templates
        await loadTemplates();
        
        } catch (error) {
            console.error('Erro ao cadastrar frase:', error);
            alert('Erro ao cadastrar frase. Por favor, tente novamente.');
        }
}

// Função para deletar um template
async function deleteTemplate(id) {
    if (!id) {
        console.error('ID inválido para deleção');
        return;
    }

    

    try {
        console.log('Deletando template:', id);
        const response = await fetch(`/api/templates/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir frase');
        }

        console.log('Frase deletada com sucesso');
        await loadTemplates();
    } catch (error) {
        console.error('Erro ao excluir frase:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('templateForm').addEventListener('submit', createTemplate);
    loadTemplates();
});