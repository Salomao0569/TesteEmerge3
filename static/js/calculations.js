function calcularResultados() {
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
