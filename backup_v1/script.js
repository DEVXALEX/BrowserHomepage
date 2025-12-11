// --- Greeting & Clock ---
(function () {
    function updateTimeAndGreeting() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeString = `${displayHours}:${minutes} ${ampm}`;

        document.getElementById('clock').textContent = timeString;

        let greeting;
        if (hours < 12) {
            greeting = "Good Morning";
        } else if (hours < 18) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }
        document.getElementById('greeting').textContent = greeting;
    }
    updateTimeAndGreeting();
    setInterval(updateTimeAndGreeting, 1000);
})();

// =====================================================
// DYNAMIC WIDGET MANAGER
// =====================================================

const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Your limitation—it's only your imagination. - Unknown",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Push yourself, because no one else is going to do it for you. - Unknown",
    "Great things never come from comfort zones. - Unknown",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The best way to predict the future is to create it. - Abraham Lincoln",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
    "Act as if what you do makes a difference. It does. - William James",
    "The secret of getting ahead is getting started. - Mark Twain",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
    "Strive not to be a success, but rather to be of value. - Albert Einstein",
    "Life is 10% what happens to us and 90% how we react to it. - Charles R. Swindoll",
    "The hard days are what make you stronger. - Aly Raisman",
    "Don't stop when you're tired. Stop when you're done. - Unknown",
    "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "Your positive action combined with positive thinking results in success. - Shiv Khera",
    "Perfection is not attainable, but if we chase perfection we can catch excellence. - Vince Lombardi",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Hardships often prepare ordinary people for an extraordinary destiny. - C.S. Lewis",
    "You don't have to be great to start, but you have to start to be great. - Zig Ziglar",
    "Continuous improvement is better than delayed perfection. - Mark Twain",
    "One day or day one. You decide. - Unknown",
    "Small progress is still progress. - Unknown",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Everything you’ve ever wanted is on the other side of fear. - George Addair",
    "Discipline is the bridge between goals and accomplishment. - Jim Rohn",
    "A year from now you may wish you had started today. - Karen Lamb",
    "The expert in anything was once a beginner. - Helen Hayes",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. - Aristotle",
    "Do what you can, with what you have, where you are. - Theodore Roosevelt",
    "Be better today than you were yesterday. - Unknown"
];


document.addEventListener('DOMContentLoaded', () => {

    // --- Default Data ---
    const defaultData = [
        {
            id: 1,
            title: "Social",
            links: [
                { id: 101, name: "YouTube", url: "https://www.youtube.com", icon: "fa-brands fa-youtube" },
                { id: 102, name: "Reddit", url: "https://www.reddit.com", icon: "fa-brands fa-reddit-alien" },
                { id: 103, name: "Twitter / X", url: "https://www.twitter.com", icon: "fa-brands fa-twitter" },
            ]
        },
        {
            id: 2,
            title: "Work & Dev",
            links: [
                { id: 201, name: "Gmail", url: "https://mail.google.com", icon: "fa-solid fa-envelope" },
                { id: 202, name: "GitHub", url: "https://github.com", icon: "fa-brands fa-github" },
                { id: 203, name: "Stack Overflow", url: "https://stackoverflow.com", icon: "fa-brands fa-stack-overflow" }
            ]
        },
        {
            id: 3,
            title: "Utilities",
            links: [
                { id: 301, name: "Google Maps", url: "https://www.google.com/maps", icon: "fa-solid fa-map-location-dot" },
                { id: 302, name: "Google Calendar", url: "https://calendar.google.com", icon: "fa-solid fa-calendar-days" }
            ]
        }
    ];

    // --- State & DOM Variables ---
    let data = [];
    let bookmarks = [];
    let notes = [];
    let todos = [];
    let activeNoteId = null;
    let isEditMode = false;
    let isIconOnlyMode = false;
    let isGeminiMode = false;

    const linksContainer = document.getElementById('links-container');
    const quoteDisplay = document.getElementById('quote-display');

    // Sidebar Buttons
    const editToggleButton = document.getElementById('edit-toggle');
    const iconToggleButton = document.getElementById('icon-toggle');
    const bookmarksToggle = document.getElementById('bookmarks-toggle');
    const notesToggleBtn = document.getElementById('notes-toggle-btn');
    const todoToggleBtn = document.getElementById('todo-toggle-btn');
    const bgToggleBtn = document.getElementById('bg-toggle-btn'); // ✨ NEW

    // Search
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchToggleSwitch = document.getElementById('search-toggle-switch');
    const searchModeIcon = document.getElementById('search-mode-icon');
    const copyFeedback = document.getElementById('copy-feedback');

    // Section Modal
    const sectionModal = document.getElementById('section-modal');
    const sectionForm = document.getElementById('section-form');
    const cancelSectionForm = document.getElementById('cancel-section-form');
    const addSectionBtn = document.getElementById('add-section-btn');

    // Link Modal
    const linkModal = document.getElementById('link-modal');
    const linkForm = document.getElementById('link-form');
    const cancelLinkForm = document.getElementById('cancel-link-form');
    const linkCategoryIdInput = document.getElementById('link-category-id');

    // Bookmarks Modal
    const bookmarksModal = document.getElementById('bookmarks-modal');
    const closeBookmarksModal = document.getElementById('close-bookmarks-modal');
    const bookmarksList = document.getElementById('bookmarks-list');
    const bookmarksForm = document.getElementById('bookmarks-form');

    // Multi-Notes Modal
    const notesModal = document.getElementById('notes-modal');
    const notesList = document.getElementById('notes-list');
    const notesAddBtn = document.getElementById('notes-add-btn');
    const notesCloseBtn = document.getElementById('notes-close-btn');
    const noteEditorContainer = document.getElementById('note-editor-container');
    const noteEditorPlaceholder = document.getElementById('note-editor-placeholder');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentTextarea = document.getElementById('note-content-textarea');
    const noteDeleteBtn = document.getElementById('note-delete-btn');
    const noteSaveBtn = document.getElementById('note-save-btn');
    const noteDiscardBtn = document.getElementById('note-discard-btn');

    // To-Do Modal
    const todoModal = document.getElementById('todo-modal');
    const closeTodoModal = document.getElementById('close-todo-modal');
    const todoList = document.getElementById('todo-list');
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');

    // ✨ NEW: Background Modal
    const bgModal = document.getElementById('bg-modal');
    const bgForm = document.getElementById('bg-form');
    const bgUrlInput = document.getElementById('bg-url-input');
    const cancelBgForm = document.getElementById('cancel-bg-form');


    // =====================================================
    // QUOTE FUNCTION
    // =====================================================
    function displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        if (quoteDisplay) {
            quoteDisplay.textContent = `"${motivationalQuotes[randomIndex]}"`;
        }
    }

    // =====================================================
    // CORE LINK FUNCTIONS
    // =====================================================

    function saveData() {
        localStorage.setItem('homepageData', JSON.stringify(data));
    }

    function loadData() {
        const savedData = localStorage.getItem('homepageData');
        if (savedData) {
            data = JSON.parse(savedData);
        } else {
            data = defaultData;
            saveData();
        }
    }

    function renderPage() {
        linksContainer.innerHTML = '';

        data.forEach(category => {
            const section = document.createElement('section');
            section.className = 'link-category';
            section.setAttribute('data-category-id', category.id);

            let linksHTML = '';
            category.links.forEach(link => {

                let iconHTML;
                if (link.icon) {
                    iconHTML = `<i class="${link.icon}"></i>`;
                } else {
                    let domain;
                    try { domain = new URL(link.url).hostname; }
                    catch (e) { domain = link.url; }
                    const faviconURL = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                    iconHTML = `<img src="${faviconURL}" class="link-favicon" alt="">`;
                }

                linksHTML += `
                    <li data-link-id="${link.id}">
                        <a href="${link.url}" title="${link.name} (${link.url})" target="_blank">
                            ${iconHTML}
                            <span>${link.name}</span>
                        </a>
                        <button class="delete-link-btn" title="Delete Link">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </li>
                `;
            });

            section.innerHTML = `
                <button class="delete-btn" title="Delete Section">
                    <i class="fa-solid fa-times"></i>
                </button>
                <h2>${category.title}</h2>
                <ul>${linksHTML}</ul>
                <button class="add-link-btn">
                    <i class="fa-solid fa-plus"></i> Add Link
                </button>
            `;

            linksContainer.appendChild(section);
        });
    }

    // =====================================================
    // BOOKMARK FUNCTIONS
    // =====================================================

    function saveBookmarks() {
        localStorage.setItem('homepageBookmarks', JSON.stringify(bookmarks));
    }

    function loadBookmarks() {
        const savedBookmarks = localStorage.getItem('homepageBookmarks');
        if (savedBookmarks) {
            bookmarks = JSON.parse(savedBookmarks);
        } else {
            bookmarks = [];
        }
    }

    function renderBookmarks() {
        bookmarksList.innerHTML = '';
        if (bookmarks.length === 0) {
            bookmarksList.innerHTML = '<li class="empty-list-msg">No temporary bookmarks.</li>';
            return;
        }

        bookmarks.forEach(link => {
            let domain;
            try { domain = new URL(link.url).hostname; }
            catch (e) { domain = link.url; }
            const faviconURL = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            const iconHTML = `<img src="${faviconURL}" class="link-favicon" alt="">`;

            const li = document.createElement('li');
            li.setAttribute('data-link-id', link.id);
            li.innerHTML = `
                <a href="${link.url}" title="${link.name} (${link.url})" target="_blank">
                    ${iconHTML}
                    <div class="bookmark-text">
                        <span class="bookmark-name">${link.name}</span>
                        <span class="bookmark-url">${link.url}</span>
                    </div>
                </a>
                <button class="delete-bookmark-btn" title="Delete Bookmark">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            bookmarksList.appendChild(li);
        });
    }

    // =====================================================
    // MULTI-NOTE FUNCTIONS
    // =====================================================

    function saveNotes() {
        localStorage.setItem('homepageMultiNotes', JSON.stringify(notes));
    }

    function loadNotes() {
        const savedNotes = localStorage.getItem('homepageMultiNotes');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
        } else {
            notes = [];
        }
    }

    function renderNotesList() {
        notesList.innerHTML = '';
        if (notes.length === 0) {
            notesList.innerHTML = '<li class="empty-notes-msg">No notes yet.</li>';
            return;
        }

        notes.sort((a, b) => b.id - a.id);

        notes.forEach(note => {
            const li = document.createElement('li');
            li.setAttribute('data-note-id', note.id);
            li.className = (note.id === activeNoteId) ? 'active' : '';

            const title = note.title || 'Untitled Note';
            const snippet = note.content ? note.content.substring(0, 40) + '...' : 'No content...';

            li.innerHTML = `
                <div class="notes-list-title">${title}</div>
                <div class="notes-list-snippet">${snippet}</div>
            `;
            notesList.appendChild(li);
        });
    }

    function renderNoteEditor(noteId) {
        activeNoteId = noteId;
        const note = notes.find(n => n.id === noteId);

        if (note) {
            noteEditorPlaceholder.classList.add('hidden');
            noteEditorContainer.classList.remove('hidden');

            noteTitleInput.value = note.title;
            noteContentTextarea.value = note.content;
        } else {
            activeNoteId = null;
            noteEditorPlaceholder.classList.remove('hidden');
            noteEditorContainer.classList.add('hidden');
        }
        renderNotesList();
    }

    function addNewNote() {
        const newNote = {
            id: Date.now(),
            title: 'Untitled Note',
            content: ''
        };
        notes.push(newNote);
        saveNotes();
        renderNoteEditor(newNote.id);
    }

    function updateNote() {
        if (!activeNoteId) return;

        const note = notes.find(n => n.id === activeNoteId);
        if (note) {
            note.title = noteTitleInput.value;
            note.content = noteContentTextarea.value;
            note.id = Date.now();
            saveNotes();
            renderNotesList();
        }
    }

    function deleteNote() {
        if (!activeNoteId) return;

        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(n => n.id !== activeNoteId);
            saveNotes();
            activeNoteId = null;
            renderNoteEditor(null);
            renderNotesList();
        }
    }

    // =====================================================
    // TO-DO LIST FUNCTIONS
    // =====================================================

    function saveTodos() {
        localStorage.setItem('homepageTodos', JSON.stringify(todos));
    }

    function loadTodos() {
        const savedTodos = localStorage.getItem('homepageTodos');
        if (savedTodos) {
            todos = JSON.parse(savedTodos);
        } else {
            todos = [];
        }
    }

    function renderTodos() {
        todoList.innerHTML = '';
        if (todos.length === 0) {
            todoList.innerHTML = '<li class="empty-list-msg">No tasks yet.</li>';
            return;
        }

        todos.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-task-id', task.id);
            li.className = task.completed ? 'completed' : '';

            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="todo-text">${task.text}</span>
                <button class="delete-todo-btn" title="Delete Task">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            todoList.appendChild(li);
        });
    }

    function addPendingTask(taskText) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        todos.push(newTask);
        saveTodos();
        renderTodos();
    }

    function toggleTaskCompletion(taskId) {
        const task = todos.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTodos();
            renderTodos();
        }
    }

    function deleteTask(taskId) {
        todos = todos.filter(t => t.id !== taskId);
        saveTodos();
        renderTodos();
    }

    // =====================================================
    // ✨ NEW: BACKGROUND FUNCTIONS
    // =====================================================

    function applyBackground(url) {
        if (url) {
            document.body.style.backgroundImage = `url('${url}')`;
        } else {
            document.body.style.backgroundImage = 'none';
        }
    }

    function loadBackground() {
        const savedBg = localStorage.getItem('homepageBg');
        if (savedBg) {
            applyBackground(savedBg);
            bgUrlInput.value = savedBg;
        }
    }

    function saveBackground(url) {
        localStorage.setItem('homepageBg', url);
        applyBackground(url);
    }


    // =====================================================
    // MODE TOGGLES
    // =====================================================

    function toggleEditMode() {
        isEditMode = !isEditMode;
        document.body.classList.toggle('edit-mode-active', isEditMode);
        editToggleButton.classList.toggle('active', isEditMode);
        const icon = editToggleButton.querySelector('i');
        if (isEditMode) {
            icon.className = 'fa-solid fa-check';
            editToggleButton.title = "Done Editing";
        } else {
            icon.className = 'fa-solid fa-pencil';
            editToggleButton.title = "Toggle Edit Mode";
        }
    }

    function toggleIconOnlyMode() {
        isIconOnlyMode = !isIconOnlyMode;
        document.body.classList.toggle('icon-only-mode', isIconOnlyMode);
        iconToggleButton.classList.toggle('active', isIconOnlyMode);
        localStorage.setItem('iconOnlyMode', isIconOnlyMode);

        const icon = iconToggleButton.querySelector('i');
        if (isIconOnlyMode) {
            icon.className = 'fa-solid fa-list';
            iconToggleButton.title = "Toggle List View";
        } else {
            icon.className = 'fa-solid fa-table-cells';
            iconToggleButton.title = "Toggle Icon-Only Mode";
        }
    }

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
        localStorage.setItem('searchMode', isGemini ? 'gemini' : 'google');
    }

    // =====================================================
    // MODAL CONTROLS
    // =====================================================

    function showSectionModal() {
        sectionForm.reset();
        sectionModal.classList.add('visible');
        document.getElementById('section-title-input').focus();
    }
    function hideSectionModal() {
        sectionModal.classList.remove('visible');
    }
    function showLinkModal(categoryId) {
        linkForm.reset();
        linkCategoryIdInput.value = categoryId;
        linkModal.classList.add('visible');
        document.getElementById('link-name-input').focus();
    }
    function hideLinkModal() {
        linkModal.classList.remove('visible');
    }
    function showBookmarksModal() {
        renderBookmarks();
        bookmarksModal.classList.add('visible');
    }
    function hideBookmarksModal() {
        bookmarksModal.classList.remove('visible');
    }
    function showNotesModal() {
        loadNotes();
        renderNotesList();
        renderNoteEditor(activeNoteId);
        notesModal.classList.add('visible');
    }
    function hideNotesModal() {
        notesModal.classList.remove('visible');
    }
    function showTodoModal() {
        renderTodos();
        todoModal.classList.add('visible');
    }
    function hideTodoModal() {
        todoModal.classList.remove('visible');
    }
    function showBgModal() { // ✨ NEW
        bgModal.classList.add('visible');
        bgUrlInput.focus();
    }
    function hideBgModal() {
        bgModal.classList.remove('visible');
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    // --- Toggles ---
    editToggleButton.addEventListener('click', toggleEditMode);
    iconToggleButton.addEventListener('click', toggleIconOnlyMode);
    bookmarksToggle.addEventListener('click', showBookmarksModal);
    notesToggleBtn.addEventListener('click', showNotesModal);
    todoToggleBtn.addEventListener('click', showTodoModal);
    searchToggleSwitch.addEventListener('change', () => setSearchMode(searchToggleSwitch.checked));
    bgToggleBtn.addEventListener('click', showBgModal); // ✨ NEW

    // --- Modals ---
    addSectionBtn.addEventListener('click', showSectionModal);
    cancelSectionForm.addEventListener('click', hideSectionModal);
    cancelLinkForm.addEventListener('click', hideLinkModal);
    closeBookmarksModal.addEventListener('click', hideBookmarksModal);
    notesCloseBtn.addEventListener('click', hideNotesModal);
    closeTodoModal.addEventListener('click', hideTodoModal);
    cancelBgForm.addEventListener('click', hideBgModal); // ✨ NEW

    // Close modal on backdrop click
    sectionModal.addEventListener('click', (e) => {
        if (e.target === sectionModal) hideSectionModal();
    });
    linkModal.addEventListener('click', (e) => {
        if (e.target === linkModal) hideLinkModal();
    });
    bookmarksModal.addEventListener('click', (e) => {
        if (e.target === bookmarksModal) hideBookmarksModal();
    });
    notesModal.addEventListener('click', (e) => {
        if (e.target === notesModal) hideNotesModal();
    });
    todoModal.addEventListener('click', (e) => {
        if (e.target === todoModal) hideTodoModal();
    });
    bgModal.addEventListener('click', (e) => { // ✨ NEW
        if (e.target === bgModal) hideBgModal();
    });

    // --- Forms ---
    sectionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTitle = document.getElementById('section-title-input').value.trim();
        if (newTitle) {
            const newSection = { id: Date.now(), title: newTitle, links: [] };
            data.push(newSection);
            saveData();
            renderPage();
            hideSectionModal();
        }
    });

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryId = parseInt(linkCategoryIdInput.value);
        const urlInput = document.getElementById('link-url-input').value.trim();

        let finalURL = urlInput;
        if (!finalURL.startsWith('http://') && !finalURL.startsWith('https://')) {
            finalURL = 'https://' + finalURL;
        }

        const newLink = {
            id: Date.now(),
            name: document.getElementById('link-name-input').value.trim(),
            url: finalURL,
            icon: document.getElementById('link-icon-input').value.trim()
        };

        const category = data.find(c => c.id === categoryId);
        if (category) {
            category.links.push(newLink);
            saveData();
            renderPage();
            hideLinkModal();
        }
    });

    bookmarksForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('bookmark-name-input');
        const urlInput = document.getElementById('bookmark-url-input');
        let url = urlInput.value.trim();

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const newBookmark = {
            id: Date.now(),
            name: nameInput.value.trim(),
            url: url
        };

        bookmarks.push(newBookmark);
        saveBookmarks();
        renderBookmarks();
        bookmarksForm.reset();
        nameInput.focus();
    });

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = todoInput.value.trim();
        if (taskText) {
            addPendingTask(taskText);
            todoInput.value = '';
        }
    });

    // ✨ NEW: Background Form
    bgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = bgUrlInput.value.trim();
        saveBackground(url);
        hideBgModal();
    });

    // =====================================================
    // ✨ NEW: DATA EXPORT / IMPORT
    // =====================================================

    const settingsModal = document.getElementById('settings-modal');
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file-input');

    function showSettingsModal() {
        settingsModal.classList.add('visible');
    }
    function hideSettingsModal() {
        settingsModal.classList.remove('visible');
    }

    settingsToggleBtn.addEventListener('click', showSettingsModal);
    closeSettingsModal.addEventListener('click', hideSettingsModal);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) hideSettingsModal();
    });

    // --- Export ---
    exportDataBtn.addEventListener('click', () => {
        const exportData = {
            homepageData: JSON.parse(localStorage.getItem('homepageData') || '[]'),
            homepageBookmarks: JSON.parse(localStorage.getItem('homepageBookmarks') || '[]'),
            homepageMultiNotes: JSON.parse(localStorage.getItem('homepageMultiNotes') || '[]'),
            homepageTodos: JSON.parse(localStorage.getItem('homepageTodos') || '[]'),
            homepageBg: localStorage.getItem('homepageBg') || '',
            iconOnlyMode: localStorage.getItem('iconOnlyMode') === 'true',
            searchMode: localStorage.getItem('searchMode') || 'google',
            exportDate: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "dashboard_backup_" + new Date().toISOString().slice(0, 10) + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // --- Import ---
    importDataBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (confirm('WARNING: This will overwrite all your current dashboard data (links, notes, settings). Are you sure you want to proceed?')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Basic validation
                    if (!importedData.homepageData && !importedData.homepageBookmarks) {
                        throw new Error("Invalid backup file format.");
                    }

                    // Restore Data
                    if (importedData.homepageData) localStorage.setItem('homepageData', JSON.stringify(importedData.homepageData));
                    if (importedData.homepageBookmarks) localStorage.setItem('homepageBookmarks', JSON.stringify(importedData.homepageBookmarks));
                    if (importedData.homepageMultiNotes) localStorage.setItem('homepageMultiNotes', JSON.stringify(importedData.homepageMultiNotes));
                    if (importedData.homepageTodos) localStorage.setItem('homepageTodos', JSON.stringify(importedData.homepageTodos));
                    if (importedData.homepageBg !== undefined) localStorage.setItem('homepageBg', importedData.homepageBg);
                    if (importedData.iconOnlyMode !== undefined) localStorage.setItem('iconOnlyMode', importedData.iconOnlyMode);
                    if (importedData.searchMode) localStorage.setItem('searchMode', importedData.searchMode);

                    alert('Data imported successfully! The page will now reload.');
                    location.reload();

                } catch (err) {
                    console.error(err);
                    alert('Error importing data: ' + err.message);
                }
            };
            reader.readAsText(file);
        }
        // Reset input so same file can be selected again if needed
        importFileInput.value = '';
    });

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


    // --- Notes App Listeners ---
    notesAddBtn.addEventListener('click', addNewNote);
    noteDeleteBtn.addEventListener('click', deleteNote);
    noteSaveBtn.addEventListener('click', () => {
        updateNote();
        noteSaveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        setTimeout(() => {
            noteSaveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save';
        }, 1500);
    });
    noteDiscardBtn.addEventListener('click', () => {
        renderNoteEditor(activeNoteId);
    });

    notesList.addEventListener('click', (e) => {
        const li = e.target.closest('li[data-note-id]');
        if (li) {
            const noteId = parseInt(li.getAttribute('data-note-id'));
            renderNoteEditor(noteId);
        }
    });


    // --- Deletions (Event Delegation) ---
    linksContainer.addEventListener('click', (e) => {
        const addLinkBtn = e.target.closest('.add-link-btn');
        if (addLinkBtn) {
            const categoryId = addLinkBtn.closest('.link-category').dataset.categoryId;
            showLinkModal(categoryId);
            return;
        }

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const categoryEl = deleteBtn.closest('.link-category');
            const categoryId = parseInt(categoryEl.dataset.categoryId);
            if (confirm('Are you sure you want to delete this entire section?')) {
                data = data.filter(c => c.id !== categoryId);
                saveData();
                renderPage();
            }
            return;
        }

        const deleteLinkBtn = e.target.closest('.delete-link-btn');
        if (deleteLinkBtn) {
            const linkEl = deleteLinkBtn.closest('li');
            const linkId = parseInt(linkEl.dataset.linkId);
            const categoryEl = deleteLinkBtn.closest('.link-category');
            const categoryId = parseInt(categoryEl.dataset.categoryId);

            if (confirm('Are you sure you want to delete this link?')) {
                const category = data.find(c => c.id === categoryId);
                if (category) {
                    category.links = category.links.filter(l => l.id !== linkId);
                    saveData();
                    renderPage();
                }
            }
        }
    });

    bookmarksList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-bookmark-btn');
        if (deleteBtn) {
            const linkEl = deleteBtn.closest('li');
            const linkId = parseInt(linkEl.dataset.linkId);

            bookmarks = bookmarks.filter(b => b.id !== linkId);
            saveBookmarks();
            renderBookmarks();
        }
    });

    todoList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-todo-btn');
        if (deleteBtn) {
            const li = deleteBtn.closest('li');
            const taskId = parseInt(li.getAttribute('data-task-id'));
            deleteTask(taskId);
            return;
        }

        const taskItem = e.target.closest('li');
        if (taskItem && (e.target.type === 'checkbox' || e.target.classList.contains('todo-text'))) {
            const taskId = parseInt(taskItem.getAttribute('data-task-id'));
            toggleTaskCompletion(taskId);
        }
    });

    // =====================================================
    // INITIAL PAGE LOAD
    // =====================================================

    // --- Load all data from localStorage ---
    loadData();
    loadBookmarks();
    loadNotes();
    loadTodos();
    loadBackground(); // ✨ NEW

    // --- Load view preferences ---
    isIconOnlyMode = localStorage.getItem('iconOnlyMode') === 'true';
    document.body.classList.toggle('icon-only-mode', isIconOnlyMode);
    iconToggleButton.classList.toggle('active', isIconOnlyMode);
    const icon = iconToggleButton.querySelector('i');
    if (isIconOnlyMode) {
        icon.className = 'fa-solid fa-list';
        iconToggleButton.title = "Toggle List View";
    } else {
        icon.className = 'fa-solid fa-table-cells';
        iconToggleButton.title = "Toggle Icon-Only Mode";
    }

    const savedSearchMode = localStorage.getItem('searchMode');
    setSearchMode(savedSearchMode === 'gemini');

    // --- Render the final page ---
    renderPage();
    displayRandomQuote();
});