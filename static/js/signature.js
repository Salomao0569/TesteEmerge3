// Função para criar a assinatura com estilo personalizado
function criarAssinatura(nome, crm, rqe) {
    console.log('Criando assinatura para:', nome, crm, rqe);
    return `
        <div class="assinatura">
            <hr class="linha-superior">
            <div class="nome">Dr. ${nome}</div>
            <div class="registro">CRM: ${crm}${rqe ? ` / RQE: ${rqe}` : ''}</div>
        </div>
    `;
}

// Função para inserir assinatura no editor
function inserirAssinaturaMedico() {
    console.log('Iniciando inserção de assinatura');
    const select = document.getElementById('selectedDoctor');
    if (!select) {
        console.error('Elemento select não encontrado');
        return;
    }

    const option = select.options[select.selectedIndex];
    if (!option || !option.value) {
        alert('Por favor, selecione um médico responsável');
        return;
    }

    const medicName = option.text.replace(/^Dr\.?\s+/i, '').trim();
    const crm = option.dataset.crm;
    const rqe = option.dataset.rqe;

    console.log('Dados do médico:', { medicName, crm, rqe });

    const assinaturaHTML = criarAssinatura(medicName, crm, rqe);
    const currentContent = $('#editor').summernote('code');
    $('#editor').summernote('code', currentContent + assinaturaHTML);
    
    console.log('Assinatura inserida com sucesso');
}

// Exportar funções para uso global
window.inserirAssinaturaMedico = inserirAssinaturaMedico;
window.criarAssinatura = criarAssinatura;
