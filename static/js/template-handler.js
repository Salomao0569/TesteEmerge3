// Função para inserir template selecionado no editor
function insertSelectedTemplate(templateId) {
    try {
        fetch(`/api/templates/${templateId}`, {
            headers: addCSRFToken({
                'Content-Type': 'application/json'
            })
        })
        .then(response => response.json())
        .then(template => {
            if (template.error) {
                throw new Error(template.error);
            }
            $('#editor').summernote('code', template.content);
        })
        .catch(error => {
            console.error('Erro ao carregar template:', error);
            alert('Erro ao carregar template: ' + error.message);
        });
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

        if (!templateName || !doctorId) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        const templateData = {
            name: templateName,
            content: $('#editor').summernote('code'),
            category: 'laudo',
            doctor_id: parseInt(doctorId)
        };

        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            throw new Error('Token CSRF não encontrado');
        }

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: addCSRFToken({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(templateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao salvar template');
        }

        const result = await response.json();
        alert('Template salvo com sucesso!');
        location.reload();
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert('Erro ao salvar template: ' + error.message);
    }
}

// Função para obter o token CSRF
function getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
        console.error('Meta tag CSRF não encontrada');
        return '';
    }
    return metaTag.getAttribute('content');
}

// Helper function to add CSRF token to headers
function addCSRFToken(headers) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }
    return headers;
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
});