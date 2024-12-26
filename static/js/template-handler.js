// Função para inserir template selecionado no editor
async function insertSelectedTemplate(templateId) {
    try {
        console.log('Iniciando inserção do template:', templateId);
        const token = getCSRFToken();
        if (!token) {
            throw new Error('Token CSRF não disponível');
        }

        const response = await fetch(`/api/templates/${templateId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao carregar template');
        }

        const template = await response.json();
        console.log('Template carregado:', template);
        $('#editor').summernote('code', template.content);
    } catch (error) {
        console.error('Erro ao inserir template:', error);
        alert('Erro ao inserir template: ' + error.message);
    }
}

// Função para salvar template existente
async function saveTemplate() {
    try {
        console.log('Iniciando salvamento do template existente');
        const templateName = document.getElementById('templateName').value;
        const content = $('#editor').summernote('code');

        if (!templateName) {
            throw new Error('Por favor, preencha o nome do template');
        }

        const token = getCSRFToken();
        if (!token) {
            throw new Error('Token CSRF não disponível');
        }

        const templateData = {
            name: templateName,
            content: content,
            category: 'laudo'
        };

        console.log('Dados do template para salvar:', templateData);

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token,
                'Accept': 'application/json'
            },
            body: JSON.stringify(templateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao salvar template');
        }

        const savedTemplate = await response.json();
        console.log('Template salvo com sucesso:', savedTemplate);
        alert('Template salvo com sucesso!');

        location.reload();
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert(error.message);
    }
}

// Função para salvar novo template
window.saveNewTemplate = async function() {
    try {
        console.log('Iniciando salvamento do novo template');
        const templateData = {
            name: document.getElementById('newTemplateName').value,
            content: document.getElementById('templateContent').value,
            category: document.getElementById('newTemplateCategory').value,
            tags: document.getElementById('newTemplateTags').value
        };

        console.log('Dados do novo template:', templateData);

        if (!templateData.name || !templateData.content) {
            alert('Por favor, preencha o nome e o conteúdo do template');
            return;
        }

        const token = getCSRFToken();
        if (!token) {
            throw new Error('Token CSRF não disponível');
        }

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token,
                'Accept': 'application/json'
            },
            body: JSON.stringify(templateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao salvar template');
        }

        const savedTemplate = await response.json();
        console.log('Novo template salvo com sucesso:', savedTemplate);
        alert('Template salvo com sucesso!');

        // Fechar o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('saveTemplateModal'));
        modal.hide();

        // Recarregar a lista de templates
        await loadTemplates();
    } catch (error) {
        console.error('Erro ao salvar novo template:', error);
        alert(error.message);
    }
};

// Função para carregar templates
async function loadTemplates() {
    try {
        console.log('Iniciando carregamento dos templates');
        const response = await fetch('/api/templates');
        if (!response.ok) {
            throw new Error('Erro ao carregar templates');
        }
        const templates = await response.json();
        console.log('Templates carregados:', templates);

        // Atualizar interface com os templates
        updateTemplatesList(templates);
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        alert('Erro ao carregar templates: ' + error.message);
    }
}

// Função para atualizar lista de templates na interface
function updateTemplatesList(templates) {
    console.log('Atualizando lista de templates na interface');
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
        templateSelect.innerHTML = `
            <option value="">Selecione um template...</option>
            ${templates.map(template => `
                <option value="${template.id}">${template.name}</option>
            `).join('')}
        `;
    }
}

// Função para adicionar botões de exportação
function addExportButtons(templateId) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'export-buttons mt-3';
    buttonContainer.innerHTML = `
        <button onclick="exportToPDF(${templateId})" class="btn btn-danger me-2">
            <i class="fas fa-file-pdf"></i> Exportar PDF
        </button>
        <button onclick="exportToDOC(${templateId})" class="btn btn-primary">
            <i class="fas fa-file-word"></i> Exportar DOC
        </button>
    `;

    const editorContainer = document.querySelector('#editor').closest('.card-body');
    editorContainer.appendChild(buttonContainer);
}

// Função para exportar para PDF
async function exportToPDF(templateId) {
    try {
        const token = getCSRFToken();
        if (!token) {
            throw new Error('Token CSRF não disponível');
        }

        const response = await fetch(`/api/templates/${templateId}/pdf`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': token,
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

// Função para exportar para DOC
async function exportToDOC(templateId) {
    try {
        const token = getCSRFToken();
        if (!token) {
            throw new Error('Token CSRF não disponível');
        }

        const response = await fetch(`/api/templates/${templateId}/doc`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': token,
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

// Função para obter o token CSRF
function getCSRFToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
        console.error('Meta tag CSRF não encontrada');
        return null;
    }
    const token = metaTag.getAttribute('content');
    if (!token) {
        console.error('Token CSRF está vazio');
        return null;
    }
    return token;
}

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando handlers de templates');

    // Carregar templates iniciais
    loadTemplates();

    // Verificar se o token CSRF está disponível
    const token = getCSRFToken();
    if (!token) {
        console.error('CSRF token não está disponível na página');
    }
    const form = document.getElementById('templateForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTemplate();
        });
    }
});