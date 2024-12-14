
function validateNumericInput(input, min, max) {
    const value = parseFloat(input.value);
    if (isNaN(value)) {
        showError(input, 'Valor inválido');
        return false;
    }
    if (value < min || value > max) {
        showError(input, `Valor deve estar entre ${min} e ${max}`);
        return false;
    }
    removeError(input);
    return true;
}

function showError(input, message) {
    input.classList.add('is-invalid');
    const errorDiv = input.nextElementSibling || document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    if (!input.nextElementSibling) {
        input.parentNode.appendChild(errorDiv);
    }
}

function removeError(input) {
    input.classList.remove('is-invalid');
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.className === 'invalid-feedback') {
        errorDiv.remove();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const numericInputs = {
        'peso': { min: 0.5, max: 300 },
        'altura': { min: 30, max: 250 },
        'atrio': { min: 10, max: 100 },
        'aorta': { min: 10, max: 100 },
        'diam_diast_final': { min: 10, max: 100 },
        'diam_sist_final': { min: 10, max: 100 },
        'esp_diast_septo': { min: 1, max: 50 },
        'esp_diast_ppve': { min: 1, max: 50 },
        'vd': { min: 1, max: 100 }
    };

    Object.entries(numericInputs).forEach(([id, limits]) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                validateNumericInput(input, limits.min, limits.max);
            });
        }
    });
});
