// Função para criar a assinatura com estilo personalizado
function criarAssinatura(nome, crm, rqe) {
    console.log('Criando assinatura para:', { nome, crm, rqe });

    // Ensure we have clean data
    const nomeLimpo = nome.split('CRM:')[0].trim();
    const nomeSemPrefixo = nomeLimpo.replace(/^Dr\.?\s+/i, '').trim();

    const dadosMedico = `
        <div class="assinatura">
            <hr class="linha-superior">
            <div class="nome">Dr. ${nomeSemPrefixo}</div>
            <div class="registro">CRM: ${crm}${rqe ? `/RQE: ${rqe}` : ''}</div>
        </div>
    `;

    return dadosMedico;
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
    const nome = option.text;

    if (!crm && option.text.includes('CRM:')) {
        const match = option.text.match(/CRM:\s*(\d+)/);
        if (match) crm = match[1];
    }

    if (!rqe && option.text.includes('RQE:')) {
        const match = option.text.match(/RQE:\s*(\d+)/);
        if (match) rqe = match[1];
    }

    // Validação dos dados
    if (!nome || !crm) {
        console.error('Dados do médico incompletos:', { 
            nome: nome,
            crm: crm,
            rqe: rqe,
            dataset: option.dataset 
        });
        alert('Dados do médico incompletos. Por favor, verifique o cadastro.');
        return;
    }

    console.log('Dados do médico extraídos:', { 
        nome: nome,
        crm: crm,
        rqe: rqe 
    });

    const currentContent = $('#editor').summernote('code');
    const assinaturaHTML = criarAssinatura(nome, crm, rqe);
    $('#editor').summernote('code', currentContent + assinaturaHTML);

    console.log('Assinatura inserida com sucesso');
}

// Exportar funções para uso global
window.inserirAssinaturaMedico = inserirAssinaturaMedico;
window.criarAssinatura = criarAssinatura;