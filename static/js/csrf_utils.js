// Função para obter o token CSRF da meta tag ou input hidden
function getCSRFToken() {
    try {
        // Try to get from meta tag first
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (metaToken) return metaToken;

        // Try to get from form input
        const inputToken = document.querySelector('input[name="csrf_token"]')?.value;
        if (inputToken) return inputToken;

        console.error('CSRF token não encontrado');
        return null;
    } catch (error) {
        console.error('Erro ao obter CSRF token:', error);
        return null;
    }
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
    try {
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
    } catch (error) {
        console.error('Erro ao configurar CSRF token:', error);
    }
});

// Função para atualizar o token CSRF após recarregar a página
function updateCSRFToken() {
    try {
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
    } catch (error) {
        console.error('Erro ao atualizar CSRF token:', error);
    }
}

// Adicionar listener para atualização do token
document.addEventListener('DOMContentLoaded', updateCSRFToken);