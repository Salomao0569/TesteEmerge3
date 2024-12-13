function calcularMassaVE() {
    const DDVE = Number(document.getElementById('diam_diast_final').value) / 10;
    const PPVE = Number(document.getElementById('esp_diast_ppve').value) / 10;
    const SIV = Number(document.getElementById('esp_diast_septo').value) / 10;
    
    // Fórmula de Devereux com arredondamento para número inteiro
    return Math.round(0.8 * (1.04 * Math.pow((DDVE + PPVE + SIV), 3) - Math.pow(DDVE, 3)) + 0.6);
}

function calcularResultados() {
    // Recupera valores dos elementos
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    const diamDiastFinal = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSistFinal = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const espDiastSepto = parseFloat(document.getElementById('esp_diast_septo').value) || 0;
    const espDiastPPVE = parseFloat(document.getElementById('esp_diast_ppve').value) || 0;

    // Cálculo da superfície corpórea (DuBois)
    if (peso > 0 && altura > 0) {
        const superficie = 0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725);
        document.getElementById('superficie').value = superficie.toFixed(2);

        if (diamDiastFinal > 0) {
            // Volume Diastólico Final (Teichholz)
            const volumeDiastFinal = 7 * Math.pow(diamDiastFinal / 10, 3) / (2.4 + diamDiastFinal / 10);
            document.getElementById('print_volume_diast_final').textContent = `${Math.round(volumeDiastFinal)} mL`;

            if (diamSistFinal > 0) {
                // Volume Sistólico Final
                const volumeSistFinal = 7 * Math.pow(diamSistFinal / 10, 3) / (2.4 + diamSistFinal / 10);
                document.getElementById('print_volume_sistolico').textContent = `${Math.round(volumeSistFinal)} mL`;

                // Volume Ejetado
                const volumeEjetado = volumeDiastFinal - volumeSistFinal;
                document.getElementById('print_volume_ejetado').textContent = `${Math.round(volumeEjetado)} mL`;

                // Fração de Ejeção
                const fracaoEjecao = (volumeEjetado / volumeDiastFinal) * 100;
                document.getElementById('print_fracao_ejecao').textContent = `${Math.round(fracaoEjecao)} %`;

                // Percentual de Encurtamento
                const percentEncurt = ((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100;
                document.getElementById('print_percent_encurt').textContent = `${Math.round(percentEncurt)} %`;
            }

            // Espessura Relativa da Parede
            if (espDiastPPVE > 0) {
                const espessuraRelativa = (2 * espDiastPPVE / diamDiastFinal).toFixed(2);
                document.getElementById('print_esp_relativa').textContent = espessuraRelativa;
            }

            // Massa do VE e Índice de Massa
            if (espDiastSepto > 0 && espDiastPPVE > 0) {
                const massaVE = calcularMassaVE();
                document.getElementById('print_massa_ve').textContent = `${massaVE} g`;

                const superficie = parseFloat(document.getElementById('superficie').value) || 0;
                if (superficie > 0) {
                    const indiceMassa = (massaVE / superficie).toFixed(1);
                    document.getElementById('print_indice_massa').textContent = `${indiceMassa} g/m²`;
                }
            }
        }
    }
}

// Adiciona event listeners quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', calcularResultados);
    });
});