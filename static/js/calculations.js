
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
    console.log("Iniciando cálculos...");
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    const diamDiastFinal = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSistFinal = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const espDiastSepto = parseFloat(document.getElementById('esp_diast_septo').value) || 0;
    const espDiastPPVE = parseFloat(document.getElementById('esp_diast_ppve').value) || 0;
    
    console.log("Valores obtidos:", { peso, altura, diamDiastFinal, diamSistFinal, espDiastSepto, espDiastPPVE });

    const elementos = {
        'print_volume_diast_final': '',
        'print_volume_sist_final': '',
        'print_volume_ejetado': '',
        'print_fracao_ejecao': '',
        'print_percent_encurt': '',
        'print_esp_relativa': '',
        'print_massa_ve': '',
        'print_indice_massa': '',
        'superficie': ''
    };

    // Superfície corpórea (DuBois)
    if (peso > 0 && altura > 0) {
        const superficie = 0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725);
        elementos.superficie = superficie.toFixed(2);
        
        if (diamDiastFinal > 0) {
            // Volume Diastólico Final (Teichholz)
            const volumeDiastFinal = 7 * Math.pow(diamDiastFinal / 10, 3) / (2.4 + diamDiastFinal / 10);
            elementos.print_volume_diast_final = `${Math.round(volumeDiastFinal)} mL`;

            if (diamSistFinal > 0) {
                // Volume Sistólico Final
                const volumeSistFinal = 7 * Math.pow(diamSistFinal / 10, 3) / (2.4 + diamSistFinal / 10);
                elementos.print_volume_sist_final = `${Math.round(volumeSistFinal)} mL`;

                // Volume Ejetado
                const volumeEjetado = volumeDiastFinal - volumeSistFinal;
                elementos.print_volume_ejetado = `${Math.round(volumeEjetado)} mL`;

                // Fração de Ejeção
                const fracaoEjecao = (volumeEjetado / volumeDiastFinal) * 100;
                elementos.print_fracao_ejecao = `${Math.round(fracaoEjecao)} %`;

                // Percentual de Encurtamento
                const percentEncurt = ((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100;
                elementos.print_percent_encurt = `${Math.round(percentEncurt)} %`;
            }

            if (espDiastPPVE > 0) {
                const espessuraRelativa = (2 * espDiastPPVE / diamDiastFinal).toFixed(2);
                elementos.print_esp_relativa = espessuraRelativa;
            }
        }

        if (diamDiastFinal > 0 && espDiastSepto > 0 && espDiastPPVE > 0) {
            const massaVE = calcularMassaVE();
            elementos.print_massa_ve = `${massaVE} g`;

            if (superficie > 0 && massaVE > 0) {
                const indiceMassa = (massaVE / superficie).toFixed(1);
                elementos.print_indice_massa = `${indiceMassa} g/m²`;
            }
        }
    }

    // Atualizar elementos no DOM
    Object.keys(elementos).forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento && elementos[id] !== '') {
            if (id === 'superficie') {
                elemento.value = elementos[id];
            } else {
                elemento.textContent = elementos[id];
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', calcularResultados);
    });
});
