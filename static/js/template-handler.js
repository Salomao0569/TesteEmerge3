// Função para inserir template selecionado no editor
async function insertSelectedTemplate(templateId) {
    try {
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
        $('#editor').summernote('code', template.content);
    } catch (error) {
        console.error('Erro ao inserir template:', error);
        alert('Erro ao inserir template: ' + error.message);
    }
}

// Função para salvar novo template
async function saveTemplate() {
    try {
        const templateName = document.getElementById('templateName').value;
        const doctorId = document.getElementById('doctorId').value;
        const content = $('#editor').summernote('code');

        if (!templateName || !doctorId) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }

        const token = getCSRFToken();
        if (!token) {
            throw new Error('Token CSRF não disponível');
        }

        const templateData = {
            name: templateName,
            content: content,
            category: 'laudo',
            doctor_id: parseInt(doctorId)
        };

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
        alert('Template salvo com sucesso!');

        // Adicionar botões de exportação após salvar
        addExportButtons(savedTemplate.id);

        location.reload();
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert(error.message);
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('templateForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTemplate();
        });
    }

    // Verificar se o token CSRF está disponível
    const token = getCSRFToken();
    if (!token) {
        console.error('CSRF token não está disponível na página');
    }
});