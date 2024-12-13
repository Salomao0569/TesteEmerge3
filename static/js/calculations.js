// Estado global para simular o React useState
let measures = {
    leftAtrium: '',
    aorta: '',
    diastolicDiameter: '',
    systolicDiameter: '',
    septumThickness: '',
    wallThickness: '',
    rightVentricle: '',
};

function handleInputChange(field, value) {
    measures[field] = value;
    calcularResultados();
}

function calcularMassaVE() {
    const DDVE = Number(measures.diastolicDiameter) / 10;
    const PPVE = Number(measures.wallThickness) / 10;
    const SIV = Number(measures.septumThickness) / 10;
    
    // Fórmula de Devereux com arredondamento para número inteiro
    return Math.round(0.8 * (1.04 * Math.pow((DDVE + PPVE + SIV), 3) - Math.pow(DDVE, 3)) + 0.6);
}

function calculateResults() {
    const elementos = {
        peso: document.getElementById('peso'),
        altura: document.getElementById('altura')
    };

    // Valores numéricos com fallback para 0
    const valores = {
        ...measures,
        peso: elementos.peso && elementos.peso.value ? parseFloat(elementos.peso.value) : 0,
        altura: elementos.altura && elementos.altura.value ? parseFloat(elementos.altura.value) : 0
    };

    const diastolicVolume = measures.diastolicDiameter ? 
        7 * Math.pow(Number(measures.diastolicDiameter) / 10, 3) / (2.4 + Number(measures.diastolicDiameter) / 10) : '';
    const systolicVolume = measures.systolicDiameter ? 
        7 * Math.pow(Number(measures.systolicDiameter) / 10, 3) / (2.4 + Number(measures.systolicDiameter) / 10) : '';
    const ejectedVolume = diastolicVolume && systolicVolume ? 
        diastolicVolume - systolicVolume : '';
    const ejectionFraction = measures.diastolicDiameter && measures.systolicDiameter ? 
        ((diastolicVolume - systolicVolume) / diastolicVolume) * 100 : '';
    const cavityPercentage = measures.diastolicDiameter && measures.systolicDiameter ? 
        ((Number(measures.diastolicDiameter) - Number(measures.systolicDiameter)) / Number(measures.diastolicDiameter)) * 100 : '';

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