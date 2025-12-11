(function (app) {
    app.initLinks = function () {
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

        let data = [];
        let isEditMode = false;
        let isIconOnlyMode = false;

        // Edit State
        let editingSectionId = null;
        let editingLinkId = null;

        // Drag State
        let draggedItemType = null; // 'section' or 'link'
        let draggedItemId = null;
        let draggedSourceCategoryId = null;

        const linksContainer = document.getElementById('links-container');
        const editToggleButton = document.getElementById('edit-toggle');
        const iconToggleButton = document.getElementById('icon-toggle');

        // Modals
        const sectionModal = document.getElementById('section-modal');
        const sectionForm = document.getElementById('section-form');
        const cancelSectionForm = document.getElementById('cancel-section-form');
        const addSectionBtn = document.getElementById('add-section-btn');
        const sectionModalTitle = sectionModal.querySelector('h3');
        const sectionSubmitBtn = sectionForm.querySelector('button[type="submit"]');

        const linkModal = document.getElementById('link-modal');
        const linkForm = document.getElementById('link-form');
        const cancelLinkForm = document.getElementById('cancel-link-form');
        const linkCategoryIdInput = document.getElementById('link-category-id');
        const linkModalTitle = linkModal.querySelector('h3');
        const linkSubmitBtn = linkForm.querySelector('button[type="submit"]');

        function saveData() {
            app.Storage.set('homepageData', data);
        }

        function loadData() {
            data = app.Storage.get('homepageData', null);
            if (!data) {
                data = defaultData;
                saveData();
            }

            isIconOnlyMode = app.Storage.getString('iconOnlyMode') === 'true';
            updateIconModeUI();
        }

        function renderPage() {
            linksContainer.innerHTML = '';

            data.forEach(category => {
                const section = document.createElement('section');
                section.className = 'link-category';
                section.setAttribute('data-category-id', category.id);
                if (isEditMode) {
                    section.setAttribute('draggable', 'true');
                }

                let linksHTML = '';
                category.links.forEach(link => {

                    let iconHTML;
                    if (link.icon) {
                        iconHTML = `<i class="${link.icon}"></i>`;
                    } else {
                        const faviconURL = app.getFaviconURL(link.url);
                        iconHTML = `<img src="${faviconURL}" class="link-favicon" alt="">`;
                    }

                    const draggableAttr = isEditMode ? 'draggable="true"' : '';

                    linksHTML += `
                        <li data-link-id="${link.id}" ${draggableAttr}>
                            <a href="${link.url}" title="${link.name} (${link.url})" target="_blank">
                                ${iconHTML}
                                <span>${link.name}</span>
                            </a>
                            <button class="edit-link-btn" title="Edit Link">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
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
                    <button class="edit-btn" title="Edit Section">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="quick-add-btn" title="Quick Add Link">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <h2>${category.title}</h2>
                    <ul>${linksHTML}</ul>
                    <button class="add-link-btn">
                        <i class="fa-solid fa-plus"></i> Add Link
                    </button>
                `;

                linksContainer.appendChild(section);
            });

            if (isEditMode) {
                addDragListeners();
            }
        }

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
            renderPage(); // Re-render to enable/disable dragging
        }

        function updateIconModeUI() {
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
        }

        function toggleIconOnlyMode() {
            isIconOnlyMode = !isIconOnlyMode;
            app.Storage.setString('iconOnlyMode', isIconOnlyMode);
            updateIconModeUI();
        }

        // --- Drag & Drop Logic ---
        function addDragListeners() {
            const sections = document.querySelectorAll('.link-category');
            const links = document.querySelectorAll('.link-category li');

            // Section Dragging
            sections.forEach(section => {
                section.addEventListener('dragstart', (e) => {
                    if (e.target !== section) return; // Prevent bubbling from links
                    draggedItemType = 'section';
                    draggedItemId = parseInt(section.dataset.categoryId);
                    section.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });

                section.addEventListener('dragend', () => {
                    section.classList.remove('dragging');
                    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                    draggedItemType = null;
                    draggedItemId = null;
                });

                section.addEventListener('dragover', (e) => {
                    if (draggedItemType !== 'section') return;
                    e.preventDefault();
                    section.classList.add('drag-over');
                });

                section.addEventListener('dragleave', () => {
                    section.classList.remove('drag-over');
                });

                section.addEventListener('drop', (e) => {
                    if (draggedItemType !== 'section') return;
                    e.preventDefault();
                    const targetId = parseInt(section.dataset.categoryId);

                    if (draggedItemId !== targetId) {
                        const fromIndex = data.findIndex(c => c.id === draggedItemId);
                        const toIndex = data.findIndex(c => c.id === targetId);

                        // Move item
                        const [movedItem] = data.splice(fromIndex, 1);
                        data.splice(toIndex, 0, movedItem);

                        saveData();
                        renderPage();
                    }
                });
            });

            // Link Dragging
            links.forEach(link => {
                link.addEventListener('dragstart', (e) => {
                    e.stopPropagation(); // Stop bubbling to section
                    draggedItemType = 'link';
                    draggedItemId = parseInt(link.dataset.linkId);
                    draggedSourceCategoryId = parseInt(link.closest('.link-category').dataset.categoryId);
                    link.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });

                link.addEventListener('dragend', () => {
                    link.classList.remove('dragging');
                    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                    draggedItemType = null;
                    draggedItemId = null;
                    draggedSourceCategoryId = null;
                });

                link.addEventListener('dragover', (e) => {
                    if (draggedItemType !== 'link') return;
                    e.preventDefault();
                    e.stopPropagation();
                    link.classList.add('drag-over');
                });

                link.addEventListener('dragleave', () => {
                    link.classList.remove('drag-over');
                });

                link.addEventListener('drop', (e) => {
                    if (draggedItemType !== 'link') return;
                    e.preventDefault();
                    e.stopPropagation();

                    const targetLink = link;
                    const targetCategoryId = parseInt(targetLink.closest('.link-category').dataset.categoryId);
                    const targetLinkId = parseInt(targetLink.dataset.linkId);

                    // Find Source and Target Categories
                    const sourceCategory = data.find(c => c.id === draggedSourceCategoryId);
                    const targetCategory = data.find(c => c.id === targetCategoryId);

                    if (sourceCategory && targetCategory) {
                        // Find dragged link
                        const linkIndex = sourceCategory.links.findIndex(l => l.id === draggedItemId);
                        if (linkIndex > -1) {
                            const [movedLink] = sourceCategory.links.splice(linkIndex, 1);

                            // Find target index
                            const targetIndex = targetCategory.links.findIndex(l => l.id === targetLinkId);

                            // Insert at target index
                            targetCategory.links.splice(targetIndex, 0, movedLink);

                            saveData();
                            renderPage();
                        }
                    }
                });
            });

            // Allow dropping links into empty sections (or anywhere in section)
            sections.forEach(section => {
                section.addEventListener('dragover', (e) => {
                    if (draggedItemType !== 'link') return;
                    e.preventDefault();
                    // Only highlight if not over a link (handled above)
                    if (!e.target.closest('li')) {
                        section.classList.add('drag-over');
                    }
                });

                section.addEventListener('dragleave', () => {
                    if (draggedItemType !== 'link') return;
                    section.classList.remove('drag-over');
                });

                section.addEventListener('drop', (e) => {
                    if (draggedItemType !== 'link') return;
                    // If dropped on a link, it's handled by link listener. 
                    // This is for dropping into the section itself (e.g. empty list or at end)
                    if (e.target.closest('li')) return;

                    e.preventDefault();
                    const targetCategoryId = parseInt(section.dataset.categoryId);
                    const sourceCategory = data.find(c => c.id === draggedSourceCategoryId);
                    const targetCategory = data.find(c => c.id === targetCategoryId);

                    if (sourceCategory && targetCategory) {
                        const linkIndex = sourceCategory.links.findIndex(l => l.id === draggedItemId);
                        if (linkIndex > -1) {
                            const [movedLink] = sourceCategory.links.splice(linkIndex, 1);
                            targetCategory.links.push(movedLink); // Add to end
                            saveData();
                            renderPage();
                        }
                    }
                });
            });
        }

        // --- Modal Functions ---
        function showSectionModal(isEdit = false) {
            if (!isEdit) {
                sectionForm.reset();
            }
            sectionModal.classList.add('visible');
            document.getElementById('section-title-input').focus();

            if (isEdit) {
                sectionModalTitle.textContent = "Edit Section";
                sectionSubmitBtn.textContent = "Update";
            } else {
                editingSectionId = null;
                sectionModalTitle.textContent = "Add New Section";
                sectionSubmitBtn.textContent = "Add Section";
            }
        }

        function hideSectionModal() {
            sectionModal.classList.remove('visible');
            editingSectionId = null;
        }

        function showLinkModal(categoryId, isEdit = false) {
            if (!isEdit) {
                linkForm.reset();
            }
            linkCategoryIdInput.value = categoryId;
            linkModal.classList.add('visible');
            document.getElementById('link-name-input').focus();

            if (isEdit) {
                linkModalTitle.textContent = "Edit Link";
                linkSubmitBtn.textContent = "Update";
            } else {
                editingLinkId = null;
                linkModalTitle.textContent = "Add New Link";
                linkSubmitBtn.textContent = "Add Link";
            }
        }

        function hideLinkModal() {
            linkModal.classList.remove('visible');
            editingLinkId = null;
        }

        // --- Event Listeners ---
        editToggleButton.addEventListener('click', toggleEditMode);
        iconToggleButton.addEventListener('click', toggleIconOnlyMode);

        addSectionBtn.addEventListener('click', () => showSectionModal(false));
        cancelSectionForm.addEventListener('click', hideSectionModal);
        cancelLinkForm.addEventListener('click', hideLinkModal);

        sectionModal.addEventListener('click', (e) => {
            if (e.target === sectionModal) hideSectionModal();
        });
        linkModal.addEventListener('click', (e) => {
            if (e.target === linkModal) hideLinkModal();
        });

        sectionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTitle = document.getElementById('section-title-input').value.trim();
            if (newTitle) {
                if (editingSectionId) {
                    // Update existing
                    const section = data.find(s => s.id === editingSectionId);
                    if (section) section.title = newTitle;
                } else {
                    // Create new
                    const newSection = { id: app.generateId(), title: newTitle, links: [] };
                    data.push(newSection);
                }
                saveData();
                renderPage();
                hideSectionModal();
            }
        });

        linkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const categoryId = parseInt(linkCategoryIdInput.value);
            const urlInput = document.getElementById('link-url-input').value.trim();
            const finalURL = app.ensureProtocol(urlInput);
            let name = document.getElementById('link-name-input').value.trim();
            const icon = document.getElementById('link-icon-input').value.trim();

            // Auto-Name Logic
            if (!name) {
                try {
                    const urlObj = new URL(finalURL);
                    let hostname = urlObj.hostname.replace('www.', '');
                    // Remove TLD (e.g., .com, .co.in, .org)
                    // This is a simple heuristic: take the first part. 
                    // Works for google.com -> google, amazon.co.uk -> amazon
                    name = hostname.split('.')[0];
                    // Capitalize first letter
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                } catch (e) {
                    name = "Link";
                }
            }

            const category = data.find(c => c.id === categoryId);
            if (category) {
                if (editingLinkId) {
                    // Update existing
                    const link = category.links.find(l => l.id === editingLinkId);
                    if (link) {
                        link.name = name;
                        link.url = finalURL;
                        link.icon = icon;
                    }
                } else {
                    // Create new
                    const newLink = {
                        id: app.generateId(),
                        name: name,
                        url: finalURL,
                        icon: icon
                    };
                    category.links.push(newLink);
                }
                saveData();
                renderPage();
                hideLinkModal();
            }
        });

        // Event Delegation
        linksContainer.addEventListener('click', (e) => {
            // Add Link (Quick Add)
            const quickAddBtn = e.target.closest('.quick-add-btn');
            if (quickAddBtn) {
                const categoryId = quickAddBtn.closest('.link-category').dataset.categoryId;
                showLinkModal(categoryId, false);
                return;
            }

            // Add Link (Bottom Button)
            const addLinkBtn = e.target.closest('.add-link-btn');
            if (addLinkBtn) {
                const categoryId = addLinkBtn.closest('.link-category').dataset.categoryId;
                showLinkModal(categoryId, false);
                return;
            }

            // Edit Section
            const editSectionBtn = e.target.closest('.edit-btn');
            if (editSectionBtn) {
                const categoryEl = editSectionBtn.closest('.link-category');
                const categoryId = parseInt(categoryEl.dataset.categoryId);
                const category = data.find(c => c.id === categoryId);
                if (category) {
                    editingSectionId = categoryId;
                    document.getElementById('section-title-input').value = category.title;
                    showSectionModal(true);
                }
                return;
            }

            // Delete Section
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

            // Edit Link
            const editLinkBtn = e.target.closest('.edit-link-btn');
            if (editLinkBtn) {
                const linkEl = editLinkBtn.closest('li');
                const linkId = parseInt(linkEl.dataset.linkId);
                const categoryEl = editLinkBtn.closest('.link-category');
                const categoryId = parseInt(categoryEl.dataset.categoryId);

                const category = data.find(c => c.id === categoryId);
                if (category) {
                    const link = category.links.find(l => l.id === linkId);
                    if (link) {
                        editingLinkId = linkId;
                        document.getElementById('link-name-input').value = link.name;
                        document.getElementById('link-url-input').value = link.url;
                        document.getElementById('link-icon-input').value = link.icon || '';
                        showLinkModal(categoryId, true);
                    }
                }
                return;
            }

            // Delete Link
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

        loadData();
        renderPage();
    };
})(window.Homepage = window.Homepage || {});
