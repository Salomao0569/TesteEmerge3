function gerarDOC() {
    try {
        console.log("Iniciando geração do DOC...");

        // Captura o conteúdo do editor
        const laudoContent = $('#editor').summernote('code');
        if (!laudoContent.trim()) {
            throw new Error('O conteúdo do laudo não pode estar vazio.');
        }

        // Dados do laudo
        const data = {
            laudo: laudoContent
        };

        // Envia para o backend para gerar o documento
        fetch('/gerar_doc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                if (response.headers.get('content-type')?.includes('application/json')) {
                    return response.json().then(error => {
                        throw new Error(error.error || 'Erro ao gerar o documento.');
                    });
                }
                throw new Error('Erro ao gerar o documento.');
            }
            return response.blob();
        })
        .then(blob => {
            if (!blob) {
                throw new Error('Documento gerado está vazio.');
            }
            // Gera o link de download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Laudo.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        })
        .catch(error => {
            console.error('Erro ao gerar DOC:', error);
            alert('Erro ao gerar o documento DOC: ' + error.message);
        });

    } catch (error) {
        console.error('Erro ao preparar dados:', error);
        alert('Erro ao preparar dados para geração do documento: ' + error.message);
    }
}

function getCSRFToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
        throw new Error('Meta tag CSRF não encontrada.');
    }
    return metaTag.getAttribute('content');
}