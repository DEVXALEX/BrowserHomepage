// --- Greeting & Clock ---
(function() {
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
    
    // Sidebar Buttons
    const editToggleButton = document.getElementById('edit-toggle');
    const iconToggleButton = document.getElementById('icon-toggle');
    const bookmarksToggle = document.getElementById('bookmarks-toggle');
    const notesToggleBtn = document.getElementById('notes-toggle-btn');
    const todoToggleBtn = document.getElementById('todo-toggle-btn');

    // Search
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchToggleSwitch = document.getElementById('search-toggle-switch');
    const searchModeIcon = document.getElementById('search-mode-icon'); // ✨ NEW
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
                        <a href="${link.url}" title="${link.name} (${link.url})">
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
        if(isIconOnlyMode) {
            icon.className = 'fa-solid fa-list';
            iconToggleButton.title = "Toggle List View";
        } else {
            icon.className = 'fa-solid fa-table-cells';
            iconToggleButton.title = "Toggle Icon-Only Mode";
        }
    }

    // ✨ MODIFIED: Search Toggle Function
    function setSearchMode(isGemini) {
        isGeminiMode = isGemini;
        searchToggleSwitch.checked = isGemini;
        
        if (isGemini) {
            searchInput.placeholder = 'Ask Gemini (text will be copied)...';
            searchForm.action = 'https://gemini.google.com/';
            searchInput.name = '';
            searchModeIcon.className = 'fa-solid fa-sparkle gemini-icon'; // Change icon
        } else {
            searchInput.placeholder = 'Search Google...';
            searchForm.action = 'https://www.google.com/search';
            searchInput.name = 'q';
            searchModeIcon.className = 'fa-brands fa-google'; // Change icon
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
    
    // --- Modals ---
    addSectionBtn.addEventListener('click', showSectionModal);
    cancelSectionForm.addEventListener('click', hideSectionModal);
    cancelLinkForm.addEventListener('click', hideLinkModal);
    closeBookmarksModal.addEventListener('click', hideBookmarksModal);
    notesCloseBtn.addEventListener('click', hideNotesModal);
    closeTodoModal.addEventListener('click', hideTodoModal);
    
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

    // ✨ MODIFIED: Search Form
    searchForm.addEventListener('submit', (e) => {
        if (isGeminiMode) {
            e.preventDefault(); // Stop submission ONLY for Gemini
            const searchText = searchInput.value;
            if (!searchText) return;
    
            navigator.clipboard.writeText(searchText)
                .then(() => {
                    // Show feedback
                    copyFeedback.classList.add('visible');
                    setTimeout(() => {
                        copyFeedback.classList.remove('visible');
                    }, 2000);
                    
                    window.open('https://gemini.google.com/', '_blank');
                    searchInput.value = ''; // Clear input after copy
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    window.open('https://gemini.google.com/', '_blank');
                });
        }
        // If not Gemini mode, the form submits as normal
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
    
    // --- Load view preferences ---
    isIconOnlyMode = localStorage.getItem('iconOnlyMode') === 'true';
    document.body.classList.toggle('icon-only-mode', isIconOnlyMode);
    iconToggleButton.classList.toggle('active', isIconOnlyMode);
    const icon = iconToggleButton.querySelector('i');
    if(isIconOnlyMode) {
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
});