(function (app) {
    app.initNotes = function () {
        let notes = [];
        let activeNoteId = null;

        const notesToggleBtn = document.getElementById('notes-toggle-btn');
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

        function saveNotes() {
            app.Storage.set('homepageMultiNotes', notes);
        }

        function loadNotes() {
            notes = app.Storage.get('homepageMultiNotes', []);
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
                id: app.generateId(),
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
                note.id = app.generateId(); // Update ID to bring to top
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

        function showNotesModal() {
            loadNotes();
            renderNotesList();
            renderNoteEditor(activeNoteId);
            notesModal.classList.add('visible');
        }

        function hideNotesModal() {
            notesModal.classList.remove('visible');
        }

        notesToggleBtn.addEventListener('click', showNotesModal);
        notesCloseBtn.addEventListener('click', hideNotesModal);

        notesModal.addEventListener('click', (e) => {
            if (e.target === notesModal) hideNotesModal();
        });

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

        loadNotes();
    };
})(window.Homepage = window.Homepage || {});
