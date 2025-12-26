(function (app) {
    // Using LoremFlickr as Unsplash Source is deprecated
    const CATEGORY_KEYWORDS = {
        nature: 'nature',
        minimal: 'minimalist',
        urban: 'city,architecture',
        space: 'space,galaxy',
        abstract: 'abstract'
    };

    let currentSettings = {
        mode: 'custom',
        category: 'random',
        customUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        blur: 3,
        brightness: 90,
        filter: 'vibrant',
        timeBasedEnabled: false,
        currentImageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    };

    let favorites = [];
    let timeBasedInterval = null;

    app.initBackground = function () {
        const settingsLoaded = loadSettings();
        loadFavorites();
        initTabs();
        initCategoryButtons();
        initSliders();
        initFilters();
        initFavorites();
        initButtons();
        applyAllEffects();

        // Removed random wallpaper fetch on first visit in favor of default settings
        if (currentSettings.timeBasedEnabled) {
            startTimeBasedChecker();
        }
    };

    function loadSettings() {
        const saved = app.Storage.get('backgroundSettings', null);
        if (saved) {
            currentSettings = { ...currentSettings, ...saved };
            return true;
        }
        return false;
    }

    function saveSettings() {
        app.Storage.set('backgroundSettings', currentSettings);
    }

    function loadFavorites() {
        favorites = app.Storage.get('backgroundFavorites', []);
        renderFavorites();
    }

    function saveFavorites() {
        app.Storage.set('backgroundFavorites', favorites);
    }

    function applyBackground(url) {
        const bgElement = document.getElementById('global-background');
        if (!bgElement) return;

        if (!url || !url.trim()) {
            bgElement.style.backgroundImage = 'none';
            currentSettings.currentImageUrl = '';
            saveSettings();
            return;
        }

        // Validate image before applying
        validateImage(url)
            .then(() => {
                bgElement.style.backgroundImage = `url('${url}')`;
                currentSettings.currentImageUrl = url;
                saveSettings();
            })
            .catch(() => {
                alert('Failed to load image. Please check the URL and try again.\nNote: Some sites block hotlinking.');
                // Revert to previous or clear if invalid
            });
    }

    function validateImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = url;
        });
    }

    function applyBlur(value) {
        // Blur is applied via filter on the background element
        applyFilter(currentSettings.filter);
    }

    // Kept for signature compatibility but essentially unused directly now
    // as applyFilter handles all filter composition
    function applyBrightness(value) {
        applyFilter(currentSettings.filter);
    }

    function applyFilter(filterType) {
        const bgElement = document.getElementById('global-background');
        if (!bgElement) return;

        const filters = {
            none: '',
            grayscale: 'grayscale(100%)',
            sepia: 'sepia(100%)',
            vibrant: 'saturate(150%) contrast(110%)',
            dark: 'brightness(70%) contrast(120%)'
        };

        const bodyFilter = filters[filterType] || '';
        const brightness = currentSettings.brightness; // Read from settings directly
        const blur = currentSettings.blur; // Read from settings directly

        let combinedFilter = `brightness(${brightness}%)`;
        if (blur > 0) combinedFilter += ` blur(${blur}px)`;
        if (bodyFilter) combinedFilter += ` ${bodyFilter}`;

        bgElement.style.filter = combinedFilter.trim();
    }

    function applyAllEffects() {
        if (currentSettings.currentImageUrl) {
            applyBackground(currentSettings.currentImageUrl);
        }
        applyBlur(currentSettings.blur);
        applyFilter(currentSettings.filter);
    }

    async function fetchUnsplashImage(category) {
        try {
            const timestamp = Date.now();
            if (category === 'random') {
                return `https://picsum.photos/1920/1080?random=${timestamp}`;
            }

            const keyword = CATEGORY_KEYWORDS[category] || 'nature';
            // LoremFlickr allows keywords
            return `https://loremflickr.com/1920/1080/${keyword}?lock=${timestamp}`;
        } catch (error) {
            console.error('Image fetch error:', error);
            return `https://picsum.photos/1920/1080?random=${Date.now()}`;
        }
    }

    function getTimeBasedCategory() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'nature';
        if (hour >= 12 && hour < 18) return 'urban';
        if (hour >= 18 && hour < 22) return 'minimal';
        return 'space';
    }

    async function applyTimeBasedBackground() {
        const category = getTimeBasedCategory();
        const imageUrl = await fetchUnsplashImage(category);
        applyBackground(imageUrl);
    }

    function startTimeBasedChecker() {
        if (timeBasedInterval) clearInterval(timeBasedInterval);
        timeBasedInterval = setInterval(() => {
            // Only auto-change if enabled AND we are in auto mode
            if (currentSettings.timeBasedEnabled && currentSettings.mode === 'auto') {
                applyTimeBasedBackground();
            }
        }, 3600000);
    }
    function initTabs() {
        const tabs = document.querySelectorAll('.bg-tab');
        const tabContents = document.querySelectorAll('.bg-tab-content');

        if (!tabs.length || !tabContents.length) {
            console.warn("Background tabs elements missing");
            return;
        }

        function setActiveTab(mode) {
            // Deactivate all
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Activate target
            const activeTab = document.querySelector(`.bg-tab[data-tab="${mode}"]`);
            const activeContent = document.getElementById(`${mode}-tab`);

            if (activeTab) activeTab.classList.add('active');
            if (activeContent) activeContent.classList.add('active');
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.dataset.tab;
                currentSettings.mode = targetTab;
                setActiveTab(targetTab);
                saveSettings();
            });
        });

        // Set initial state explicitly
        if (currentSettings.mode) {
            setActiveTab(currentSettings.mode);
        } else {
            setActiveTab('auto'); // Default fallback
        }
    }

    function initCategoryButtons() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSettings.category = btn.dataset.category;
                saveSettings();
            });
        });

        const activeBtn = document.querySelector(`.category-btn[data-category="${currentSettings.category}"]`);
        if (activeBtn) {
            categoryBtns.forEach(b => b.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    }

    function initSliders() {
        const sliders = [
            { slider: document.getElementById('blur-slider'), value: document.getElementById('blur-value'), setting: 'blur', apply: applyBlur, unit: 'px' },
            { slider: document.getElementById('blur-slider-custom'), value: document.getElementById('blur-value-custom'), setting: 'blur', apply: applyBlur, unit: 'px' },
            { slider: document.getElementById('brightness-slider'), value: document.getElementById('brightness-value'), setting: 'brightness', apply: applyBrightness, unit: '%' },
            { slider: document.getElementById('brightness-slider-custom'), value: document.getElementById('brightness-value-custom'), setting: 'brightness', apply: applyBrightness, unit: '%' }
        ];

        sliders.forEach(({ slider, value, setting, apply, unit }) => {
            if (!slider || !value) return;
            slider.value = currentSettings[setting];
            value.textContent = `${currentSettings[setting]}${unit}`;

            slider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                value.textContent = `${val}${unit}`;
                currentSettings[setting] = val;
                apply(val);
                saveSettings();

                // Sync other sliders
                sliders.filter(s => s.setting === setting && s.slider !== slider).forEach(s => {
                    if (s.slider) {
                        s.slider.value = val;
                        s.value.textContent = `${val}${unit}`;
                    }
                });
            });
        });
    }

    function initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const filterBtnsCustom = document.querySelectorAll('.filter-btn-custom');

        const handleFilterClick = (btn) => {
            document.querySelectorAll('.filter-btn, .filter-btn-custom').forEach(b => b.classList.remove('active'));
            const filter = btn.dataset.filter;
            document.querySelectorAll(`[data-filter="${filter}"]`).forEach(b => b.classList.add('active'));
            currentSettings.filter = filter;
            applyFilter(filter);
            saveSettings();
        };

        filterBtns.forEach(btn => btn.addEventListener('click', () => handleFilterClick(btn)));
        filterBtnsCustom.forEach(btn => btn.addEventListener('click', () => handleFilterClick(btn)));

        // Set initial - remove all active first
        document.querySelectorAll('.filter-btn, .filter-btn-custom').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-filter="${currentSettings.filter}"]`).forEach(b => b.classList.add('active'));
    }

    function initFavorites() {
        renderFavorites();
        const addToFavBtn = document.getElementById('add-to-favorites-btn');
        if (addToFavBtn) {
            addToFavBtn.addEventListener('click', addCurrentToFavorites);
        }
    }

    function renderFavorites() {
        const favGrid = document.getElementById('favorites-grid');
        if (!favGrid) return;

        if (favorites.length === 0) {
            favGrid.innerHTML = '<p class="empty-favorites">No favorites yet. Click the heart to save images!</p>';
            return;
        }

        favGrid.innerHTML = favorites.map((fav, idx) => `
            <div class="favorite-item" data-index="${idx}">
                <img src="${fav.thumbnail}" alt="Favorite ${idx + 1}">
                <button class="remove-favorite" data-index="${idx}">×</button>
            </div>
        `).join('');

        favGrid.querySelectorAll('.favorite-item img').forEach((img, idx) => {
            img.addEventListener('click', () => {
                applyBackground(favorites[idx].url);
                // Fix for Item 12: Ensure mode is switched so it doesn't get overridden or confused
                currentSettings.mode = 'custom';
                // Update UI tabs to reflect this
                const customTabBtn = document.querySelector('.bg-tab[data-tab="custom"]');
                if (customTabBtn) customTabBtn.click(); // Trigger tab switch UI
                saveSettings();
            });
        });

        favGrid.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                favorites.splice(parseInt(btn.dataset.index), 1);
                saveFavorites();
                renderFavorites();
            });
        });
    }

    function addCurrentToFavorites() {
        if (!currentSettings.currentImageUrl) {
            alert('No background image to save!');
            return;
        }

        if (favorites.length >= 20) {
            alert('Maximum 20 favorites. Remove some to add more.');
            return;
        }

        if (favorites.some(f => f.url === currentSettings.currentImageUrl)) {
            alert('This image is already in your favorites!');
            return;
        }

        favorites.push({
            id: Date.now().toString(),
            url: currentSettings.currentImageUrl,
            thumbnail: currentSettings.currentImageUrl
        });

        saveFavorites();
        renderFavorites();
    }

    function initButtons() {
        const bgToggleBtn = document.getElementById('bg-toggle-btn');
        const bgModal = document.getElementById('bg-modal');
        const closeBgModal = document.getElementById('close-bg-modal');
        const cancelBgForm = document.getElementById('cancel-bg-form');

        if (bgToggleBtn && bgModal) {
            bgToggleBtn.addEventListener('click', () => bgModal.classList.add('visible'));
        }

        if (closeBgModal && bgModal) {
            closeBgModal.addEventListener('click', () => bgModal.classList.remove('visible'));
        }

        if (cancelBgForm && bgModal) {
            cancelBgForm.addEventListener('click', () => bgModal.classList.remove('visible'));
        }

        if (bgModal) {
            bgModal.addEventListener('click', (e) => {
                if (e.target === bgModal) bgModal.classList.remove('visible');
            });
        }

        const fetchRandomBtn = document.getElementById('fetch-random-btn');
        if (fetchRandomBtn) {
            fetchRandomBtn.addEventListener('click', async () => {
                fetchRandomBtn.disabled = true;
                fetchRandomBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
                const imageUrl = await fetchUnsplashImage(currentSettings.category);
                applyBackground(imageUrl);
                fetchRandomBtn.disabled = false;
                fetchRandomBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Get Random Image';
            });
        }

        const applyCustomBtn = document.getElementById('apply-custom-btn');
        const bgUrlInput = document.getElementById('bg-url-input');
        const pasteBgUrlBtn = document.getElementById('paste-bg-url-btn');

        if (applyCustomBtn && bgUrlInput) {
            bgUrlInput.value = currentSettings.customUrl;

            const handleApply = () => {
                const url = bgUrlInput.value.trim();
                if (url) {
                    applyCustomBtn.textContent = 'Verifying...';
                    applyCustomBtn.disabled = true;

                    // Use common validation
                    validateImage(url)
                        .then(() => {
                            // Fix for Item 12: Use consistent apply function
                            applyBackground(url); // This handles currentSettings update and saving

                            // Explicitly switch mode to custom if not already done by applyBackground logic
                            // (applyBackground mainly sets the image, ensure mode is consistent)
                            currentSettings.mode = 'custom';
                            const customTabBtn = document.querySelector('.bg-tab[data-tab="custom"]');
                            if (customTabBtn) customTabBtn.classList.add('active'); // Visual update if needed

                            saveSettings();

                            applyCustomBtn.textContent = 'Apply Image';
                            applyCustomBtn.disabled = false;
                        })
                        .catch(() => {
                            alert('Failed to load image. Please check the URL and try again.');
                            applyCustomBtn.textContent = 'Apply Image';
                            applyCustomBtn.disabled = false;
                        });
                }
            };

            applyCustomBtn.addEventListener('click', handleApply);

            bgUrlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleApply();
                }
            });

            if (pasteBgUrlBtn) {
                pasteBgUrlBtn.addEventListener('click', async () => {
                    try {
                        const text = await navigator.clipboard.readText();
                        bgUrlInput.value = text;
                        // Optional: Auto-submit on paste? Maybe too aggressive. let's just focus.
                        bgUrlInput.focus();
                    } catch (err) {
                        console.error('Failed to read clipboard contents: ', err);
                        alert('Clipboard access denied. Please paste manually.');
                    }
                });
            }
        }

        const clearBgBtn = document.getElementById('clear-bg-btn');
        if (clearBgBtn) {
            clearBgBtn.addEventListener('click', () => {
                applyBackground('');
                if (bgUrlInput) bgUrlInput.value = '';
            });
        }

        const timeBasedToggle = document.getElementById('time-based-toggle');
        if (timeBasedToggle) {
            timeBasedToggle.checked = currentSettings.timeBasedEnabled;
            timeBasedToggle.addEventListener('change', async (e) => {
                currentSettings.timeBasedEnabled = e.target.checked;
                saveSettings();
                if (e.target.checked) {
                    await applyTimeBasedBackground();
                    startTimeBasedChecker();
                } else {
                    if (timeBasedInterval) {
                        clearInterval(timeBasedInterval);
                        timeBasedInterval = null;
                    }
                }
            });
        }
    }

})(window.Homepage = window.Homepage || {});
