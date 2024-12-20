// Função para obter o token CSRF da meta tag
function getCSRFToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    if (!csrfMetaTag) {
        console.error('Meta tag CSRF não encontrada');
        return null;
    }
    const csrfToken = csrfMetaTag.getAttribute('content');
    if (!csrfToken) {
        console.error('Token CSRF vazio');
        return null;
    }
    return csrfToken;
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