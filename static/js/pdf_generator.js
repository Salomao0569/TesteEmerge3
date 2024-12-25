function gerarPDF() {
    try {
        // Coletar dados do formulário
        const dataExame = document.getElementById('dataExame').value;
        const dataFormatada = dataExame ? new Date(dataExame).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

        // Dados do paciente
        const paciente = {
            nome: document.getElementById('nome').value || 'N/D',
            dataNascimento: document.getElementById('dataNascimento').value || 'N/D',
            sexo: document.getElementById('sexo').value || 'N/D',
            peso: document.getElementById('peso').value || 'N/D',
            altura: document.getElementById('altura').value || 'N/D',
            dataExame: dataFormatada
        };

        // Medidas
        const medidas = {
            atrio: document.getElementById('atrio').value || 'N/D',
            aorta: document.getElementById('aorta').value || 'N/D',
            diamDiastFinal: document.getElementById('diam_diast_final').value || 'N/D',
            diamSistFinal: document.getElementById('diam_sist_final').value || 'N/D',
            espDiastSepto: document.getElementById('esp_diast_septo').value || 'N/D',
            espDiastPPVE: document.getElementById('esp_diast_ppve').value || 'N/D',
            vd: document.getElementById('vd').value || 'N/D'
        };

        // Cálculos
        const calculos = {
            volumeDiastFinal: document.getElementById('print_volume_diast_final').textContent || 'N/D',
            volumeSistFinal: document.getElementById('print_volume_sist_final').textContent || 'N/D',
            volumeEjetado: document.getElementById('print_volume_ejetado').textContent || 'N/D',
            fracaoEjecao: document.getElementById('print_fracao_ejecao').textContent || 'N/D',
            percentEncurt: document.getElementById('print_percent_encurt').textContent || 'N/D',
            espRelativa: document.getElementById('print_esp_relativa').textContent || 'N/D',
            massaVE: document.getElementById('print_massa_ve').textContent || 'N/D'
        };

        // Dados do médico
        const doctorSelect = document.getElementById('selectedDoctor');
        let medico = null;
        if (doctorSelect.value) {
            const selectedOption = doctorSelect.selectedOptions[0];
            medico = {
                nome: selectedOption.text,
                crm: selectedOption.dataset.crm,
                rqe: selectedOption.dataset.rqe
            };
        }

        // Conteúdo do laudo
        const editor = document.getElementById('editor');
        const laudo = editor.innerHTML;

        // Dados completos para envio
        const dadosLaudo = {
            paciente,
            medidas,
            calculos,
            medico,
            laudo
        };

        // Fazer requisição para o backend
        fetch('/gerar_pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(dadosLaudo)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao gerar PDF');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Laudo_${paciente.nome.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        })
        .catch(error => {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        });
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    }
}

function gerarDOC() {
    try {
        // Coletar dados do formulário (mesmo código usado no PDF)
        const dataExame = document.getElementById('dataExame').value;
        const dataFormatada = dataExame ? new Date(dataExame).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

        const paciente = {
            nome: document.getElementById('nome').value || 'N/D',
            dataNascimento: document.getElementById('dataNascimento').value || 'N/D',
            sexo: document.getElementById('sexo').value || 'N/D',
            peso: document.getElementById('peso').value || 'N/D',
            altura: document.getElementById('altura').value || 'N/D',
            dataExame: dataFormatada
        };

        const medidas = {
            atrio: document.getElementById('atrio').value || 'N/D',
            aorta: document.getElementById('aorta').value || 'N/D',
            diamDiastFinal: document.getElementById('diam_diast_final').value || 'N/D',
            diamSistFinal: document.getElementById('diam_sist_final').value || 'N/D',
            espDiastSepto: document.getElementById('esp_diast_septo').value || 'N/D',
            espDiastPPVE: document.getElementById('esp_diast_ppve').value || 'N/D',
            vd: document.getElementById('vd').value || 'N/D'
        };

        const calculos = {
            volumeDiastFinal: document.getElementById('print_volume_diast_final').textContent || 'N/D',
            volumeSistFinal: document.getElementById('print_volume_sist_final').textContent || 'N/D',
            volumeEjetado: document.getElementById('print_volume_ejetado').textContent || 'N/D',
            fracaoEjecao: document.getElementById('print_fracao_ejecao').textContent || 'N/D',
            percentEncurt: document.getElementById('print_percent_encurt').textContent || 'N/D',
            espRelativa: document.getElementById('print_esp_relativa').textContent || 'N/D',
            massaVE: document.getElementById('print_massa_ve').textContent || 'N/D'
        };

        const doctorSelect = document.getElementById('selectedDoctor');
        let medico = null;
        if (doctorSelect.value) {
            const selectedOption = doctorSelect.selectedOptions[0];
            medico = {
                nome: selectedOption.text,
                crm: selectedOption.dataset.crm,
                rqe: selectedOption.dataset.rqe
            };
        }

        const editor = document.getElementById('editor');
        const laudo = editor.innerHTML;

        const dadosLaudo = {
            paciente,
            medidas,
            calculos,
            medico,
            laudo
        };

        // Fazer requisição para o backend
        fetch('/gerar_doc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(dadosLaudo)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao gerar documento DOC');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Laudo_${paciente.nome.trim().replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        })
        .catch(error => {
            console.error('Erro ao gerar DOC:', error);
            alert('Erro ao gerar o documento DOC. Por favor, tente novamente.');
        });
    } catch (error) {
        console.error('Erro ao gerar DOC:', error);
        alert('Erro ao gerar o documento DOC. Por favor, tente novamente.');
    }
}

function getCSRFToken() {
    //Add CSRF token retrieval method here.  This is highly dependent on your backend setup.
    //Example if CSRF token is stored in a meta tag:
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : null;

}