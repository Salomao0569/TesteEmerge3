// Função para inserir template selecionado no editor
function insertSelectedTemplate(templateId) {
    try {
        fetch(`/api/templates/${templateId}`)
            .then(response => response.json())
            .then(template => {
                $('#editor').summernote('code', template.content);
            })
            .catch(error => {
                console.error('Erro ao carregar template:', error);
            });
    } catch (error) {
        console.error('Erro ao inserir template:', error);
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

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(templateData)
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar template');
        }

        const result = await response.json();
        alert('Template salvo com sucesso!');
        location.reload();
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert('Erro ao salvar template. Por favor, tente novamente.');
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
