(function (app) {
    app.initBookmarks = function () {
        let bookmarks = [];

        const bookmarksToggle = document.getElementById('bookmarks-toggle');
        const bookmarksModal = document.getElementById('bookmarks-modal');
        const closeBookmarksModal = document.getElementById('close-bookmarks-modal');
        const bookmarksList = document.getElementById('bookmarks-list');
        const bookmarksForm = document.getElementById('bookmarks-form');

        function saveBookmarks() {
            app.Storage.set('homepageBookmarks', bookmarks);
        }

        function loadBookmarks() {
            bookmarks = app.Storage.get('homepageBookmarks', []);
        }

        function renderBookmarks() {
            bookmarksList.innerHTML = '';
            if (bookmarks.length === 0) {
                bookmarksList.innerHTML = '<li class="empty-list-msg">No temporary bookmarks.</li>';
                return;
            }

            bookmarks.forEach(link => {
                const faviconURL = app.getFaviconURL(link.url);
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

        function showBookmarksModal() {
            renderBookmarks();
            bookmarksModal.classList.add('visible');
        }

        function hideBookmarksModal() {
            bookmarksModal.classList.remove('visible');
        }

        // Navbar Listener
        const navBookmarks = document.querySelector('li[data-action="bookmarks"]');
        if (navBookmarks) {
            navBookmarks.addEventListener('click', showBookmarksModal);
        }

        if (bookmarksToggle) {
            bookmarksToggle.addEventListener('click', showBookmarksModal);
        }
        if (closeBookmarksModal) {
            closeBookmarksModal.addEventListener('click', hideBookmarksModal);
        }

        bookmarksModal.addEventListener('click', (e) => {
            if (e.target === bookmarksModal) hideBookmarksModal();
        });

        bookmarksForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('bookmark-name-input');
            const urlInput = document.getElementById('bookmark-url-input');
            const url = app.ensureProtocol(urlInput.value.trim());

            const newBookmark = {
                id: app.generateId(),
                name: nameInput.value.trim(),
                url: url
            };

            bookmarks.push(newBookmark);
            saveBookmarks();
            renderBookmarks();
            bookmarksForm.reset();
            nameInput.focus();
        });

        // Event Delegation for deletion
        bookmarksList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-bookmark-btn');
            if (deleteBtn) {
                const li = deleteBtn.closest('li');
                const id = parseInt(li.dataset.linkId);
                bookmarks = bookmarks.filter(b => b.id !== id);
                saveBookmarks();
                renderBookmarks();
            }
        });

        loadBookmarks();
    };
})(window.Homepage = window.Homepage || {});
