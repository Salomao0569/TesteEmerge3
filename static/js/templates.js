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
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-primary" onclick="exportToPDF(${template.id})">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="exportToDOC(${template.id})">
                                <i class="fas fa-file-word"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
    }

    // Atualizar frases normais
    const normalTable = document.querySelector('#normalFrases table tbody');
    if (normalTable) {
        normalTable.innerHTML = templates
            .filter(template => template.category === 'normal')
            .map(template => getTemplateRow(template)).join('');
    }

    // Atualizar frases alteradas
    const alteradoTable = document.querySelector('#alteradoFrases table tbody');
    if (alteradoTable) {
        normalTable.innerHTML = templates
            .filter(template => template.category === 'alterado')
            .map(template => getTemplateRow(template)).join('');
    }

    // Atualizar frases de conclusão
    const conclusaoTable = document.querySelector('#conclusaoFrases table tbody');
    if (conclusaoTable) {
        conclusaoTable.innerHTML = templates
            .filter(template => template.category === 'conclusao')
            .map(template => getTemplateRow(template)).join('');
    }
}

// Função helper para gerar linha da tabela
function getTemplateRow(template) {
    return `
        <tr>
            <td>${template.name}</td>
            <td>${template.content.substring(0, 100)}...</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-primary" onclick="exportToPDF(${template.id})">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="exportToDOC(${template.id})">
                        <i class="fas fa-file-word"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Função para cadastrar um novo template
async function createTemplate(event) {
    event.preventDefault();

    try {
        const name = document.getElementById('templateName').value.trim();
        const category = document.getElementById('templateCategory').value;
        const content = document.querySelector('#templateContent').value.trim();

        if (!name || !category || !content) {
            alert('Todos os campos são obrigatórios');
            return;
        }

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

        console.log('Template cadastrado com sucesso:', responseData);

        // Limpar formulário apenas após sucesso
        document.getElementById('templateForm').reset();

        // Adicionar botões de exportação após salvar
        const template = responseData.template;

        // Recarregar lista de templates
        await loadTemplates();

        // Mostrar mensagem de sucesso
        alert('Template salvo com sucesso!');

    } catch (error) {
        console.error('Erro ao cadastrar template:', error);
        alert('Erro ao cadastrar template. Por favor, tente novamente.');
    }
}

// Função para deletar um template
async function deleteTemplate(id) {
    if (!id) {
        console.error('ID inválido para deleção');
        return;
    }

    if (!confirm('Tem certeza que deseja excluir este template?')) {
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
            throw new Error(errorData.error || 'Erro ao excluir template');
        }

        console.log('Template deletado com sucesso');
        await loadTemplates();
    } catch (error) {
        console.error('Erro ao excluir template:', error);
        alert('Erro ao excluir template: ' + error.message);
    }
}

// Funções de exportação
async function exportToPDF(id) {
    try {
        const response = await fetch(`/api/templates/${id}/pdf`, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert('Erro ao exportar PDF: ' + error.message);
    }
}

async function exportToDOC(id) {
    try {
        const response = await fetch(`/api/templates/${id}/doc`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar DOC');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Erro ao exportar DOC:', error);
        alert('Erro ao exportar DOC: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('templateForm').addEventListener('submit', createTemplate);
    loadTemplates();
});