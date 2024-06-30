document.addEventListener('DOMContentLoaded', async function () {
    const apiKey = '5dc42f772f83fef422dafa51';
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    let exchangeRates = {};
    let currencyElements = [];
    let currencyNames = {};

    async function loadCurrencyNames() {
        const response = await fetch('/currencies.json');
        currencyNames = await response.json();
    }

    await loadCurrencyNames();

    async function fetchExchangeRates() {
        const response = await fetch(apiUrl);
        const data = await response.json();
        exchangeRates = data.conversion_rates;
        addCurrencyRow('EUR');
        addCurrencyRow('CZK');
        toggleDeleteButtons();
        document.getElementById('addCurrency').style.display = 'block';
    }

    function addCurrencyRow(selectedCurrency) {
        const container = document.createElement('div');
        container.className = 'currency-row';

        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.value = '1';
        amountInput.className = 'amount';
        amountInput.placeholder = "Enter the amount...";
        amountInput.min = '0';

        const select = document.createElement('select');
        select.className = 'currency-select';
        Object.entries(currencyNames).forEach(([code, name]) => {
            const option = new Option(`${code} - ${name}`, code);
            option.selected = code === selectedCurrency;
            select.appendChild(option);
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-currency';
        const img = document.createElement('img');
        img.src = document.body.classList.contains('light-mode') ? '/icons/black_trash_bin.png' : '/icons/white_trash_bin.png';
        img.alt = 'Remove';
        img.className = 'trash-icon';
        deleteButton.appendChild(img);
        deleteButton.onclick = function() {
            const index = currencyElements.indexOf(container);
            if (index > -1) {
                currencyElements.splice(index, 1);
            }
            container.remove();
            toggleDeleteButtons();
            updateConversions();
        };
        deleteButton.style.display = 'none';

        container.appendChild(amountInput);
        container.appendChild(select);
        container.appendChild(deleteButton);
        document.getElementById('currencyContainer').appendChild(container);

        amountInput.addEventListener('input', updateConversions);
        select.addEventListener('change', updateConversions);

        currencyElements.push(container);
        toggleDeleteButtons();
        updateConversions();
    }

    function updateConversions() {
        if (currencyElements.length === 0) return;
        const baseIndex = findBaseCurrencyIndex();
        const baseAmount = parseFloat(currencyElements[baseIndex].querySelector('.amount').value);
        const baseCurrency = currencyElements[baseIndex].querySelector('.currency-select').value;

        currencyElements.forEach((el, index) => {
            if (index !== baseIndex) {
                const amountInput = el.querySelector('.amount');
                const currencySelect = el.querySelector('.currency-select').value;
                const rate = exchangeRates[currencySelect] / exchangeRates[baseCurrency];
                amountInput.value = parseFloat((baseAmount * rate).toFixed(4)).toString();
            }
        });
    }

    function findBaseCurrencyIndex() {
        const activeElement = document.activeElement;
        let baseIndex = 0;
        currencyElements.forEach((el, index) => {
            if (el.querySelector('.amount') === activeElement) {
                baseIndex = index;
            }
        });
        return baseIndex;
    }

    function toggleDeleteButtons() {
        currencyElements.forEach(el => {
            const deleteButton = el.querySelector('.delete-currency');
            deleteButton.style.display = currencyElements.length > 2 ? 'block' : 'none';
        });
    }

    document.getElementById('addCurrency').addEventListener('click', function() {
        addCurrencyRow('USD');
        if (currencyElements.length > 2) {
            currencyElements.forEach(el => {
                el.querySelector('.delete-currency').disabled = false;
            });
        }
    });
    document.getElementById('theme-switcher').addEventListener('change', function() {
        const isChecked = this.checked;
        document.body.classList.toggle('light-mode', isChecked);
        updateTrashIcons();
        updateIcons(isChecked);
    });

    function updateTrashIcons() {
        document.querySelectorAll('.trash-icon').forEach(img => {
            img.src = document.body.classList.contains('light-mode') ? '/icons/black_trash_bin.png' : '/icons/white_trash_bin.png';
        });
    }

    function updateIcons(isLightMode) {
        document.getElementById('dark-mode-icon').src = isLightMode ? '/icons/black_moon.png' : '/icons/white_moon.png';
        document.getElementById('light-mode-icon').src =  isLightMode ? '/icons/black_sun.png' : '/icons/white_sun.png';
    }

    await fetchExchangeRates();
});
