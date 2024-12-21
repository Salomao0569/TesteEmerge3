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

    // Volume Ejetado e Fração de Ejeção
    if (volumeDiastFinal > 0 && volumeSistFinal > 0) {
        const volumeEjetado = volumeDiastFinal - volumeSistFinal;
        document.getElementById('print_volume_ejetado').textContent = volumeEjetado + ' mL';

        const fracaoEjecao = Math.round((volumeEjetado/volumeDiastFinal) * 100);
        document.getElementById('print_fracao_ejecao').textContent = fracaoEjecao + ' %';

        const sexo = document.getElementById('sexo').value;
        const analiseDiv = document.getElementById('analise_fracao_ejecao');

        let classificacao = '';
        if (sexo === 'M') {
            if (fracaoEjecao >= 52 && fracaoEjecao <= 72) classificacao = 'normal';
            else if (fracaoEjecao >= 41 && fracaoEjecao < 52) classificacao = 'disfunção discreta';
            else if (fracaoEjecao >= 30 && fracaoEjecao < 41) classificacao = 'disfunção moderada';
            else if (fracaoEjecao < 30) classificacao = 'disfunção grave';
        } else if (sexo === 'F') {
            if (fracaoEjecao >= 54 && fracaoEjecao <= 74) classificacao = 'normal';
            else if (fracaoEjecao >= 41 && fracaoEjecao < 54) classificacao = 'disfunção discreta';
            else if (fracaoEjecao >= 30 && fracaoEjecao < 41) classificacao = 'disfunção moderada';
            else if (fracaoEjecao < 30) classificacao = 'disfunção grave';
        }

        if (classificacao) {
            analiseDiv.value = `Fração de ejeção do ventrículo esquerdo com ${classificacao}.`;
        }
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

function classificarVentriculoEsquerdo() {
    const diamDiast = parseFloat(document.getElementById('diam_diast_final').value) || 0;
    const diamSist = parseFloat(document.getElementById('diam_sist_final').value) || 0;
    const sexo = document.getElementById('sexo').value;
    const classificacaoVEDiastDiv = document.getElementById('classificacao_ve_diast');
    const classificacaoVESistDiv = document.getElementById('classificacao_ve_sist');
    const analiseDiastDiv = document.getElementById('analise_ve_diast');
    const analiseSistDiv = document.getElementById('analise_ve_sist');

    if (diamDiast === 0 || diamSist === 0 || !sexo) {
        classificacaoVEDiastDiv.textContent = '';
        classificacaoVESistDiv.textContent = '';
        analiseDiastDiv.value = '';
        analiseSistDiv.value = '';
        return;
    }

    let classificacaoDiast = '';
    let classificacaoSist = '';

    if (sexo === 'M') {
        if (diamDiast <= 59) classificacaoDiast = 'Normal';
        else if (diamDiast <= 63) classificacaoDiast = 'Discretamente aumentado';
        else if (diamDiast <= 68) classificacaoDiast = 'Moderadamente aumentado';
        else classificacaoDiast = 'Acentuadamente aumentado';

        if (diamSist <= 40) classificacaoSist = 'Normal';
        else if (diamSist <= 45) classificacaoSist = 'Discretamente aumentado';
        else if (diamSist <= 50) classificacaoSist = 'Moderadamente aumentado';
        else classificacaoSist = 'Acentuadamente aumentado';
    } else if (sexo === 'F') {
        if (diamDiast <= 53) classificacaoDiast = 'Normal';
        else if (diamDiast <= 57) classificacaoDiast = 'Discretamente aumentado';
        else if (diamDiast <= 62) classificacaoDiast = 'Moderadamente aumentado';
        else classificacaoDiast = 'Acentuadamente aumentado';

        if (diamSist <= 35) classificacaoSist = 'Normal';
        else if (diamSist <= 40) classificacaoSist = 'Discretamente aumentado';
        else if (diamSist <= 45) classificacaoSist = 'Moderadamente aumentado';
        else classificacaoSist = 'Acentuadamente aumentado';
    }

    classificacaoVEDiastDiv.textContent = `Classificação: ${classificacaoDiast}`;
    classificacaoVEDiastDiv.className = 'alert alert-info py-1';
    analiseDiastDiv.value = `Diâmetro diastólico do ventrículo esquerdo ${classificacaoDiast.toLowerCase()}.`;

    classificacaoVESistDiv.textContent = `Classificação: ${classificacaoSist}`;
    classificacaoVESistDiv.className = 'alert alert-info py-1';
    analiseSistDiv.value = `Diâmetro sistólico do ventrículo esquerdo ${classificacaoSist.toLowerCase()}.`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calcularResultados();
            classificarAtrioEsquerdo();
            classificarVentriculoEsquerdo();
        });
    });

    document.getElementById('sexo').addEventListener('change', () => {
        classificarAtrioEsquerdo();
        classificarVentriculoEsquerdo();
    });
});