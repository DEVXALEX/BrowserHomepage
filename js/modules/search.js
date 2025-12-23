(function (app) {
    app.initSearch = function () {
        let isGeminiMode = false;
        let currentFocus = -1;
        let suggestionData = [];

        const searchContainer = document.querySelector('.search-container');
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchToggleSwitch = document.getElementById('search-toggle-switch');
        const searchModeIcon = document.getElementById('search-mode-icon');
        const copyFeedback = document.getElementById('copy-feedback');

        // Create Wrapper for positioning
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'search-wrapper';
        searchWrapper.style.position = 'relative';

        // Insert wrapper before form, then move form into it
        searchContainer.insertBefore(searchWrapper, searchForm);
        searchWrapper.appendChild(searchForm);

        // Create Suggestions Container
        const suggestionsBox = document.createElement('div');
        suggestionsBox.className = 'search-suggestions';
        searchWrapper.appendChild(suggestionsBox);

        function setSearchMode(isGemini) {
            isGeminiMode = isGemini;
            searchToggleSwitch.checked = isGemini;

            if (isGemini) {
                searchInput.placeholder = 'Ask Gemini (text will be copied)...';
                searchForm.action = 'https://gemini.google.com/';
                searchInput.name = '';
                searchModeIcon.innerHTML = '<img src="gemini_sparkle.png" class="gemini-img-icon" alt="Gemini">';
                closeSuggestions();
            } else {
                searchInput.placeholder = 'Search Google...';
                searchForm.action = 'https://www.google.com/search';
                searchInput.name = 'q';
                searchModeIcon.innerHTML = '<i class="fa-brands fa-google"></i>';
            }
            app.Storage.setString('searchMode', isGemini ? 'gemini' : 'google');
        }

        searchToggleSwitch.addEventListener('change', () => setSearchMode(searchToggleSwitch.checked));

        // Submit Handler
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Always prevent default to handle clearing manually

            const searchText = searchInput.value.trim();
            if (!searchText) return;

            if (isGeminiMode) {
                navigator.clipboard.writeText(searchText)
                    .then(() => {
                        copyFeedback.classList.add('visible');
                        setTimeout(() => copyFeedback.classList.remove('visible'), 2000);
                        window.open('https://gemini.google.com/', '_blank');
                        searchInput.value = '';
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        window.open('https://gemini.google.com/', '_blank');
                    });
            } else {
                // Google Search
                const query = encodeURIComponent(searchText);
                window.open(`https://www.google.com/search?q=${query}`, '_blank');
                searchInput.value = '';
                closeSuggestions();
            }
        });

        // Suggestions Logic
        app.handleSearchSuggestions = function (data) {
            if (isGeminiMode) return; // No suggestions for Gemini
            suggestionData = data[1];
            renderSuggestions(suggestionData);
        };

        function fetchSuggestions(query) {
            if (isGeminiMode || !query) {
                closeSuggestions();
                return;
            }
            const script = document.createElement('script');
            // JSONP callback
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=window.Homepage.handleSearchSuggestions`;
            document.body.appendChild(script);
            script.onload = () => document.body.removeChild(script);
            script.onerror = () => document.body.removeChild(script);
        }

        function renderSuggestions(suggestions) {
            if (!suggestions || suggestions.length === 0) {
                closeSuggestions();
                return;
            }

            currentFocus = -1;
            suggestionsBox.innerHTML = '';
            suggestionsBox.classList.add('visible');
            searchForm.classList.add('suggestions-open');

            const ul = document.createElement('ul');
            suggestions.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> <span>${item}</span>`;
                li.addEventListener('click', function () {
                    searchInput.value = item;
                    // Trigger submit or just focus? Let's just submit
                    // searchForm.dispatchEvent(new Event('submit')); // This might not work due to isTrusted, manual trigger better

                    // Manually trigger submission logic
                    const query = encodeURIComponent(item);
                    window.open(`https://www.google.com/search?q=${query}`, '_blank');
                    searchInput.value = '';
                    closeSuggestions();
                });
                ul.appendChild(li);
            });
            suggestionsBox.appendChild(ul);
        }

        function addActive(items) {
            if (!items) return false;
            removeActive(items);
            if (currentFocus >= items.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (items.length - 1);
            items[currentFocus].classList.add('active');

            // Auto-fill input with focused item? Optional.
            // standard behavior is just highlighting.
            searchInput.value = items[currentFocus].innerText;
        }

        function removeActive(items) {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove('active');
            }
        }

        function closeSuggestions() {
            currentFocus = -1;
            suggestionsBox.classList.remove('visible');
            // Clear HTML after transition for cleanliness
            setTimeout(() => {
                if (!suggestionsBox.classList.contains('visible')) {
                    suggestionsBox.innerHTML = '';
                }
            }, 550);
            searchForm.classList.remove('suggestions-open');
        }

        // Input Listeners
        searchInput.addEventListener('input', app.debounce(function () {
            fetchSuggestions(this.value);
        }, 100));

        searchInput.addEventListener('keydown', function (e) {
            if (isGeminiMode) return;

            let list = suggestionsBox.querySelector('ul');
            if (list) list = list.getElementsByTagName('li');

            if (e.key === 'ArrowDown') {
                currentFocus++;
                addActive(list);
            } else if (e.key === 'ArrowUp') {
                currentFocus--;
                addActive(list);
            } else if (e.key === 'Enter') {
                // If item is active, click it
                if (currentFocus > -1 && list) {
                    e.preventDefault();
                    if (list[currentFocus]) list[currentFocus].click();
                }
            } else if (e.key === 'Escape') {
                closeSuggestions();
            }
        });

        // Close on click outside
        document.addEventListener('click', function (e) {
            if (e.target !== searchInput && e.target !== suggestionsBox) {
                closeSuggestions();
            }
        });

        // Load saved mode
        const savedMode = app.Storage.getString('searchMode', 'google');
        setSearchMode(savedMode === 'gemini');
    };
})(window.Homepage = window.Homepage || {});
