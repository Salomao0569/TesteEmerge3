// Função para obter o token CSRF da meta tag
function getCSRFToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    if (!csrfMetaTag) {
        throw new Error('Meta tag CSRF não encontrada');
    }
    const csrfToken = csrfMetaTag.getAttribute('content');
    if (!csrfToken) {
        throw new Error('Token CSRF vazio');
    }
    return csrfToken;
}

// Função para adicionar o token CSRF aos headers
function addCSRFToken(headers = {}) {
    try {
        const token = getCSRFToken();
        return {
            ...headers,
            'X-CSRFToken': token
        };
    } catch (error) {
        console.error('Erro ao adicionar token CSRF:', error);
        throw error;
    }
}
