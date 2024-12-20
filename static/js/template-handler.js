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

        await response.json();
        alert('Template salvo com sucesso!');
        location.reload();
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert(error.message);
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