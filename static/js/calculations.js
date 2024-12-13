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

    const diastolicVolume = valores.diastolicDiameter ? 
        7 * Math.pow(valores.diastolicDiameter / 10, 3) / (2.4 + valores.diastolicDiameter / 10) : '';
    const systolicVolume = valores.systolicDiameter ? 
        7 * Math.pow(valores.systolicDiameter / 10, 3) / (2.4 + valores.systolicDiameter / 10) : '';
    const ejectedVolume = diastolicVolume && systolicVolume ? 
        diastolicVolume - systolicVolume : '';
    const ejectionFraction = valores.diastolicDiameter && valores.systolicDiameter ? 
        ((diastolicVolume - systolicVolume) / diastolicVolume) * 100 : '';
    const cavityPercentage = valores.diastolicDiameter && valores.systolicDiameter ? 
        ((valores.diastolicDiameter - valores.systolicDiameter) / valores.diastolicDiameter) * 100 : '';

    // Cálculo da superfície corpórea (DuBois)
    if (valores.peso > 0 && valores.altura > 0) {
        const superficie = 0.007184 * Math.pow(valores.peso, 0.425) * Math.pow(valores.altura, 0.725);
        const superficieElement = document.getElementById('superficie');
        if (superficieElement) {
            superficieElement.value = superficie.toFixed(2);
        }

        // Cálculos principais apenas se tiver os valores necessários
        if (valores.diamDiastFinal > 0) {
            // Volume Diastólico Final (Teichholz)
            const volumeDiastFinal = 7 * Math.pow(valores.diamDiastFinal / 10, 3) / (2.4 + valores.diamDiastFinal / 10);
            atualizarValor('print_volume_diast_final', diastolicVolume ? `${Math.round(diastolicVolume)} mL` : '');

            if (valores.diamSistFinal > 0) {
                // Volume Sistólico Final
                const volumeSistFinal = 7 * Math.pow(valores.diamSistFinal / 10, 3) / (2.4 + valores.diamSistFinal / 10);
                atualizarValor('print_volume_sistolico', systolicVolume ? `${Math.round(systolicVolume)} mL` : '');

                // Volume Ejetado
                const volumeEjetado = volumeDiastFinal - volumeSistFinal;
                atualizarValor('print_volume_ejetado', ejectedVolume ? `${Math.round(ejectedVolume)} mL` : '');

                // Fração de Ejeção
                const fracaoEjecao = (volumeEjetado / volumeDiastFinal) * 100;
                atualizarValor('print_fracao_ejecao', ejectionFraction ? `${Math.round(ejectionFraction)} %` : '');

                // Percentual de Encurtamento
                const percentEncurt = ((valores.diamDiastFinal - valores.diamSistFinal) / valores.diamDiastFinal) * 100;
                atualizarValor('print_percent_encurt', cavityPercentage ? `${Math.round(cavityPercentage)} %` : '');
            }

            // Espessura Relativa da Parede
            if (valores.espDiastPPVE > 0) {
                const espessuraRelativa = (2 * valores.espDiastPPVE / valores.diamDiastFinal).toFixed(2);
                atualizarValor('print_esp_relativa', espessuraRelativa);
            }

            // Massa do VE (Fórmula de Devereux)
            if (valores.espDiastSepto > 0 && valores.espDiastPPVE > 0) {
                const DDVE = valores.diamDiastFinal / 10;
                const PPVE = valores.espDiastPPVE / 10;
                const SIV = valores.espDiastSepto / 10;
                
                const massaVE = Math.round(0.8 * (1.04 * Math.pow((DDVE + PPVE + SIV), 3) - Math.pow(DDVE, 3)) + 0.6);
                atualizarValor('print_massa_ve', `${massaVE} g`);

                // Índice de Massa
                const indiceMassa = (massaVE / superficie).toFixed(1);
                atualizarValor('print_indice_massa', `${indiceMassa} g/m²`);
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