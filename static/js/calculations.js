
function calcularMassaVE() {
    const DDVE = parseFloat(document.getElementById('diam_diast_final')?.value) || 0;
    const PPVE = parseFloat(document.getElementById('esp_diast_ppve')?.value) || 0;
    const SIV = parseFloat(document.getElementById('esp_diast_septo')?.value) || 0;

    if (DDVE > 0 && PPVE > 0 && SIV > 0) {
        const DDVEcm = DDVE / 10;
        const PPVEcm = PPVE / 10;
        const SIVcm = SIV / 10;
        return Math.round(0.8 * (1.04 * Math.pow((DDVEcm + PPVEcm + SIVcm), 3) - Math.pow(DDVEcm, 3)) + 0.6);
    }
    return 0;
}

function calcularResultados() {
    const getElement = (id) => document.getElementById(id);
    const getValue = (element) => element ? parseFloat(element.value) || 0 : 0;
    const setText = (element, text) => { if (element) element.textContent = text };

    const elementos = {
        peso: getElement('peso'),
        altura: getElement('altura'),
        diamDiastFinal: getElement('diam_diast_final'),
        diamSistFinal: getElement('diam_sist_final'),
        espDiastSepto: getElement('esp_diast_septo'),
        espDiastPPVE: getElement('esp_diast_ppve'),
        superficie: getElement('superficie'),
        printVolumeDiastFinal: getElement('print_volume_diast_final'),
        printVolumeSistFinal: getElement('print_volume_sist_final'),
        printVolumeEjetado: getElement('print_volume_ejetado'),
        printFracaoEjecao: getElement('print_fracao_ejecao'),
        printPercentEncurt: getElement('print_percent_encurt'),
        printEspRelativa: getElement('print_esp_relativa'),
        printMassaVE: getElement('print_massa_ve'),
        printIndiceMassa: getElement('print_indice_massa'),
        analiseFeDiv: getElement('analise_fracao_ejecao'),
        sexo: getElement('sexo')
    };

    const peso = getValue(elementos.peso);
    const altura = getValue(elementos.altura);
    const diamDiastFinal = getValue(elementos.diamDiastFinal);
    const diamSistFinal = getValue(elementos.diamSistFinal);
    const espDiastSepto = getValue(elementos.espDiastSepto);
    const espDiastPPVE = getValue(elementos.espDiastPPVE);

    // Superfície corpórea (DuBois)
    if (peso > 0 && altura > 0) {
        const superficie = Math.round((0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725)) * 100) / 100;
        if (elementos.superficie) elementos.superficie.value = superficie.toFixed(2);
    }

    // Volume Diastólico Final (Teichholz)
    let volumeDiastFinal = 0;
    if (diamDiastFinal > 0) {
        volumeDiastFinal = Math.round(7 * Math.pow(diamDiastFinal / 10, 3) / (2.4 + diamDiastFinal / 10));
        setText(elementos.printVolumeDiastFinal, volumeDiastFinal + ' mL');
    }

    // Volume Sistólico Final
    let volumeSistFinal = 0;
    if (diamSistFinal > 0) {
        volumeSistFinal = Math.round(7 * Math.pow(diamSistFinal / 10, 3) / (2.4 + diamSistFinal / 10));
        setText(elementos.printVolumeSistFinal, volumeSistFinal + ' mL');
    }

    // Cálculos da análise
    if (volumeDiastFinal > 0 && volumeSistFinal > 0 && elementos.analiseFeDiv) {
        const volumeEjetado = volumeDiastFinal - volumeSistFinal;
        setText(elementos.printVolumeEjetado, volumeEjetado + ' mL');

        const fracaoEjecao = Math.round((volumeEjetado / volumeDiastFinal) * 100);
        setText(elementos.printFracaoEjecao, fracaoEjecao + ' %');

        const sexo = elementos.sexo?.value;
        if (sexo) {
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
    }

    if (diamDiastFinal > 0 && diamSistFinal > 0) {
        const percentEncurt = Math.round(((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100);
        setText(elementos.printPercentEncurt, percentEncurt + ' %');
    }

    if (diamDiastFinal > 0 && espDiastPPVE > 0) {
        const espessuraRelativa = Math.round((2 * espDiastPPVE / diamDiastFinal) * 100) / 100;
        setText(elementos.printEspRelativa, espessuraRelativa.toFixed(2));
    }

    const massaVE = calcularMassaVE();
    if (massaVE > 0) {
        setText(elementos.printMassaVE, massaVE + ' g');
        if (elementos.superficie?.value > 0) {
            const indiceMassa = Math.round((massaVE / parseFloat(elementos.superficie.value)) * 10) / 10;
            setText(elementos.printIndiceMassa, indiceMassa + ' g/m²');
        }
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
    }
});
