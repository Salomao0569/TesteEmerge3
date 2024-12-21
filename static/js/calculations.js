function calcularMassaVE() {
    const DDVE = Number(document.getElementById('diam_diast_final').value);
    const PPVE = Number(document.getElementById('esp_diast_ppve').value);
    const SIV = Number(document.getElementById('esp_diast_septo').value);

    if (DDVE > 0 && PPVE > 0 && SIV > 0) {
        // Conversão para centímetros
        const DDVEcm = DDVE / 10;
        const PPVEcm = PPVE / 10;
        const SIVcm = SIV / 10;

        // Fórmula de Devereux modificada
        return Math.round(0.8 * (1.04 * Math.pow((DDVEcm + PPVEcm + SIVcm), 3) - Math.pow(DDVEcm, 3)) + 0.6);
    }
    return 0;
}

function setElementText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

function setElementValue(element, value) {
    if (element) {
        element.value = value;
    }
}

function getElementValue(element) {
    return element ? (parseFloat(element.value) || 0) : 0;
}

function calcularSuperficieCorporea(peso, altura) {
    // Fórmula de DuBois
    return Math.round((0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725)) * 100) / 100;
}

function calcularVolumeDiastolicoFinal(diametro) {
    // Fórmula de Teichholz modificada
    const diametroCm = diametro / 10;
    return Math.round((7 / (2.4 + diametroCm)) * Math.pow(diametroCm, 3));
}

function calcularVolumeSistolicoFinal(diametro) {
    // Fórmula de Teichholz modificada
    const diametroCm = diametro / 10;
    return Math.round((7 / (2.4 + diametroCm)) * Math.pow(diametroCm, 3));
}

function calcularResultados() {
    // Obter elementos do DOM
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
        classificacaoFe: document.getElementById('classificacao_fe'),
        sexo: document.getElementById('sexo')
    };

    // Verificar elementos essenciais
    if (!elementos.diamDiastFinal || !elementos.diamSistFinal) {
        console.error('Elementos essenciais não encontrados');
        return;
    }

    // Obter valores
    const peso = getElementValue(elementos.peso);
    const altura = getElementValue(elementos.altura);
    const diamDiastFinal = getElementValue(elementos.diamDiastFinal);
    const diamSistFinal = getElementValue(elementos.diamSistFinal);
    const espDiastSepto = getElementValue(elementos.espDiastSepto);
    const espDiastPPVE = getElementValue(elementos.espDiastPPVE);

    // Superfície corpórea (DuBois)
    if (peso > 0 && altura > 0) {
        const superficie = calcularSuperficieCorporea(peso, altura);
        setElementValue(elementos.superficie, superficie.toFixed(2));
    }

    // Volume Diastólico Final (Teichholz)
    let volumeDiastFinal = 0;
    if (diamDiastFinal > 0) {
        volumeDiastFinal = calcularVolumeDiastolicoFinal(diamDiastFinal);
        setElementText(elementos.printVolumeDiastFinal, `${volumeDiastFinal} mL`);
    }

    // Volume Sistólico Final (Teichholz)
    let volumeSistFinal = 0;
    if (diamSistFinal > 0) {
        volumeSistFinal = calcularVolumeSistolicoFinal(diamSistFinal);
        setElementText(elementos.printVolumeSistFinal, `${volumeSistFinal} mL`);
    }

    // Cálculos da fração de ejeção e volume ejetado
    if (volumeDiastFinal > 0 && volumeSistFinal > 0) {
        const volumeEjetado = volumeDiastFinal - volumeSistFinal;
        setElementText(elementos.printVolumeEjetado, `${volumeEjetado} mL`);

        // Fração de Ejeção (%)
        const fracaoEjecao = Math.round((volumeEjetado / volumeDiastFinal) * 100);
        setElementText(elementos.printFracaoEjecao, `${fracaoEjecao} %`);

        // Classificação da Fração de Ejeção
        if (elementos.classificacaoFe && elementos.sexo) {
            const sexo = elementos.sexo.value;
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
                setElementText(elementos.classificacaoFe, `Fração de ejeção do ventrículo esquerdo ${classificacao}.`);
            }
        }
    }

    // Percentual de Encurtamento
    if (diamDiastFinal > 0 && diamSistFinal > 0) {
        const percentEncurt = Math.round(((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100);
        setElementText(elementos.printPercentEncurt, `${percentEncurt} %`);
    }

    // Espessura Relativa
    if (diamDiastFinal > 0 && espDiastPPVE > 0) {
        // Fórmula corrigida: (2 × PPVE) / DDVE
        const espessuraRelativa = Math.round((2 * espDiastPPVE / diamDiastFinal) * 100) / 100;
        setElementText(elementos.printEspRelativa, espessuraRelativa.toFixed(2));
    }

    // Massa do VE e Índice de Massa
    const massaVE = calcularMassaVE();
    if (massaVE > 0) {
        setElementText(elementos.printMassaVE, `${massaVE} g`);

        const superficie = parseFloat(elementos.superficie?.value || 0);
        if (superficie > 0) {
            const indiceMassa = Math.round((massaVE / superficie) * 10) / 10;
            setElementText(elementos.printIndiceMassa, `${indiceMassa} g/m²`);
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    const sexoSelect = document.getElementById('sexo');

    if (inputs.length > 0 && sexoSelect) {
        inputs.forEach(input => {
            input.addEventListener('input', calcularResultados);
        });

        sexoSelect.addEventListener('change', calcularResultados);
    } else {
        console.error('Elementos necessários não encontrados durante a inicialização');
    }
});