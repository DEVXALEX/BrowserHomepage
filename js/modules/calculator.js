(function (app) {
    app.initCalculator = function () {
        const modal = document.getElementById('calculator-modal');
        const toggleBtn = document.getElementById('calculator-toggle-btn');
        const closeBtn = document.getElementById('close-calculator-modal');
        const historyDisplay = document.getElementById('calc-history');
        const resultDisplay = document.getElementById('calc-result');
        const keys = document.querySelectorAll('.calc-btn');

        let currentInput = '0';
        let expression = '';
        let shouldResetInput = false;

        function openModal() {
            if (modal) {
                modal.classList.add('visible');
            }
        }

        function closeModal() {
            if (modal) {
                modal.classList.remove('visible');
            }
        }

        function handleInput(key) {
            const value = key.dataset.value;
            const action = key.dataset.action;

            // Check action first because operator buttons have both action AND value
            if (action) {
                handleAction(action, key.dataset.value);
            } else if (value !== undefined) {
                appendNumber(value);
            }
        }

        function handleKeyboardInput(e) {
            if (!modal || !modal.classList.contains('visible')) return;

            const key = e.key;

            if (/[0-9.]/.test(key)) {
                appendNumber(key);
            } else if (['+', '-', '*', '/'].includes(key)) {
                handleAction('operator', key);
            } else if (key === 'Enter' || key === '=') {
                handleAction('calculate');
            } else if (key === 'Backspace') {
                handleAction('backspace');
            } else if (key === 'Escape') {
                handleAction('clear');
            }
        }

        function appendNumber(number) {
            if (currentInput === '0' || shouldResetInput) {
                currentInput = number;
                shouldResetInput = false;
            } else {
                if (number === '.' && currentInput.includes('.')) return;
                currentInput += number;
            }
            updateDisplay();
        }

        function handleAction(action, value) {
            switch (action) {
                case 'clear':
                    currentInput = '0';
                    expression = '';
                    if (historyDisplay) historyDisplay.textContent = '';
                    break;
                case 'backspace':
                    currentInput = currentInput.slice(0, -1) || '0';
                    break;
                case 'percent':
                    currentInput = (parseFloat(currentInput) / 100).toString();
                    break;
                case 'operator':
                    if (expression && !shouldResetInput) {
                        calculate();
                    }
                    expression = currentInput + ' ' + value;
                    shouldResetInput = true;
                    if (historyDisplay) historyDisplay.textContent = expression;
                    break;
                case 'calculate':
                    console.log('Equal button clicked! Expression:', expression, 'Current:', currentInput);
                    if (expression) {
                        calculate();
                        expression = '';
                        if (historyDisplay) historyDisplay.textContent = '';
                        shouldResetInput = true;
                    } else {
                        console.log('No expression to calculate - need to enter operator first');
                    }
                    break;
            }
            updateDisplay();
        }

        function calculate() {
            try {
                const fullExpression = expression + ' ' + currentInput;
                console.log('Calculating:', fullExpression);

                const result = Function('"use strict";return (' + fullExpression + ')')();

                console.log('Result:', result);
                currentInput = result.toString();

                if (currentInput.includes('.')) {
                    currentInput = parseFloat(result).toFixed(4).replace(/\.?0+$/, '');
                }
            } catch (e) {
                console.error('Calculation error:', e);
                currentInput = 'Error';
            }
        }

        function updateDisplay() {
            if (resultDisplay) {
                resultDisplay.textContent = currentInput;
                console.log('Display updated:', currentInput);
            }
        }

        // Event Listeners
        if (toggleBtn) toggleBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        keys.forEach(key => {
            key.addEventListener('click', () => handleInput(key));
        });

        document.addEventListener('keydown', handleKeyboardInput);

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    };
})(window.Homepage = window.Homepage || {});
