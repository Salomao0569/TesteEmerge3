// Função para carregar templates com logging aprimorado
async function loadTemplates() {
    try {
        console.log('Iniciando carregamento de templates...');
        const response = await fetch('/api/templates');
        if (!response.ok) {
            throw new Error(`Erro ao carregar templates: ${response.status}`);
        }
        const templates = await response.json();
        console.log(`${templates.length} templates carregados com sucesso`);
        updateTemplatesTable(templates);
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        alert('Erro ao carregar templates. Por favor, recarregue a página.');
    }
}

// Função para atualizar a tabela de templates com validação
function updateTemplatesTable(templates) {
    if (!Array.isArray(templates)) {
        console.error('Templates inválidos recebidos:', templates);
        return;
    }

    // Atualizar laudos
    const laudosTable = document.querySelector('#laudos table tbody');
    if (laudosTable) {
        const laudosContent = templates
            .filter(template => template && template.category === 'laudo')
            .map(template => getTemplateRow(template))
            .join('');
        laudosTable.innerHTML = laudosContent;
        console.log('Tabela de laudos atualizada');
    }

    // Atualizar frases normais
    const normalTable = document.querySelector('#normalFrases table tbody');
    if (normalTable) {
        const normalContent = templates
            .filter(template => template && template.category === 'normal')
            .map(template => getTemplateRow(template))
            .join('');
        normalTable.innerHTML = normalContent;
        console.log('Tabela de frases normais atualizada');
    }

    // Atualizar frases alteradas
    const alteradoTable = document.querySelector('#alteradoFrases table tbody');
    if (alteradoTable) {
        const alteradoContent = templates
            .filter(template => template && template.category === 'alterado')
            .map(template => getTemplateRow(template))
            .join('');
        alteradoTable.innerHTML = alteradoContent;
        console.log('Tabela de frases alteradas atualizada');
    }

    // Atualizar frases de conclusão
    const conclusaoTable = document.querySelector('#conclusaoFrases table tbody');
    if (conclusaoTable) {
        const conclusaoContent = templates
            .filter(template => template && template.category === 'conclusao')
            .map(template => getTemplateRow(template))
            .join('');
        conclusaoTable.innerHTML = conclusaoContent;
        console.log('Tabela de frases de conclusão atualizada');
    }
}

// Função helper para gerar linha da tabela com validação
function getTemplateRow(template) {
    if (!template || !template.id || !template.name) {
        console.error('Template inválido:', template);
        return '';
    }

    const content = template.content ? template.content.substring(0, 100) : '';

    return `
        <tr>
            <td>${template.name}</td>
            <td>${content}...</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-primary" onclick="exportToPDF(${template.id})" title="Exportar PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="exportToDOC(${template.id})" title="Exportar DOC">
                        <i class="fas fa-file-word"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Função para cadastrar um novo template com validação aprimorada
async function createTemplate(event) {
    event.preventDefault();
    console.log('Iniciando criação de template...');

    try {
        const name = document.getElementById('templateName').value.trim();
        const category = document.getElementById('templateCategory').value;
        const content = document.querySelector('#templateContent').value.trim();

        // Validação detalhada
        const validationErrors = [];
        if (!name) validationErrors.push('Nome é obrigatório');
        if (!category) validationErrors.push('Categoria é obrigatória');
        if (!content) validationErrors.push('Conteúdo é obrigatório');

        if (validationErrors.length > 0) {
            throw new Error('Campos obrigatórios: ' + validationErrors.join(', '));
        }

        const templateData = { name, category, content };
        console.log('Dados do template:', templateData);

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(templateData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Erro ao cadastrar template');
        }

        console.log('Template cadastrado com sucesso:', responseData);

        // Limpar formulário
        document.getElementById('templateForm').reset();

        // Recarregar lista de templates
        await loadTemplates();

        alert('Template salvo com sucesso!');

    } catch (error) {
        console.error('Erro ao cadastrar template:', error);
        alert(error.message || 'Erro ao cadastrar template. Por favor, tente novamente.');
    }
}

// Funções de exportação com tratamento de erro aprimorado
async function exportToPDF(id) {
    if (!id) {
        console.error('ID inválido para exportação PDF');
        return;
    }

    try {
        console.log(`Iniciando exportação PDF para template ${id}...`);
        const response = await fetch(`/api/templates/${id}/pdf`, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao gerar PDF: ${response.status}`);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
            throw new Error('PDF gerado está vazio');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('PDF exportado com sucesso');
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert('Erro ao exportar PDF: ' + error.message);
    }
}

async function exportToDOC(id) {
    if (!id) {
        console.error('ID inválido para exportação DOC');
        return;
    }

    try {
        console.log(`Iniciando exportação DOC para template ${id}...`);
        const response = await fetch(`/api/templates/${id}/doc`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao gerar DOC: ${response.status}`);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
            throw new Error('Documento DOC gerado está vazio');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${id}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('DOC exportado com sucesso');
    } catch (error) {
        console.error('Erro ao exportar DOC:', error);
        alert('Erro ao exportar DOC: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('templateForm');
    if (form) {
        form.addEventListener('submit', createTemplate);
        console.log('Event listener para criação de template registrado');
    } else {
        console.warn('Formulário de template não encontrado');
    }

    loadTemplates();
});