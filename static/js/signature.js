// Função para criar a assinatura com estilo personalizado
function criarAssinatura(nome, crm, rqe) {
    console.log('Criando assinatura para:', { nome, crm, rqe });

    // Ensure we have clean data
    const nomeLimpo = nome.split('CRM:')[0].trim();
    const nomeSemPrefixo = nomeLimpo.replace(/^Dr\.?\s+/i, '').trim();

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

    // Extract CRM from text if not in dataset
    let crm = option.dataset.crm;
    let rqe = option.dataset.rqe || '';

    if (!crm && option.text.includes('CRM:')) {
        const match = option.text.match(/CRM:\s*(\d+)/);
        if (match) crm = match[1];
    }

    if (!rqe && option.text.includes('RQE:')) {
        const match = option.text.match(/RQE:\s*(\d+)/);
        if (match) rqe = match[1];
    }

    // Validação dos dados
    if (!option.text || !crm) {
        console.error('Dados do médico incompletos:', { 
            text: option.text,
            crm: crm,
            rqe: rqe,
            dataset: option.dataset 
        });
        alert('Dados do médico incompletos. Por favor, verifique o cadastro.');
        return;
    }

    console.log('Dados do médico extraídos:', { 
        text: option.text,
        crm: crm,
        rqe: rqe 
    });

    const assinaturaHTML = criarAssinatura(option.text, crm, rqe);
    const currentContent = $('#editor').summernote('code');
    $('#editor').summernote('code', currentContent + assinaturaHTML);

    console.log('Assinatura inserida com sucesso');
}

// Exportar funções para uso global
window.inserirAssinaturaMedico = inserirAssinaturaMedico;
window.criarAssinatura = criarAssinatura;