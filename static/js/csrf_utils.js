// Função para obter o token CSRF da meta tag
function getCSRFToken() {
    // Try to get from meta tag first
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    if (csrfMetaTag) {
        const token = csrfMetaTag.getAttribute('content');
        if (token) return token;
    }

    // Try to get from hidden input field
    const csrfInput = document.querySelector('input[name="csrf_token"]');
    if (csrfInput) {
        const token = csrfInput.value;
        if (token) return token;
    }

    // Try to get from cookie
    const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='));
    if (csrfCookie) {
        const token = csrfCookie.split('=')[1];
        if (token) return token;
    }

    console.error('CSRF token não encontrado em nenhuma fonte');
    return null;
}

// Função para adicionar o token CSRF aos headers
function addCSRFToken(headers = {}) {
    const token = getCSRFToken();
    if (!token) {
        console.error('Token CSRF não disponível');
        return headers;
    }
    return {
        ...headers,
        'X-CSRFToken': token
    };
}

// Configurar CSRF token para todas as requisições AJAX
$(document).ready(function() {
    const token = getCSRFToken();
    if (token) {
        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-CSRFToken', token);
            }
        });
    } else {
        console.error('Não foi possível configurar o token CSRF para requisições AJAX');
    }
});

// Função para atualizar o token CSRF após recarregar a página
function updateCSRFToken() {
    const token = getCSRFToken();
    if (token) {
        // Atualizar meta tag
        let metaTag = document.querySelector('meta[name="csrf-token"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'csrf-token';
            document.head.appendChild(metaTag);
        }
        metaTag.content = token;

        // Atualizar input hidden
        let inputField = document.querySelector('input[name="csrf_token"]');
        if (!inputField) {
            inputField = document.createElement('input');
            inputField.type = 'hidden';
            inputField.name = 'csrf_token';
            document.body.appendChild(inputField);
        }
        inputField.value = token;
    }
}

// Adicionar listener para atualização do token
document.addEventListener('DOMContentLoaded', updateCSRFToken);