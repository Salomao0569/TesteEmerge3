// Voice recognition setup
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
}

// Store the current input field being dictated
let currentDictationField = null;

function startDictation(inputId) {
    if (!recognition) {
        showFeedback('Seu navegador não suporta ditado por voz', 'warning');
        return;
    }

    const input = document.getElementById(inputId);
    if (!input) return;

    currentDictationField = input;
    const button = input.nextElementSibling;
    
    // Visual feedback
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.classList.add('btn-danger');
    
    recognition.start();
    showFeedback('Ditado iniciado - fale a medida', 'info');
}

function stopDictation() {
    if (recognition) {
        recognition.stop();
        resetDictationButton();
    }
}

function resetDictationButton() {
    if (!currentDictationField) return;
    
    const button = currentDictationField.nextElementSibling;
    button.innerHTML = '<i class="fas fa-microphone"></i>';
    button.classList.remove('btn-danger');
    currentDictationField = null;
}

// Process voice input
recognition.onresult = (event) => {
    const result = event.results[0][0].transcript.toLowerCase();
    console.log('Ditado recebido:', result);

    if (currentDictationField) {
        // Parse measurements from voice input
        const value = parseMeasurement(result);
        if (value !== null) {
            currentDictationField.value = value;
            currentDictationField.dispatchEvent(new Event('change'));
            showFeedback('Medida registrada: ' + value, 'success');
        } else {
            showFeedback('Não foi possível interpretar a medida', 'warning');
        }
    }
    
    stopDictation();
};

recognition.onerror = (event) => {
    console.error('Erro no reconhecimento de voz:', event.error);
    showFeedback('Erro no reconhecimento de voz', 'danger');
    stopDictation();
};

recognition.onend = () => {
    resetDictationButton();
};

// Parse measurement values from voice input
function parseMeasurement(text) {
    // Remove common words and keep numbers and units
    text = text.replace(/por favor|é|igual|a|aproximadamente|cerca de/g, '').trim();
    
    // Convert written numbers to digits
    const numberWords = {
        'zero': '0', 'um': '1', 'dois': '2', 'três': '3', 'quatro': '4',
        'cinco': '5', 'seis': '6', 'sete': '7', 'oito': '8', 'nove': '9',
        'ponto': '.'
    };
    
    for (const [word, digit] of Object.entries(numberWords)) {
        text = text.replace(new RegExp(word, 'g'), digit);
    }
    
    // Extract number from text
    const match = text.match(/(\d+[.,]?\d*)/);
    if (match) {
        return match[1].replace(',', '.');
    }
    
    return null;
}

// Add dictation buttons to measurement inputs
function initializeDictationButtons() {
    const measurementInputs = document.querySelectorAll('input[type="number"]');
    measurementInputs.forEach(input => {
        if (!input.nextElementSibling?.classList.contains('dictation-btn')) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-outline-secondary btn-sm dictation-btn';
            button.innerHTML = '<i class="fas fa-microphone"></i>';
            button.onclick = () => startDictation(input.id);
            input.parentNode.insertBefore(button, input.nextSibling);
        }
    });
}

// Initialize dictation when document is ready
document.addEventListener('DOMContentLoaded', initializeDictationButtons);
