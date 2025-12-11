(function (app) {
    let currentDate = new Date();
    let selectedDate = new Date();
    let notesData = {};
    let isFullScreen = false;

    app.initCalendar = function () {
        loadNotes();
        renderCalendar();
        initListeners();
    };

    function loadNotes() {
        notesData = app.Storage.get('calendarNotes', {});
    }

    function saveNotes() {
        app.Storage.set('calendarNotes', notesData);
    }

    function renderCalendar() {
        const monthYearEl = document.getElementById('calendar-month-year');
        const daysEl = document.getElementById('calendar-days');

        if (!monthYearEl || !daysEl) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        monthYearEl.textContent = `${monthNames[month]} ${year}`;
        daysEl.innerHTML = ""; // Clear existing

        // Get first day of month (0-6, Sun-Sat)
        let firstDay = new Date(year, month, 1).getDay();
        // Adjust for Monday start: Mon(1)->0, Tue(2)->1... Sun(0)->6
        let firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        // Calculate remaining cells for next month
        const totalCells = firstDayIndex + lastDay;
        const nextDays = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);

        // Previous Month Days
        for (let x = firstDayIndex; x > 0; x--) {
            const dayDiv = document.createElement("div");
            dayDiv.className = "day prev-date";
            // Make sure visibility is high
            dayDiv.innerHTML = `<span class="day-number">${prevLastDay - x + 1}</span>`;
            daysEl.appendChild(dayDiv);
        }

        // Current Month Days
        for (let i = 1; i <= lastDay; i++) {
            const dateStr = formatDateKey(year, month, i);
            const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const isSelected = i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
            const notes = notesData[dateStr] || [];
            const hasNotes = notes.length > 0;

            let classNames = "day";
            if (isToday) classNames += " today";
            if (isSelected) classNames += " selected";
            if (hasNotes) classNames += " has-notes";

            const dayDiv = document.createElement("div");
            dayDiv.className = classNames;

            // Inner HTML for Number + Previews
            let notesPreviewHTML = '';
            if (hasNotes) {
                notes.slice(0, 3).forEach(note => {
                    notesPreviewHTML += `<div class="day-note-preview">${note}</div>`;
                });
                if (notes.length > 3) {
                    notesPreviewHTML += `<div class="day-note-preview" style="font-style:italic;">+${notes.length - 3} more</div>`;
                }
            }

            dayDiv.innerHTML = `<span class="day-number">${i}</span>${notesPreviewHTML}`;

            dayDiv.addEventListener("click", () => {
                selectedDate = new Date(year, month, i);
                renderCalendar();
                renderNotes();
            });
            daysEl.appendChild(dayDiv);
        }

        // Next Month Days
        for (let j = 1; j <= nextDays; j++) {
            const dayDiv = document.createElement("div");
            dayDiv.className = "day next-date";
            dayDiv.innerHTML = `<span class="day-number">${j}</span>`;
            daysEl.appendChild(dayDiv);
        }

        renderNotes();
    }

    function renderNotes() {
        const dateKey = formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const dayEl = document.getElementById('selected-date-day');
        const fullDateEl = document.getElementById('selected-date-full');
        const listEl = document.getElementById('date-notes-list');

        if (!dayEl || !listEl) return;

        // Header Update
        dayEl.textContent = selectedDate.getDate();
        const options = { weekday: 'long', month: 'long', year: 'numeric' };
        fullDateEl.textContent = selectedDate.toLocaleDateString('en-US', options);

        // List Update
        listEl.innerHTML = "";
        const notes = notesData[dateKey] || [];

        if (notes.length === 0) {
            listEl.innerHTML = `<li class="empty-note-state">No notes for this day.</li>`;
        } else {
            notes.forEach((note, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${note}</span>
                    <button class="delete-note-btn" data-index="${index}">×</button>
                `;
                listEl.appendChild(li);
            });

            // Delete listeners
            const deleteBtns = listEl.querySelectorAll('.delete-note-btn');
            deleteBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.index);
                    deleteNote(dateKey, idx);
                });
            });
        }
    }

    function addNote(text) {
        if (!text.trim()) return;
        const dateKey = formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        if (!notesData[dateKey]) {
            notesData[dateKey] = [];
        }
        notesData[dateKey].push(text.trim());
        saveNotes();
        renderNotes();
        renderCalendar();
    }

    function deleteNote(dateKey, index) {
        if (notesData[dateKey]) {
            notesData[dateKey].splice(index, 1);
            if (notesData[dateKey].length === 0) delete notesData[dateKey];
            saveNotes();
            renderNotes();
            renderCalendar();
        }
    }

    function formatDateKey(year, month, day) {
        // YYYY-MM-DD format for keys
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function initListeners() {
        document.getElementById('prev-month-btn')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById('next-month-btn')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        const form = document.getElementById('date-note-form');
        const input = document.getElementById('date-note-input');

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            addNote(input.value);
            input.value = "";
        });

        // Close Modal Logic
        const closeBtn = document.getElementById('close-calendar-btn');
        const modal = document.getElementById('calendar-modal');
        closeBtn?.addEventListener('click', () => {
            modal.classList.remove('visible');
            setTimeout(() => {
                if (isFullScreen) toggleFullScreen();
            }, 300);
        });

        // Toggle Full Screen Logic
        const toggleBtn = document.getElementById('calendar-view-toggle');
        toggleBtn?.addEventListener('click', toggleFullScreen);
    }

    function toggleFullScreen() {
        const modal = document.getElementById('calendar-modal');
        const icon = document.querySelector('#calendar-view-toggle i');
        isFullScreen = !isFullScreen;

        if (isFullScreen) {
            modal.classList.add('full-screen');
            if (icon) icon.className = "fa-solid fa-compress";
        } else {
            modal.classList.remove('full-screen');
            if (icon) icon.className = "fa-solid fa-expand";
        }
    }

})(window.Homepage = window.Homepage || {});
