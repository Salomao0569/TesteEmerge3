function calcularResultados() {
    // Recupera e calcula a superfície corpórea
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    
    // Calcula a superfície corpórea se peso e altura estiverem preenchidos
    if (peso > 0 && altura > 0) {
        // Fórmula de DuBois: SC = 0.007184 × peso^0.425 × altura^0.725
        const superficieCorporea = 0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725);
        document.getElementById('superficie').value = superficieCorporea.toFixed(2);
    } else {
        document.getElementById('superficie').value = '';
    }

    const diamDiastFinal = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSistFinal = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const espDiastSeptal = parseFloat(document.getElementById('esp_diast_septo').value) || 0;
    const espDiastPPVE = parseFloat(document.getElementById('esp_diast_ppve').value) || 0;

    if (diamDiastFinal > 0 && diamSistFinal > 0) {
        const volumeDiastFinal = 7 * Math.pow(diamDiastFinal / 10, 3) / (2.4 + diamDiastFinal / 10);
        const volumeSistolico = 7 * Math.pow(diamSistFinal / 10, 3) / (2.4 + diamSistFinal / 10);
        const volumeEjetado = volumeDiastFinal - volumeSistolico;
        const fracaoEjecao = (volumeEjetado / volumeDiastFinal) * 100;
        const percentualEncurt = ((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100;
        const espessuraRelativa = (2 * espDiastPPVE) / diamDiastFinal;

        atualizarValor('print_volume_diast_final', volumeDiastFinal.toFixed(0));
        atualizarValor('print_volume_sistolico', volumeSistolico.toFixed(0));
        atualizarValor('print_volume_ejetado', volumeEjetado.toFixed(0));
        atualizarValor('print_fracao_ejecao', fracaoEjecao.toFixed(0));
        atualizarValor('print_percent_encurt', percentualEncurt.toFixed(0));
        atualizarValor('print_esp_relativa', espessuraRelativa.toFixed(2));
    }

    // Cálculo do Índice de Massa
    const superficie = parseFloat(document.getElementById('superficie').value) || 0;
    const espSepto = parseFloat(document.getElementById('esp_diast_septo').value) || 0;
    const espPPVE = parseFloat(document.getElementById('esp_diast_ppve').value) || 0;

    if (superficie > 0 && espSepto > 0 && espPPVE > 0 && diamDiastFinal > 0) {
        // Fórmula de Devereux
        const massa = 0.8 * (1.04 * Math.pow((espSepto + diamDiastFinal + espPPVE), 3) - Math.pow(diamDiastFinal, 3)) + 0.6;
        const indiceMassa = massa / superficie;
        atualizarValor('print_indice_massa', indiceMassa.toFixed(1));
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
