let currentFontSize = 3; // Valor padrão

function execCommand(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor').focus();
}

function changeFontSize(direction) {
    if (direction === 'increase' && currentFontSize < 7) {
        currentFontSize++;
    } else if (direction === 'decrease' && currentFontSize > 1) {
        currentFontSize--;
    }
    execCommand('fontSize', currentFontSize);
}

function insertTemplate(templateId) {
    const editor = document.getElementById('editor');
    let template = '';

    switch(templateId) {
        case 'normal':
            template = `<p>Exame realizado com ritmo cardíaco regular. Evidenciando:</p>
<p>Cavidades cardíacas com dimensões normais.<br>
Raiz da aorta com diâmetro preservado.<br>
Espessura miocárdica do ventrículo esquerdo conservada.</p>
<p>Desempenho sistólico do ventrículo esquerdo conservado. Não foram observadas alterações segmentares da contratilidade ventricular.</p>
<p>Função diastólica do ventrículo esquerdo conservada ao doppler mitral espectral.</p>
<p>Ventrículo direito com desempenho sistólico preservado - análise subjetiva.</p>
<p>Valva mitral com abertura e mobilidade conservadas. Colordoppler registrou refluxo discreto.</p>
<p>Valva tricúspide com abertura conservada. Colordoppler registrou refluxo discreto.</p>
<p>Valva aórtica com espessamento em seus folhetos. Abertura e mobilidade conservadas.</p>
<p>Valva pulmonar com abertura e mobilidade conservadas.</p>
<p>Demais fluxos transvalvares com velocidades normais ao colordoppler.</p>
<p>Pericárdio ecograficamente normal.</p>
<p><strong>OPINIÃO:</strong> Ecocardiograma dentro dos limites da normalidade.</p>`;
            break;
        case 'hipertrofia':
            template = `<p>Exame realizado com ritmo cardíaco regular. Evidenciando:</p>
<p>Átrio esquerdo com dimensões aumentadas.<br>
Raiz da aorta com diâmetro preservado.<br>
Espessura miocárdica do ventrículo esquerdo aumentada, caracterizando hipertrofia concêntrica.</p>
<p>Desempenho sistólico do ventrículo esquerdo preservado. Não foram observadas alterações segmentares da contratilidade ventricular.</p>
<p>Função diastólica do ventrículo esquerdo alterada - padrão de alteração do relaxamento.</p>
<p>Ventrículo direito com dimensões e desempenho sistólico preservados.</p>
<p><strong>OPINIÃO:</strong> Hipertrofia ventricular esquerda com função sistólica preservada.</p>`;
            break;
        case 'dilatacao':
            template = `<p>Exame realizado com ritmo cardíaco regular. Evidenciando:</p>
<p>Átrio esquerdo com dimensões aumentadas.<br>
Ventrículo esquerdo com dimensões aumentadas.<br>
Espessura miocárdica do ventrículo esquerdo normal.</p>
<p>Desempenho sistólico do ventrículo esquerdo reduzido. Hipocinesia difusa das paredes.</p>
<p>Função diastólica do ventrículo esquerdo alterada - padrão restritivo.</p>
<p>Ventrículo direito com dimensões aumentadas e desempenho sistólico reduzido.</p>
<p><strong>OPINIÃO:</strong> Cardiomiopatia dilatada com disfunção sistólica biventricular.</p>`;
            break;
    }

    editor.innerHTML = template;
}

function saveEditorContent() {
    localStorage.setItem('editorContent', document.getElementById('editor').innerHTML);
}

function loadEditorContent() {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        document.getElementById('editor').innerHTML = savedContent;
    }
}

// Salvar conteúdo automaticamente a cada 30 segundos
setInterval(saveEditorContent, 30000);

// Carregar conteúdo ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadEditorContent();
});
