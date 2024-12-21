function calcularMassaVE() {
    const DDVE = Number(document.getElementById('diam_diast_final').value);
    const PPVE = Number(document.getElementById('esp_diast_ppve').value);
    const SIV = Number(document.getElementById('esp_diast_septo').value);

    if (DDVE > 0 && PPVE > 0 && SIV > 0) {
        const DDVEcm = DDVE / 10;
        const PPVEcm = PPVE / 10;
        const SIVcm = SIV / 10;
        return Math.round(0.8 * (1.04 * Math.pow((DDVEcm + PPVEcm + SIVcm), 3) - Math.pow(DDVEcm, 3)) + 0.6);
    }
    return 0;
}

function calcularResultados() {
    const elementos = {
        peso: document.getElementById('peso'),
        altura: document.getElementById('altura'),
        diamDiastFinal: document.getElementById('diam_diast_final'),
        diamSistFinal: document.getElementById('diam_sist_final'),
        espDiastSepto: document.getElementById('esp_diast_septo'),
        espDiastPPVE: document.getElementById('esp_diast_ppve'),
        superficie: document.getElementById('superficie'),
        printVolumeDiastFinal: document.getElementById('print_volume_diast_final'),
        printVolumeSistFinal: document.getElementById('print_volume_sist_final'),
        printVolumeEjetado: document.getElementById('print_volume_ejetado'),
        printFracaoEjecao: document.getElementById('print_fracao_ejecao'),
        printPercentEncurt: document.getElementById('print_percent_encurt'),
        printEspRelativa: document.getElementById('print_esp_relativa'),
        printMassaVE: document.getElementById('print_massa_ve'),
        printIndiceMassa: document.getElementById('print_indice_massa'),
        analiseFeDiv: document.getElementById('analise_fracao_ejecao'),
        sexo: document.getElementById('sexo')
    };

    // Verificar se todos os elementos necessários existem
    if (!Object.values(elementos).every(el => el)) {
        console.error('Alguns elementos necessários não foram encontrados no DOM');
        return;
    }

    const peso = parseFloat(elementos.peso.value) || 0;
    const altura = parseFloat(elementos.altura.value) || 0;
    const diamDiastFinal = parseFloat(elementos.diamDiastFinal.value) || 0;
    const diamSistFinal = parseFloat(elementos.diamSistFinal.value) || 0;
    const espDiastSepto = parseFloat(elementos.espDiastSepto.value) || 0;
    const espDiastPPVE = parseFloat(elementos.espDiastPPVE.value) || 0;

    // Superfície corpórea (DuBois)
    let superficie = 0;
    if (peso > 0 && altura > 0) {
        superficie = Math.round((0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725)) * 100) / 100;
        elementos.superficie.value = superficie.toFixed(2);
    }

    // Volume Diastólico Final (Teichholz)
    let volumeDiastFinal = 0;
    if (diamDiastFinal > 0) {
        volumeDiastFinal = Math.round(7 * Math.pow(diamDiastFinal / 10, 3) / (2.4 + diamDiastFinal / 10));
        elementos.printVolumeDiastFinal.textContent = volumeDiastFinal + ' mL';
    }

    // Volume Sistólico Final
    let volumeSistFinal = 0;
    if (diamSistFinal > 0) {
        volumeSistFinal = Math.round(7 * Math.pow(diamSistFinal / 10, 3) / (2.4 + diamSistFinal / 10));
        elementos.printVolumeSistFinal.textContent = volumeSistFinal + ' mL';
    }

    // Volume Ejetado e Fração de Ejeção
    if (volumeDiastFinal > 0 && volumeSistFinal > 0) {
        const volumeEjetado = volumeDiastFinal - volumeSistFinal;
        elementos.printVolumeEjetado.textContent = volumeEjetado + ' mL';

        const fracaoEjecao = Math.round((volumeEjetado / volumeDiastFinal) * 100);
        elementos.printFracaoEjecao.textContent = fracaoEjecao + ' %';

        const sexo = elementos.sexo.value;
        if (!elementos.analiseFeDiv) return;

        let classificacao = '';
        if (sexo === 'M') {
            if (fracaoEjecao >= 52 && fracaoEjecao <= 72) classificacao = 'normal';
            else if (fracaoEjecao > 72) classificacao = 'aumentada';
            else if (fracaoEjecao >= 41 && fracaoEjecao < 52) classificacao = 'disfunção discreta';
            else if (fracaoEjecao >= 30 && fracaoEjecao < 41) classificacao = 'disfunção moderada';
            else if (fracaoEjecao < 30) classificacao = 'disfunção grave';
        } else if (sexo === 'F') {
            if (fracaoEjecao >= 54 && fracaoEjecao <= 74) classificacao = 'normal';
            else if (fracaoEjecao > 74) classificacao = 'aumentada';
            else if (fracaoEjecao >= 41 && fracaoEjecao < 54) classificacao = 'disfunção discreta';
            else if (fracaoEjecao >= 30 && fracaoEjecao < 41) classificacao = 'disfunção moderada';
            else if (fracaoEjecao < 30) classificacao = 'disfunção grave';
        }

        if (classificacao) {
            elementos.analiseFeDiv.value = `Fração de ejeção do ventrículo esquerdo ${classificacao}.`;
            elementos.analiseFeDiv.className = 'alert alert-info py-1';
        }
    }

    // Percentual de Encurtamento
    if (diamDiastFinal > 0 && diamSistFinal > 0) {
        const percentEncurt = Math.round(((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100);
        elementos.printPercentEncurt.textContent = percentEncurt + ' %';
    }

    // Espessura Relativa
    if (diamDiastFinal > 0 && espDiastPPVE > 0) {
        const espessuraRelativa = Math.round((2 * espDiastPPVE / diamDiastFinal) * 100) / 100;
        elementos.printEspRelativa.textContent = espessuraRelativa.toFixed(2);
    }

    // Massa VE e Índice de Massa
    if (diamDiastFinal > 0 && espDiastSepto > 0 && espDiastPPVE > 0) {
        const massaVE = calcularMassaVE();
        elementos.printMassaVE.textContent = massaVE + ' g';

        if (superficie > 0) {
            const indiceMassa = Math.round((massaVE / superficie) * 10) / 10;
            elementos.printIndiceMassa.textContent = indiceMassa + ' g/m²';
        }
    }
}

function classificarAtrioEsquerdo() {
    const atrio = parseFloat(document.getElementById('atrio').value) || 0;
    const sexo = document.getElementById('sexo').value;
    const classificacaoDiv = document.getElementById('classificacao_ae');

    if (atrio === 0 || !sexo) {
        classificacaoDiv.textContent = '';
        return;
    }

    let classificacao = '';
    if (sexo === 'M') {
        if (atrio <= 40) classificacao = 'Normal';
        else if (atrio <= 46) classificacao = 'Aumento discreto';
        else if (atrio <= 52) classificacao = 'Aumento moderado';
        else classificacao = 'Aumento importante';
    } else if (sexo === 'F') {
        if (atrio <= 38) classificacao = 'Normal';
        else if (atrio <= 42) classificacao = 'Aumento discreto';
        else if (atrio <= 46) classificacao = 'Aumento moderado';
        else classificacao = 'Aumento importante';
    }

    classificacaoDiv.textContent = `Classificação: ${classificacao}`;
    classificacaoDiv.className = 'alert alert-info py-1';
}

function classificarVentriculoEsquerdo() {
    const diamDiast = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSist = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const sexo = document.getElementById('sexo').value;
    const classificacaoVEDiastDiv = document.getElementById('classificacao_ve_diast');
    const classificacaoVESistDiv = document.getElementById('classificacao_ve_sist');
    const analiseDiastDiv = document.getElementById('analise_ve_diast');
    const analiseSistDiv = document.getElementById('analise_ve_sist');

    if (!classificacaoVEDiastDiv || !classificacaoVESistDiv || !analiseDiastDiv || !analiseSistDiv || !sexo) {
        console.error('Elementos necessários não encontrados');
        return;
    }

    if (diamDiast === 0 && diamSist === 0) {
        classificacaoVEDiastDiv.textContent = '';
        classificacaoVESistDiv.textContent = '';
        analiseDiastDiv.textContent = '';
        analiseSistDiv.textContent = '';
        return;
    }

    let classificacaoDiast = '';
    let classificacaoSist = '';

    if (sexo === 'M') {
        // Classificação do diâmetro diastólico para homens
        if (diamDiast <= 59) classificacaoDiast = 'Normal';
        else if (diamDiast <= 63) classificacaoDiast = 'Discretamente aumentado';
        else if (diamDiast <= 68) classificacaoDiast = 'Moderadamente aumentado';
        else classificacaoDiast = 'Acentuadamente aumentado';

        // Classificação do diâmetro sistólico para homens
        if (diamSist <= 40) classificacaoSist = 'Normal';
        else if (diamSist <= 45) classificacaoSist = 'Discretamente aumentado';
        else if (diamSist <= 50) classificacaoSist = 'Moderadamente aumentado';
        else classificacaoSist = 'Acentuadamente aumentado';
    } else if (sexo === 'F') {
        // Classificação do diâmetro diastólico para mulheres
        if (diamDiast <= 53) classificacaoDiast = 'Normal';
        else if (diamDiast <= 57) classificacaoDiast = 'Discretamente aumentado';
        else if (diamDiast <= 62) classificacaoDiast = 'Moderadamente aumentado';
        else classificacaoDiast = 'Acentuadamente aumentado';

        // Classificação do diâmetro sistólico para mulheres
        if (diamSist <= 35) classificacaoSist = 'Normal';
        else if (diamSist <= 40) classificacaoSist = 'Discretamente aumentado';
        else if (diamSist <= 45) classificacaoSist = 'Moderadamente aumentado';
        else classificacaoSist = 'Acentuadamente aumentado';
    }

    if (diamDiast > 0) {
        classificacaoVEDiastDiv.textContent = `Classificação: ${classificacaoDiast}`;
        classificacaoVEDiastDiv.className = 'alert alert-info py-1';
        analiseDiastDiv.textContent = `Diâmetro diastólico do ventrículo esquerdo ${classificacaoDiast.toLowerCase()}.`;
    }

    if (diamSist > 0) {
        classificacaoVESistDiv.textContent = `Classificação: ${classificacaoSist}`;
        classificacaoVESistDiv.className = 'alert alert-info py-1';
        analiseSistDiv.textContent = `Diâmetro sistólico do ventrículo esquerdo ${classificacaoSist.toLowerCase()}.`;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    const sexoSelect = document.getElementById('sexo');

    if (inputs && sexoSelect) {
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                calcularResultados();
                if (input.id === 'atrio') {
                    classificarAtrioEsquerdo();
                }
                if (input.id === 'diam_diast_final' || input.id === 'diam_sist_final') {
                    classificarVentriculoEsquerdo();
                }
            });
        });

        sexoSelect.addEventListener('change', () => {
            classificarAtrioEsquerdo();
            classificarVentriculoEsquerdo();
            calcularResultados();
        });
    } else {
        console.error('Elementos necessários não encontrados durante a inicialização');
    }
});