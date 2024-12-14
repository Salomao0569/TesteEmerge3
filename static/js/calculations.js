function calcularMassaVE() {
    const DDVE = Number(document.getElementById('diam_diast_final').value);
    const PPVE = Number(document.getElementById('esp_diast_ppve').value);
    const SIV = Number(document.getElementById('esp_diast_septo').value);
    
    if (DDVE > 0 && PPVE > 0 && SIV > 0) {
        // Converte de mm para cm antes de aplicar a fórmula
        const DDVEcm = DDVE / 10;
        const PPVEcm = PPVE / 10;
        const SIVcm = SIV / 10;
        
        // Fórmula de Devereux com arredondamento para número inteiro
        return Math.round(0.8 * (1.04 * Math.pow((DDVEcm + PPVEcm + SIVcm), 3) - Math.pow(DDVEcm, 3)) + 0.6);
    }
    return 0;
}

function calcularResultados() {
    console.log("Iniciando cálculos...");
    // Recupera valores dos elementos
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    const diamDiastFinal = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSistFinal = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const espDiastSepto = parseFloat(document.getElementById('esp_diast_septo').value) || 0;
    const espDiastPPVE = parseFloat(document.getElementById('esp_diast_ppve').value) || 0;
    
    console.log("Valores obtidos:", { peso, altura, diamDiastFinal, diamSistFinal, espDiastSepto, espDiastPPVE });

    // Cálculo da superfície corpórea (DuBois)
    if (peso > 0 && altura > 0) {
        const superficie = 0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725);
        document.getElementById('superficie').value = superficie.toFixed(2);

        // Cálculos que dependem apenas do diâmetro diastólico
        if (diamDiastFinal > 0) {
            // Volume Diastólico Final (Teichholz)
            const volumeDiastFinal = 7 * Math.pow(diamDiastFinal / 10, 3) / (2.4 + diamDiastFinal / 10);
            document.getElementById('print_volume_diast_final').textContent = `${Math.round(volumeDiastFinal)} mL`;

            // Cálculos que dependem do diâmetro sistólico
            if (diamSistFinal > 0) {
                // Volume Sistólico Final
                const volumeSistFinal = 7 * Math.pow(diamSistFinal / 10, 3) / (2.4 + diamSistFinal / 10);
                document.getElementById('print_volume_sist_final').textContent = `${Math.round(volumeSistFinal)} mL`;

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
        }

        // Massa do VE e Índice de Massa (podem ser calculados independentemente dos volumes)
        if (diamDiastFinal > 0 && espDiastSepto > 0 && espDiastPPVE > 0) {
            const massaVE = calcularMassaVE();
            document.getElementById('print_massa_ve').textContent = `${massaVE} g`;

            // Calcula e atualiza o índice de massa do VE
            if (superficie > 0 && massaVE > 0) {
                const indiceMassa = (massaVE / superficie).toFixed(1);
                document.getElementById('print_indice_massa').textContent = `${indiceMassa} g/m²`;
            } else {
                document.getElementById('print_indice_massa').textContent = '';
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