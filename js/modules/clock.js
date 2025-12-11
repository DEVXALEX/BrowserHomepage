(function (app) {
    app.initClock = function () {
        const timeElement = document.getElementById('time');
        const dateElement = document.getElementById('date-display');

        let currentMode = app.Storage.get('clockMode', 'digital'); // 'digital', 'analog', 'word'

        function updateTime() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            // Update Greeting
            // Update Date
            if (dateElement) {
                const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
                // e.g., "MONDAY, DECEMBER 8, 2025" or similar format
                // User asked for "add a date above Time with small font size"
                dateElement.textContent = now.toLocaleDateString('en-US', options);
            }

            // Render Clock based on Mode
            if (currentMode === 'digital') {
                renderDigitalClock(hours, minutes);
            } else if (currentMode === 'analog') {
                renderAnalogClock(hours, minutes, seconds);
            } else if (currentMode === 'word') {
                renderWordClock(hours, minutes);
            }
        }

        function renderDigitalClock(hours, minutes) {
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            timeElement.innerHTML = timeString;
            timeElement.className = 'digital-clock';
            timeElement.style.fontSize = '6rem'; // Reset size
        }

        function renderAnalogClock(hours, minutes, seconds) {
            // Calculate degrees (ensure 0-360 range)
            const secondDeg = ((seconds / 60) * 360) % 360;
            const minuteDeg = (((minutes / 60) * 360) + ((seconds / 60) * 6)) % 360;
            const hourDeg = (((hours % 12) / 12) * 360) + ((minutes / 60) * 30);

            timeElement.innerHTML = `
                <div class="analog-clock">
                    <div class="hand hour" style="transform: translateX(-50%) rotate(${hourDeg}deg);"></div>
                    <div class="hand minute" style="transform: translateX(-50%) rotate(${minuteDeg}deg);"></div>
                    <div class="hand second" style="transform: translateX(-50%) rotate(${secondDeg}deg);"></div>
                    <div class="center-dot"></div>
                </div>
            `;
            timeElement.className = ''; // Remove specific class
        }

        function renderWordClock(hours, minutes) {
            const words = timeToWords(hours, minutes);
            timeElement.innerHTML = words;
            timeElement.className = 'word-clock';
            timeElement.style.fontSize = '3rem';
        }



        function timeToWords(h, m) {
            const numbers = [
                "twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"
            ];

            // Convert 24h to 12h
            const hour12 = h % 12;
            const nextHour = (hour12 + 1) % 12;

            if (m === 0) return `It's ${numbers[hour12]} o'clock`;
            if (m === 15) return `Quarter past ${numbers[hour12]}`;
            if (m === 30) return `Half past ${numbers[hour12]}`;
            if (m === 45) return `Quarter to ${numbers[nextHour]}`;

            if (m < 30) return `${m} past ${numbers[hour12]}`;
            return `${60 - m} to ${numbers[nextHour]}`;
        }

        function toggleMode() {
            if (currentMode === 'digital') currentMode = 'analog';
            else if (currentMode === 'analog') currentMode = 'word';
            else currentMode = 'digital';

            app.Storage.set('clockMode', currentMode);
            updateTime();
        }

        // Initialize
        if (timeElement) {
            timeElement.addEventListener('click', toggleMode);
            timeElement.title = "Click to switch clock mode";
        }

        updateTime();
        setInterval(updateTime, 1000);
    };
})(window.Homepage = window.Homepage || {});
