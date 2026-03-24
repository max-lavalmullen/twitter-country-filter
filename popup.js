document.addEventListener('DOMContentLoaded', () => {
    const countryInput = document.getElementById('countryInput');
    const addBtn = document.getElementById('addBtn');
    const countryList = document.getElementById('countryList');

    // Load saved countries
    chrome.storage.local.get(['blockedCountries'], (result) => {
        const countries = result.blockedCountries || [];
        countries.forEach(addCountryToList);
    });

    addBtn.addEventListener('click', () => {
        const country = countryInput.value.trim();
        if (country) {
            addCountry(country);
        }
    });

    document.getElementById('clearCacheBtn').addEventListener('click', () => {
        chrome.storage.local.remove('userLocations', () => {
            alert('Location cache cleared!');
        });
    });

    countryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const country = countryInput.value.trim();
            if (country) {
                addCountry(country);
            }
        }
    });

    function addCountry(country) {
        chrome.storage.local.get(['blockedCountries'], (result) => {
            const countries = result.blockedCountries || [];
            if (!countries.includes(country)) {
                countries.push(country);
                chrome.storage.local.set({ blockedCountries: countries }, () => {
                    addCountryToList(country);
                    countryInput.value = '';
                });
            } else {
                alert('Country already in blocklist');
            }
        });
    }

    function removeCountry(country) {
        chrome.storage.local.get(['blockedCountries'], (result) => {
            const countries = result.blockedCountries || [];
            const updatedCountries = countries.filter(c => c !== country);
            chrome.storage.local.set({ blockedCountries: updatedCountries }, () => {
                renderList(updatedCountries);
            });
        });
    }

    function addCountryToList(country) {
        const li = document.createElement('li');
        li.textContent = country;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.className = 'remove-btn';
        removeBtn.title = 'Remove';
        removeBtn.onclick = () => removeCountry(country);

        li.appendChild(removeBtn);
        countryList.appendChild(li);
    }

    function renderList(countries) {
        countryList.innerHTML = '';
        countries.forEach(addCountryToList);
    }
});
