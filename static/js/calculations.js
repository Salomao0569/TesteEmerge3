
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
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    const diamDiastFinal = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSistFinal = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const espDiastSepto = parseFloat(document.getElementById('esp_diast_septo').value) || 0;
    const espDiastPPVE = parseFloat(document.getElementById('esp_diast_ppve').value) || 0;

    // Superfície corpórea (DuBois)
    let superficie = 0;
    if (peso > 0 && altura > 0) {
        superficie = Math.round((0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725)) * 100) / 100;
        document.getElementById('superficie').value = superficie.toFixed(2);
    }

    // Volume Diastólico Final (Teichholz)
    let volumeDiastFinal = 0;
    if (diamDiastFinal > 0) {
        volumeDiastFinal = Math.round(7 * Math.pow(diamDiastFinal / 10, 3) / (2.4 + diamDiastFinal / 10));
        document.getElementById('print_volume_diast_final').textContent = volumeDiastFinal + ' mL';
    }

    // Volume Sistólico Final
    let volumeSistFinal = 0;
    if (diamSistFinal > 0) {
        volumeSistFinal = Math.round(7 * Math.pow(diamSistFinal / 10, 3) / (2.4 + diamSistFinal / 10));
        document.getElementById('print_volume_sist_final').textContent = volumeSistFinal + ' mL';
    }

    // Volume Ejetado
    if (volumeDiastFinal > 0 && volumeSistFinal > 0) {
        const volumeEjetado = volumeDiastFinal - volumeSistFinal;
        document.getElementById('print_volume_ejetado').textContent = volumeEjetado + ' mL';
        
        // Fração de Ejeção
        const fracaoEjecao = Math.round((volumeEjetado / volumeDiastFinal) * 100);
        document.getElementById('print_fracao_ejecao').textContent = fracaoEjecao + ' %';
    }

    // Percentual de Encurtamento
    if (diamDiastFinal > 0 && diamSistFinal > 0) {
        const percentEncurt = Math.round(((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100);
        document.getElementById('print_percent_encurt').textContent = percentEncurt + ' %';
    }

    // Espessura Relativa
    if (diamDiastFinal > 0 && espDiastPPVE > 0) {
        const espessuraRelativa = Math.round((2 * espDiastPPVE / diamDiastFinal) * 100) / 100;
        document.getElementById('print_esp_relativa').textContent = espessuraRelativa.toFixed(2);
    }

    // Massa VE e Índice de Massa
    if (diamDiastFinal > 0 && espDiastSepto > 0 && espDiastPPVE > 0) {
        const massaVE = calcularMassaVE();
        document.getElementById('print_massa_ve').textContent = massaVE + ' g';

        if (superficie > 0) {
            const indiceMassa = Math.round((massaVE / superficie) * 10) / 10;
            document.getElementById('print_indice_massa').textContent = indiceMassa + ' g/m²';
        }
    }
}

function classificarAtrioEsquerdo() {
    const atrio = parseFloat(document.getElementById('atrio').value) || 0;
    const sexo = document.getElementById('sexo').value;
    const classificacaoDiv = document.getElementById('classificacao_ae');
    
    if (atrio === 0 || !sexo) {
        classificacaoDiv.textContent = '';
        return;
    }

    let classificacao = '';
    if (sexo === 'M') {
        if (atrio <= 40) classificacao = 'Normal';
        else if (atrio <= 46) classificacao = 'Aumento discreto';
        else if (atrio <= 52) classificacao = 'Aumento moderado';
        else classificacao = 'Aumento importante';
    } else if (sexo === 'F') {
        if (atrio <= 38) classificacao = 'Normal';
        else if (atrio <= 42) classificacao = 'Aumento discreto';
        else if (atrio <= 46) classificacao = 'Aumento moderado';
        else classificacao = 'Aumento importante';
    }

    classificacaoDiv.textContent = `Classificação: ${classificacao}`;
    classificacaoDiv.className = 'alert alert-info py-1';
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calcularResultados();
            classificarAtrioEsquerdo();
        });
    });

    document.getElementById('sexo').addEventListener('change', classificarAtrioEsquerdo);
});
