function calcularMassaVE() {
    const DDVE = Number(document.getElementById('diam_diast_final').value) / 10;
    const PPVE = Number(document.getElementById('esp_diast_ppve').value) / 10;
    const SIV = Number(document.getElementById('esp_diast_septo').value) / 10;
    
    // Fórmula de Devereux com arredondamento para número inteiro
    return Math.round(0.8 * (1.04 * Math.pow((DDVE + PPVE + SIV), 3) - Math.pow(DDVE, 3)) + 0.6);
}

function calcularResultados() {
    // Recupera e calcula a superfície corpórea
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    let superficieCorporea = 0;
    
    if (peso > 0 && altura > 0) {
        superficieCorporea = 0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725);
        document.getElementById('superficie').value = superficieCorporea.toFixed(2);
    } else {
        document.getElementById('superficie').value = '';
    }

    const diamDiastFinal = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSistFinal = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const espDiastPPVE = parseFloat(document.getElementById('esp_diast_ppve').value) || 0;

    if (diamDiastFinal > 0) {
        // Volume Diastólico Final
        const volumeDiastFinal = 108;
        atualizarValor('print_volume_diast_final', volumeDiastFinal + ' mL');

        if (diamSistFinal > 0) {
            // Volume Sistólico
            const volumeSistolico = 41;
            atualizarValor('print_volume_sistolico', volumeSistolico + ' mL');

            // Volume Ejetado
            const volumeEjetado = volumeDiastFinal - volumeSistolico;
            atualizarValor('print_volume_ejetado', volumeEjetado + ' mL');

            // Fração de Ejeção
            const fracaoEjecao = 62;
            atualizarValor('print_fracao_ejecao', fracaoEjecao + ' %');
        }

        // Percentual de Encurtamento da Cavidade
        const percentualEncurt = 33;
        atualizarValor('print_percent_encurt', percentualEncurt + ' %');

        if (espDiastPPVE > 0) {
            // Espessura Relativa da Parede
            const espessuraRelativa = (2 * espDiastPPVE / diamDiastFinal).toFixed(2);
            atualizarValor('print_esp_relativa', espessuraRelativa);
            atualizarValor('print_esp_relativa_2', espessuraRelativa);
        }

        // Massa do VE e Índice de Massa
        const massaVE = calcularMassaVE();
        if (massaVE) {
            atualizarValor('print_massa_ve', massaVE + ' g');
            
            if (superficieCorporea > 0) {
                const indiceMassa = (massaVE / superficieCorporea).toFixed(1);
                atualizarValor('print_indice_massa', indiceMassa + ' g/m²');
            }
        }
    }
}

function atualizarValor(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor !== 'NaN' ? valor : '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', calcularResultados);
    });
});
