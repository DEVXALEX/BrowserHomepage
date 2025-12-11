(function (app) {
    app.initAmbient = function () {
        const sounds = {
            rain: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3',
            forest: 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3',
            ocean: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
            cafe: 'https://assets.mixkit.co/active_storage/sfx/2458/2458-preview.mp3',
            fire: 'https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3',
            night: 'https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3',
            wind: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3',
            white_noise: 'https://assets.mixkit.co/active_storage/sfx/2396/2396-preview.mp3'
        };

        let currentAudio = new Audio();
        let isPlaying = false;
        let currentSoundId = null;

        // DOM Elements
        const modal = document.getElementById('ambient-modal');
        const toggleBtn = document.getElementById('ambient-toggle-btn');
        const closeBtn = document.getElementById('close-ambient-modal');
        const playPauseBtn = document.getElementById('ambient-play-pause');
        const volumeSlider = document.getElementById('ambient-volume');
        const soundBtns = document.querySelectorAll('.sound-btn');
        const nowPlayingText = document.getElementById('current-sound-name');
        const visualizer = document.querySelector('.visualizer');

        function openModal() {
            modal.classList.add('visible'); // Use visible class like other modals
        }

        function closeModal() {
            modal.classList.remove('visible');
        }

        function playSound(soundId) {
            if (currentSoundId === soundId) {
                togglePlayPause();
                return;
            }

            currentSoundId = soundId;
            const soundUrl = sounds[soundId];

            soundBtns.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`.sound-btn[data-sound="${soundId}"]`);
            if (activeBtn) activeBtn.classList.add('active');

            const soundName = activeBtn ? activeBtn.textContent.trim() : 'Unknown';
            nowPlayingText.textContent = soundName;

            currentAudio.src = soundUrl;
            currentAudio.volume = volumeSlider.value;
            currentAudio.play()
                .then(() => {
                    isPlaying = true;
                    updatePlayPauseIcon();
                    startVisualizer();
                })
                .catch(err => {
                    console.error("Audio play failed:", err);
                    nowPlayingText.textContent = "Error loading sound";
                });
        }

        function togglePlayPause() {
            if (!currentSoundId) {
                playSound('rain');
                return;
            }

            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
                stopVisualizer();
            } else {
                currentAudio.play();
                isPlaying = true;
                startVisualizer();
            }
            updatePlayPauseIcon();
        }

        function updateVolume() {
            currentAudio.volume = volumeSlider.value;
        }

        function updatePlayPauseIcon() {
            playPauseBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        }

        function startVisualizer() {
            visualizer.style.opacity = '1';
        }

        function stopVisualizer() {
            visualizer.style.opacity = '0.3';
        }

        // Event Listeners
        if (toggleBtn) toggleBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
        if (volumeSlider) volumeSlider.addEventListener('input', updateVolume);

        soundBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const soundId = btn.dataset.sound;
                playSound(soundId);
            });
        });

        currentAudio.loop = true;
        currentAudio.addEventListener('ended', () => {
            if (isPlaying) currentAudio.play();
        });

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    };
})(window.Homepage = window.Homepage || {});
