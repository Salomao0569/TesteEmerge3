// Handle date formatting
function formatarData(input) {
    let valor = input.value.replace(/\D/g, "");
    
    if (valor.length > 8) {
        valor = valor.substring(0, 8);
    }
    
    if (valor.length > 4) {
        valor = valor.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1/$2");
    }

    input.value = valor;
}

// Validate numeric inputs
function validateNumericInput(input, min, max) {
    let value = parseFloat(input.value);
    if (isNaN(value)) {
        input.value = '';
    } else {
        if (min !== undefined && value < min) value = min;
        if (max !== undefined && value > max) value = max;
        input.value = value;
    }
}

// Initialize form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Date input handler
    const dateInput = document.getElementById('dataNascimento');
    if (dateInput) {
        dateInput.addEventListener('input', function() {
            formatarData(this);
        });
    }

    // Numeric input validation
    const numericInputs = document.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateNumericInput(this);
        });
    });
});
