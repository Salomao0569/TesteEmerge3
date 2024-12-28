function gerarDOC() {
    try {
        console.log("Iniciando geração do DOC...");

        // Coletar dados do formulário
        const dataExame = document.getElementById('dataExame').value;
        const dataFormatada = dataExame ? new Date(dataExame).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

        // Dados do paciente
        const paciente = {
            nome: document.getElementById('nome').value || 'N/D',
            dataNascimento: document.getElementById('dataNascimento').value || 'N/D',
            sexo: document.getElementById('sexo').value || 'N/D',
            peso: document.getElementById('peso').value ? `${document.getElementById('peso').value} kg` : 'N/D',
            altura: document.getElementById('altura').value ? `${document.getElementById('altura').value} cm` : 'N/D',
            dataExame: dataFormatada
        };
        console.log('Dados do paciente:', paciente);

        // Dados do médico
        const doctorSelect = document.getElementById('selectedDoctor');
        let medico = null;

        if (!doctorSelect) {
            console.error('Elemento select do médico não encontrado');
            throw new Error('Elemento de seleção do médico não encontrado');
        }

        if (!doctorSelect.value) {
            console.error('Nenhum médico selecionado');
            throw new Error('Por favor, selecione um médico responsável');
        }

        console.log('Opção selecionada:', doctorSelect.selectedOptions[0].text);

        const selectedOption = doctorSelect.selectedOptions[0];
        const optionText = selectedOption.text;

        // Regex melhorada para extrair CRM e RQE
        const crmMatch = optionText.match(/CRM:\s*([\dA-Za-z-]+)/i);
        const rqeMatch = optionText.match(/RQE:\s*(\d+)/i);
        const nomeMedico = optionText.split('CRM:')[0].replace(/^Dr\.?\s+/i, '').trim();

        if (!crmMatch) {
            console.error('CRM não encontrado no texto:', optionText);
            throw new Error('CRM do médico não encontrado no texto selecionado');
        }

        medico = {
            nome: nomeMedico,
            crm: crmMatch[1],
            rqe: rqeMatch ? rqeMatch[1] : ''
        };

        console.log('Dados do médico extraídos:', medico);

        // Conteúdo do editor
        const laudoContent = $('#editor').summernote('code');
        if (!laudoContent.trim()) {
            throw new Error('O conteúdo do laudo não pode estar vazio');
        }
        console.log('Conteúdo do editor recuperado');

        // Preparar dados para envio
        const data = {
            paciente: paciente,
            medidas: {
                atrio: document.getElementById('atrio').value || 'N/D',
                aorta: document.getElementById('aorta').value || 'N/D',
                diamDiastFinal: document.getElementById('diam_diast_final').value || 'N/D',
                diamSistFinal: document.getElementById('diam_sist_final').value || 'N/D',
                espDiastSepto: document.getElementById('esp_diast_septo').value || 'N/D',
                espDiastPPVE: document.getElementById('esp_diast_ppve').value || 'N/D',
                vd: document.getElementById('vd').value || 'N/D'
            },
            calculos: {
                volumeDiastFinal: document.getElementById('print_volume_diast_final').textContent || 'N/D',
                volumeSistFinal: document.getElementById('print_volume_sist_final').textContent || 'N/D',
                volumeEjetado: document.getElementById('print_volume_ejetado').textContent || 'N/D',
                fracaoEjecao: document.getElementById('print_fracao_ejecao').textContent || 'N/D',
                percentEncurt: document.getElementById('print_percent_encurt').textContent || 'N/D',
                espRelativa: document.getElementById('print_esp_relativa').textContent || 'N/D',
                massaVE: document.getElementById('print_massa_ve').textContent || 'N/D'
            },
            laudo: laudoContent,
            medico: medico
        };

        console.log('Dados completos para envio:', data);

        // Enviar requisição
        fetch('/gerar_doc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Resposta recebida:', response);
            if (!response.ok) {
                if (response.headers.get('content-type')?.includes('application/json')) {
                    return response.json().then(error => {
                        throw new Error(error.error || 'Erro ao gerar o documento');
                    });
                }
                throw new Error('Erro ao gerar o documento');
            }
            return response.blob();
        })
        .then(blob => {
            console.log('Blob recebido:', blob);
            if (!blob) {
                throw new Error('Documento gerado está vazio');
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Laudo_${paciente.nome.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            console.log('Download iniciado com sucesso');
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
        throw new Error('Meta tag CSRF não encontrada');
    }
    return metaTag.getAttribute('content');
}