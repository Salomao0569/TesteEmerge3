// Função para criar a assinatura com estilo personalizado
function criarAssinatura(nome, crm, rqe) {
    console.log('Criando assinatura para:', { nome, crm, rqe });

    // Remove 'Dr.' prefix if it exists to avoid duplication
    const nomeSemPrefixo = nome.replace(/^Dr\.?\s+/i, '').trim();

    return `
        <div class="assinatura">
            <hr class="linha-superior">
            <div class="nome">Dr. ${nomeSemPrefixo}</div>
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

    console.log('Opção selecionada:', option);
    console.log('Dataset:', option.dataset);

    const medicName = option.text;
    const crm = option.dataset.crm;
    const rqe = option.dataset.rqe || ''; // RQE é opcional

    // Validação dos dados
    if (!medicName || !crm) {
        console.error('Dados do médico incompletos:', { medicName, crm, rqe });
        alert('Dados do médico incompletos. Por favor, verifique o cadastro.');
        return;
    }

    console.log('Dados do médico:', { medicName, crm, rqe });

    const assinaturaHTML = criarAssinatura(medicName, crm, rqe);
    const currentContent = $('#editor').summernote('code');
    $('#editor').summernote('code', currentContent + assinaturaHTML);

    console.log('Assinatura inserida com sucesso');
}

// Exportar funções para uso global
window.inserirAssinaturaMedico = inserirAssinaturaMedico;
window.criarAssinatura = criarAssinatura;