function calcularMassaVE() {
    const DDVE = Number(document.getElementById('diam_diast_final').value);
    const PPVE = Number(document.getElementById('esp_diast_ppve').value);
    const SIV = Number(document.getElementById('esp_diast_septo').value);

    if (DDVE > 0 && PPVE > 0 && SIV > 0) {
        // Conversão para centímetros
        const DDVEcm = DDVE / 10;
        const PPVEcm = PPVE / 10;
        const SIVcm = SIV / 10;

        // Fórmula de Devereux modificada
        return Math.round(0.8 * (1.04 * Math.pow((DDVEcm + PPVEcm + SIVcm), 3) - Math.pow(DDVEcm, 3)) + 0.6);
    }
    return 0;
}

function setElementText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

function setElementValue(element, value) {
    if (element) {
        element.value = value;
    }
}

function getElementValue(element) {
    return element ? (parseFloat(element.value) || 0) : 0;
}

function calcularSuperficieCorporea(peso, altura) {
    // Fórmula de DuBois
    return Math.round((0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725)) * 100) / 100;
}

function classificarAtrioEsquerdo(valor, sexo) {
    if (!valor || !sexo) return { texto: '', nivel: 'normal' };

    let classificacao = {
        texto: '',
        nivel: 'normal'
    };

    if (sexo === 'M') {
        if (valor <= 40) {
            classificacao.texto = 'normal';
            classificacao.nivel = 'normal';
        } else if (valor > 40 && valor <= 44) {
            classificacao.texto = 'levemente aumentado';
            classificacao.nivel = 'mild';
        } else if (valor > 44 && valor <= 48) {
            classificacao.texto = 'moderadamente aumentado';
            classificacao.nivel = 'moderate';
        } else {
            classificacao.texto = 'gravemente aumentado';
            classificacao.nivel = 'severe';
        }
    } else if (sexo === 'F') {
        if (valor <= 38) {
            classificacao.texto = 'normal';
            classificacao.nivel = 'normal';
        } else if (valor > 38 && valor <= 42) {
            classificacao.texto = 'levemente aumentado';
            classificacao.nivel = 'mild';
        } else if (valor > 42 && valor <= 46) {
            classificacao.texto = 'moderadamente aumentado';
            classificacao.nivel = 'moderate';
        } else {
            classificacao.texto = 'gravemente aumentado';
            classificacao.nivel = 'severe';
        }
    }

    return classificacao;
}

function atualizarClassificacao(elemento, texto, nivel) {
    if (!elemento) return;

    elemento.textContent = texto;
    elemento.className = 'alert ' + nivel;
}

function obterNivelClassificacao(texto) {
    if (texto.includes('normal')) return 'normal';
    if (texto.includes('levemente') || texto.includes('discretamente')) return 'mild';
    if (texto.includes('moderadamente')) return 'moderate';
    if (texto.includes('gravemente') || texto.includes('importante')) return 'severe';
    return 'normal';
}

function calcularVolumeDiastolicoFinal(diametro) {
    // Fórmula de Teichholz modificada
    const diametroCm = diametro / 10;
    return Math.round((7 / (2.4 + diametroCm)) * Math.pow(diametroCm, 3));
}

function calcularVolumeSistolicoFinal(diametro) {
    // Fórmula de Teichholz modificada
    const diametroCm = diametro / 10;
    return Math.round((7 / (2.4 + diametroCm)) * Math.pow(diametroCm, 3));
}

function classificarAorta(valor, sexo, segmento) {
    if (!valor || !sexo || !segmento) return { texto: '', nivel: 'normal' };

    const referencias = {
        'M': {
            'anel': {
                normal: [23, 29],
                discreto: [30, 33],
                moderado: [34, 37],
                importante: 37
            },
            'raiz': {
                normal: [31, 37],
                discreto: [37, 40],
                moderado: [40, 43],
                importante: 44
            },
            'juncao': {
                normal: [26, 32],
                discreto: [33, 36],
                moderado: [36, 39],
                importante: 40
            },
            'ascendente': {
                normal: [26, 34],
                discreto: [35, 39],
                moderado: [40, 43],
                importante: 44
            }
        },
        'F': {
            'anel': {
                normal: [21, 25],
                discreto: [26, 29],
                moderado: [29, 32],
                importante: 32
            },
            'raiz': {
                normal: [27, 33],
                discreto: [34, 37],
                moderado: [37, 40],
                importante: 40
            },
            'juncao': {
                normal: [23, 29],
                discreto: [30, 33],
                moderado: [34, 37],
                importante: 38
            },
            'ascendente': {
                normal: [23, 31],
                discreto: [32, 36],
                moderado: [37, 41],
                importante: 42
            }
        }
    };

    const ref = referencias[sexo][segmento];
    if (!ref) return { texto: '', nivel: 'normal' };

    let classificacao = {
        texto: '',
        nivel: 'normal'
    };

    if (valor <= ref.normal[1]) {
        classificacao.texto = 'normal';
        classificacao.nivel = 'normal';
    } else if (valor <= ref.discreto[1]) {
        classificacao.texto = 'discretamente dilatada';
        classificacao.nivel = 'mild';
    } else if (valor <= ref.moderado[1]) {
        classificacao.texto = 'moderadamente dilatada';
        classificacao.nivel = 'moderate';
    } else if (valor > ref.importante) {
        classificacao.texto = 'importante dilatação';
        classificacao.nivel = 'severe';
    }

    const segmentoNomes = {
        'anel': 'Anel aórtico',
        'raiz': 'Raiz da aorta',
        'juncao': 'Junção sinotubular',
        'ascendente': 'Aorta ascendente'
    };

    return classificacao.texto ? 
        { texto: `${segmentoNomes[segmento]} ${classificacao.texto}.`, nivel: classificacao.nivel } : 
        { texto: '', nivel: 'normal' };
}

function classificarSeptoEParede(valor, sexo) {
    if (!valor || !sexo) return { texto: '', nivel: 'normal' };

    let classificacao = {
        texto: '',
        nivel: 'normal'
    };

    if (sexo === 'F') {
        if (valor >= 6 && valor <= 10) {
            classificacao.texto = 'normal';
            classificacao.nivel = 'normal';
        } else if (valor >= 11 && valor <= 13) {
            classificacao.texto = 'discretamente aumentado';
            classificacao.nivel = 'mild';
        } else if (valor >= 14 && valor <= 16) {
            classificacao.texto = 'moderadamente aumentado';
            classificacao.nivel = 'moderate';
        } else if (valor > 16) {
            classificacao.texto = 'gravemente aumentado';
            classificacao.nivel = 'severe';
        }
    } else if (sexo === 'M') {
        if (valor >= 6 && valor <= 11) {
            classificacao.texto = 'normal';
            classificacao.nivel = 'normal';
        } else if (valor >= 12 && valor <= 14) {
            classificacao.texto = 'discretamente aumentado';
            classificacao.nivel = 'mild';
        } else if (valor >= 15 && valor <= 17) {
            classificacao.texto = 'moderadamente aumentado';
            classificacao.nivel = 'moderate';
        } else if (valor > 17) {
            classificacao.texto = 'gravemente aumentado';
            classificacao.nivel = 'severe';
        }
    }

    return classificacao;
}

function classificarDiametroVE(valor, sexo, tipo) {
    if (!valor || !sexo || !tipo) return { texto: '', nivel: 'normal' };

    const referencias = {
        'M': {
            'diastolico': {
                normal: [42, 58],
                discreto: [59, 63],
                moderado: [64, 68],
                importante: 68
            },
            'sistolico': {
                normal: [25, 40],
                discreto: [41, 43],
                moderado: [44, 45],
                importante: 45
            }
        },
        'F': {
            'diastolico': {
                normal: [38, 52],
                discreto: [53, 56],
                moderado: [57, 61],
                importante: 61
            },
            'sistolico': {
                normal: [22, 35],
                discreto: [36, 38],
                moderado: [39, 41],
                importante: 41
            }
        }
    };

    const ref = referencias[sexo][tipo];
    if (!ref) return { texto: '', nivel: 'normal' };

    let classificacao = {
        texto: '',
        nivel: 'normal'
    };

    if (valor >= ref.normal[0] && valor <= ref.normal[1]) {
        classificacao.texto = 'normal';
        classificacao.nivel = 'normal';
    } else if (valor >= ref.discreto[0] && valor <= ref.discreto[1]) {
        classificacao.texto = 'discretamente aumentado';
        classificacao.nivel = 'mild';
    } else if (valor >= ref.moderado[0] && valor <= ref.moderado[1]) {
        classificacao.texto = 'moderadamente aumentado';
        classificacao.nivel = 'moderate';
    } else if (valor > ref.importante) {
        classificacao.texto = 'importante aumento';
        classificacao.nivel = 'severe';
    } else if (valor < ref.normal[0]) {
        classificacao.texto = 'reduzido';
        classificacao.nivel = 'severe';
    }

    const tipoNome = tipo === 'diastolico' ? 'diastólico' : 'sistólico';
    return {
        texto: classificacao.texto ? `Diâmetro ${tipoNome} do VE ${classificacao.texto}.` : '',
        nivel: classificacao.nivel
    };
}

function classificarEspessuraRelativa(espessuraRelativa, massaVE, sexo) {
    if (!espessuraRelativa || !massaVE || !sexo) return '';

    // Limites de massa do VE por sexo
    const limiteMassa = {
        'M': 115, // g/m²
        'F': 95   // g/m²
    };

    const massaAumentada = massaVE > limiteMassa[sexo];

    if (espessuraRelativa < 0.42) {
        if (massaAumentada) {
            return 'Hipertrofia excêntrica do VE.';
        }
        return 'Geometria normal do VE.';
    } else {
        if (massaAumentada) {
            return 'Hipertrofia concêntrica do VE.';
        }
        return 'Remodelamento concêntrico do VE.';
    }
}

function calcularResultados() {
    // Obter elementos do DOM
    const elementos = {
        peso: document.getElementById('peso'),
        altura: document.getElementById('altura'),
        atrio: document.getElementById('atrio'),
        diamDiastFinal: document.getElementById('diam_diast_final'),
        diamSistFinal: document.getElementById('diam_sist_final'),
        espDiastSepto: document.getElementById('esp_diast_septo'),
        espDiastPPVE: document.getElementById('esp_diast_ppve'),
        superficie: document.getElementById('superficie'),
        printVolumeDiastFinal: document.getElementById('print_volume_diast_final'),
        printVolumeSistFinal: document.getElementById('print_volume_sist_final'),
        printVolumeEjetado: document.getElementById('print_volume_ejetado'),
        printFracaoEjecao: document.getElementById('print_fracao_ejecao'),
        printPercentEncurt: document.getElementById('print_percent_encurt'),
        printEspRelativa: document.getElementById('print_esp_relativa'),
        printMassaVE: document.getElementById('print_massa_ve'),
        printIndiceMassa: document.getElementById('print_indice_massa'),
        classificacaoFe: document.getElementById('classificacao_fe'),
        classificacaoAe: document.getElementById('classificacao_ae'),
        sexo: document.getElementById('sexo'),
        aorta: document.getElementById('aorta'),
        aortaAsc: document.getElementById('aorta_ascendente'),
        classificacaoAorta: document.getElementById('classificacao_aorta'),
        classificacaoAortaAsc: document.getElementById('classificacao_aorta_ascendente'),
        classificacaoSepto: document.getElementById('classificacao_septo'),
        classificacaoPPVE: document.getElementById('classificacao_ppve'),
        classificacaoDiastolico: document.getElementById('classificacao_diastolico'),
        classificacaoSistolico: document.getElementById('classificacao_sistolico'),
        classificacaoEspessura: document.getElementById('classificacao_espessura')
    };

    // Verificar elementos essenciais
    if (!elementos.diamDiastFinal || !elementos.diamSistFinal) {
        console.error('Elementos essenciais não encontrados');
        return;
    }

    // Obter valores
    const peso = getElementValue(elementos.peso);
    const altura = getElementValue(elementos.altura);
    const atrio = getElementValue(elementos.atrio);
    const diamDiastFinal = getElementValue(elementos.diamDiastFinal);
    const diamSistFinal = getElementValue(elementos.diamSistFinal);
    const espDiastSepto = getElementValue(elementos.espDiastSepto);
    const espDiastPPVE = getElementValue(elementos.espDiastPPVE);
    const aorta = getElementValue(elementos.aorta);
    const aortaAsc = getElementValue(elementos.aortaAsc);


    // Classificação do Átrio Esquerdo
    if (atrio > 0 && elementos.classificacaoAe && elementos.sexo) {
        const resultado = classificarAtrioEsquerdo(atrio, elementos.sexo.value);
        atualizarClassificacao(
            elementos.classificacaoAe, 
            `Átrio esquerdo ${resultado.texto}.`,
            resultado.nivel
        );
    }

    // Superfície corpórea (DuBois)
    if (peso > 0 && altura > 0) {
        const superficie = calcularSuperficieCorporea(peso, altura);
        setElementValue(elementos.superficie, superficie.toFixed(2));
    }

    // Volume Diastólico Final (Teichholz)
    let volumeDiastFinal = 0;
    if (diamDiastFinal > 0) {
        volumeDiastFinal = calcularVolumeDiastolicoFinal(diamDiastFinal);
        setElementText(elementos.printVolumeDiastFinal, `${volumeDiastFinal} mL`);
    }

    // Volume Sistólico Final (Teichholz)
    let volumeSistFinal = 0;
    if (diamSistFinal > 0) {
        volumeSistFinal = calcularVolumeSistolicoFinal(diamSistFinal);
        setElementText(elementos.printVolumeSistFinal, `${volumeSistFinal} mL`);
    }

    // Cálculos da fração de ejeção e volume ejetado
    if (volumeDiastFinal > 0 && volumeSistFinal > 0) {
        const volumeEjetado = volumeDiastFinal - volumeSistFinal;
        setElementText(elementos.printVolumeEjetado, `${volumeEjetado} mL`);

        // Fração de Ejeção (%)
        const fracaoEjecao = Math.round((volumeEjetado / volumeDiastFinal) * 100);
        setElementText(elementos.printFracaoEjecao, `${fracaoEjecao} %`);

        // Classificação da Fração de Ejeção
        if (elementos.classificacaoFe && elementos.sexo) {
            const sexo = elementos.sexo.value;
            let classificacao = '';

            if (sexo === 'M') {
                if (fracaoEjecao >= 52 && fracaoEjecao <= 72) classificacao = 'normal';
                else if (fracaoEjecao > 72) classificacao = 'aumentada';
                else if (fracaoEjecao >= 41 && fracaoEjecao < 52) classificacao = 'disfunção discreta';
                else if (fracaoEjecao >= 30 && fracaoEjecao < 41) classificacao = 'disfunção moderada';
                else if (fracaoEjecao < 30) classificacao = 'disfunção grave';
            } else if (sexo === 'F') {
                if (fracaoEjecao >= 54 && fracaoEjecao <= 74) classificacao = 'normal';
                else if (fracaoEjecao > 74) classificacao = 'aumentada';
                else if (fracaoEjecao >= 41 && fracaoEjecao < 54) classificacao = 'disfunção discreta';
                else if (fracaoEjecao >= 30 && fracaoEjecao < 41) classificacao = 'disfunção moderada';
                else if (fracaoEjecao < 30) classificacao = 'disfunção grave';
            }

            if (classificacao) {
                setElementText(elementos.classificacaoFe, `Fração de ejeção do ventrículo esquerdo ${classificacao}.`);
            }
        }
    }

    // Percentual de Encurtamento
    if (diamDiastFinal > 0 && diamSistFinal > 0) {
        const percentEncurt = Math.round(((diamDiastFinal - diamSistFinal) / diamDiastFinal) * 100);
        setElementText(elementos.printPercentEncurt, `${percentEncurt} %`);
    }

    // Espessura Relativa
    if (diamDiastFinal > 0 && espDiastPPVE > 0) {
        // Fórmula corrigida: (2 × PPVE) / DDVE
        const espessuraRelativa = Math.round((2 * espDiastPPVE / diamDiastFinal) * 100) / 100;
        setElementText(elementos.printEspRelativa, espessuraRelativa.toFixed(2));

        // Classificação da Espessura Relativa
        if (elementos.classificacaoEspessura && elementos.sexo) {
            const superficie = parseFloat(elementos.superficie?.value || 0);
            const massaVE = calcularMassaVE();
            const indiceMassa = superficie > 0 ? Math.round((massaVE / superficie) * 10) / 10 : 0;

            const classificacaoEspessura = classificarEspessuraRelativa(
                espessuraRelativa,
                indiceMassa,
                elementos.sexo.value
            );
            setElementText(elementos.classificacaoEspessura, classificacaoEspessura);
        }
    }

    // Massa do VE e Índice de Massa
    const massaVE = calcularMassaVE();
    if (massaVE > 0) {
        setElementText(elementos.printMassaVE, `${massaVE} g`);

        const superficie = parseFloat(elementos.superficie?.value || 0);
        if (superficie > 0) {
            const indiceMassa = Math.round((massaVE / superficie) * 10) / 10;
            setElementText(elementos.printIndiceMassa, `${indiceMassa} g/m²`);
        }
    }

    // Classificação da Aorta
    if (aorta > 0 && elementos.classificacaoAorta && elementos.sexo) {
        const resultado = classificarAorta(aorta, elementos.sexo.value, 'raiz');
        atualizarClassificacao(elementos.classificacaoAorta, resultado.texto, resultado.nivel);
    }

    if (aortaAsc > 0 && elementos.classificacaoAortaAsc && elementos.sexo) {
        const resultado = classificarAorta(aortaAsc, elementos.sexo.value, 'ascendente');
        atualizarClassificacao(elementos.classificacaoAortaAsc, resultado.texto, resultado.nivel);
    }

    // Classificação do Septo
    if (espDiastSepto > 0 && elementos.classificacaoSepto && elementos.sexo) {
        const resultado = classificarSeptoEParede(espDiastSepto, elementos.sexo.value);
        atualizarClassificacao(
            elementos.classificacaoSepto, 
            `Septo interventricular ${resultado.texto}.`,
            resultado.nivel
        );
    }

    // Classificação da PPVE
    if (espDiastPPVE > 0 && elementos.classificacaoPPVE && elementos.sexo) {
        const resultado = classificarSeptoEParede(espDiastPPVE, elementos.sexo.value);
        atualizarClassificacao(
            elementos.classificacaoPPVE, 
            `Parede posterior do VE ${resultado.texto}.`,
            resultado.nivel
        );
    }

    // Classificação do Diâmetro Diastólico
    if (diamDiastFinal > 0 && elementos.classificacaoDiastolico && elementos.sexo) {
        const resultado = classificarDiametroVE(diamDiastFinal, elementos.sexo.value, 'diastolico');
        atualizarClassificacao(elementos.classificacaoDiastolico, resultado.texto, resultado.nivel);
    }

    // Classificação do Diâmetro Sistólico
    if (diamSistFinal > 0 && elementos.classificacaoSistolico && elementos.sexo) {
        const resultado = classificarDiametroVE(diamSistFinal, elementos.sexo.value, 'sistolico');
        atualizarClassificacao(elementos.classificacaoSistolico, resultado.texto, resultado.nivel);
    }
}

// Função para destacar valores alterados
function destacarValorAlterado(elemento) {
    if (!elemento) return;

    const parentCell = elemento.parentElement;
    const alertDiv = parentCell.querySelector('.alert');

    if (alertDiv) {
        alertDiv.classList.add('alert-value');
        // Remove a classe após 2 segundos
        setTimeout(() => {
            alertDiv.classList.remove('alert-value');
        }, 2000);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    const sexoSelect = document.getElementById('sexo');

    if (inputs.length > 0 && sexoSelect) {
        inputs.forEach(input => {
            input.addEventListener('input', function(event) {
                destacarValorAlterado(event.target);
                calcularResultados();
            });
        });

        sexoSelect.addEventListener('change', calcularResultados);
    } else {
        console.error('Elementos necessários não encontrados durante a inicialização');
    }
});