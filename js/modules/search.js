(function (app) {
    app.initSearch = function () {
        let isGeminiMode = false;

        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchToggleSwitch = document.getElementById('search-toggle-switch');
        const searchModeIcon = document.getElementById('search-mode-icon');
        const copyFeedback = document.getElementById('copy-feedback');

        function setSearchMode(isGemini) {
            isGeminiMode = isGemini;
            searchToggleSwitch.checked = isGemini;

            if (isGemini) {
                searchInput.placeholder = 'Ask Gemini (text will be copied)...';
                searchForm.action = 'https://gemini.google.com/';
                searchInput.name = '';
                searchModeIcon.innerHTML = '<img src="gemini_sparkle.png" class="gemini-img-icon" alt="Gemini">';
            } else {
                searchInput.placeholder = 'Search Google...';
                searchForm.action = 'https://www.google.com/search';
                searchInput.name = 'q';
                searchModeIcon.innerHTML = '<i class="fa-brands fa-google"></i>';
            }
            app.Storage.setString('searchMode', isGemini ? 'gemini' : 'google');
        }

        searchToggleSwitch.addEventListener('change', () => setSearchMode(searchToggleSwitch.checked));

        searchForm.addEventListener('submit', (e) => {
            if (isGeminiMode) {
                e.preventDefault();
                const searchText = searchInput.value;
                if (!searchText) return;

                navigator.clipboard.writeText(searchText)
                    .then(() => {
                        copyFeedback.classList.add('visible');
                        setTimeout(() => {
                            copyFeedback.classList.remove('visible');
                        }, 2000);

                        window.open('https://gemini.google.com/', '_blank');
                        searchInput.value = '';
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        window.open('https://gemini.google.com/', '_blank');
                    });
            }
        });

        // Load saved mode
        const savedMode = app.Storage.getString('searchMode', 'google');
        setSearchMode(savedMode === 'gemini');
    };
})(window.Homepage = window.Homepage || {});
