(function (app) {
    app.PasswordManager = {
        secrets: [], // Local reference to decrypted data
        lockerDataRef: null, // Reference to the full locker object
        filter: 'all', // 'all' or 'favorites'
        searchTerm: '',
        theme: 'dark', // 'dark' or 'light'

        init: function () {
            console.log("PasswordManager: Init");



            this.cacheDOM();
            this.bindEvents();

            this.applyTheme(); // Apply after DOM is ready
            this.checkState();
        },

        cacheDOM: function () {
            this.appContainer = document.getElementById('password-manager-app');
            this.themeToggleBtn = document.getElementById('pm-theme-toggle');
            this.viewTitle = document.getElementById('pm-view-title');
            this.countBadge = document.getElementById('pm-count-badge');
            this.listContainer = document.getElementById('pm-list-container');

            // Inline Unlock Elements
            this.inlinePinInput = document.getElementById('pm-inline-pin');
            this.inlineUnlockBtn = document.getElementById('pm-inline-unlock-btn');

            // Sidebar
            this.searchInput = document.getElementById('pm-search-input');
            this.filterBtns = document.querySelectorAll('.pm-filter-btn');
            this.addBtn = document.getElementById('pm-add-btn');
            this.lockBtn = document.getElementById('pm-lock-btn');
            this.unlockBtn = document.getElementById('pm-unlock-btn'); // In locked state placeholder

            // Modal
            this.editModal = document.getElementById('pm-edit-modal');
            this.modalTitle = document.getElementById('pm-modal-title');
            this.editIdInput = document.getElementById('pm-edit-id');
            this.titleInput = document.getElementById('pm-title-input');
            this.siteInput = document.getElementById('pm-site-input'); // New field
            this.userInput = document.getElementById('pm-user-input');
            this.passInput = document.getElementById('pm-pass-input');
            this.genPassBtn = document.getElementById('pm-gen-pass-btn');
            this.cancelBtn = document.getElementById('pm-cancel-btn');
            this.saveBtn = document.getElementById('pm-save-btn');
        },

        bindEvents: function () {
            // Theme Toggle
            if (this.themeToggleBtn) {
                this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
            }

            // Unlock
            if (this.unlockBtn) {
                console.log("PasswordManager: Binding unlock button");
                this.unlockBtn.addEventListener('click', () => {
                    console.log("PasswordManager: Unlock Button Clicked");
                    this.triggerUnlock();
                });
            }
            // Lock
            if (this.lockBtn) {
                this.lockBtn.addEventListener('click', () => this.lockVault());
            }

            // Inline Unlock Events
            if (this.inlineUnlockBtn) {
                this.inlineUnlockBtn.addEventListener('click', () => this.handleInlineUnlock());
            }
            if (this.inlinePinInput) {
                this.inlinePinInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleInlineUnlock();
                });
            }

            // Search
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.renderList();
                });
            }

            // Filters
            this.filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filter = btn.dataset.filter;
                    if (this.viewTitle) this.viewTitle.textContent = this.filter === 'all' ? 'All Items' : 'Favorites';
                    this.renderList();
                });
            });

            // Add
            if (this.addBtn) this.addBtn.addEventListener('click', () => this.openEditModal());

            // Modal Actions
            if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.closeEditModal());
            if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.saveSecret());
            if (this.genPassBtn) this.genPassBtn.addEventListener('click', () => this.generatePassword());

            // Generate Password
            if (this.genPassBtn) {
                this.genPassBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent form submission if inside form
                    this.passInput.value = this.generateRandomPassword();
                });
            }
        },

        checkState: function () {
            // Start in locked state by default
            this.renderList();
        },

        triggerUnlock: function () {
            // Fallback to Modal if needed, but we prefer inline now.
            // If the old button exists (e.g. from some other view), we support it.
            if (app.Locker) {
                app.Locker.open(this.onUnlockSuccess.bind(this));
            }
        },

        handleInlineUnlock: async function () {
            const pin = this.inlinePinInput ? this.inlinePinInput.value : '';
            const errorEl = document.getElementById('pm-inline-error');

            if (!pin) {
                if (errorEl) errorEl.textContent = "Please enter PIN";
                return;
            }

            if (this.inlineUnlockBtn) this.inlineUnlockBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            if (errorEl) errorEl.textContent = "";

            // 1. Ensure Session is Unlocked (Decrypt GitHub Token)
            if (app.githubSync && !app.githubSync.token && app.githubSync.encryptedToken) {
                console.log("PM: Attempting to unlock session...");
                const sessionUnlocked = await app.githubSync.tryUnlock(pin);
                if (!sessionUnlocked) {
                    if (errorEl) errorEl.textContent = "Incorrect PIN (Session Unlock)";
                    if (this.inlineUnlockBtn) this.inlineUnlockBtn.textContent = "Unlock";
                    return;
                }
                console.log("PM: Session Unlocked. Proceeding to Locker.");
            }

            // 2. Register Callback so Locker knows where to send data
            if (app.Locker) app.Locker.onUnlockCallback = this.onUnlockSuccess.bind(this);

            // 3. Attempt unlock Vault
            const success = await app.Locker.handleUnlock(pin);

            if (!success) {
                if (errorEl) errorEl.textContent = app.Locker.unlockError ? app.Locker.unlockError.textContent : "Incorrect PIN";
                if (this.inlineUnlockBtn) this.inlineUnlockBtn.textContent = "Unlock";
                if (this.inlinePinInput) {
                    this.inlinePinInput.value = '';
                    this.inlinePinInput.focus();
                }
            }
            // If success, Locker calls finishUnlock -> renderList(secrets)
        },

        onUnlockSuccess: function (data) {
            console.log("PM: onUnlockSuccess called with:", data);
            this.lockerDataRef = data;
            this.secrets = data.secrets || [];
            this.renderList();

            // Auto-focus search input for immediate typing
            setTimeout(() => {
                if (this.searchInput) this.searchInput.focus();
            }, 50);
        },

        lockVault: function () {
            this.secrets = [];
            this.lockerDataRef = null;
            if (app.Locker) app.Locker.close();
            this.renderLockedState();
            if (this.viewTitle) this.viewTitle.textContent = 'All Items';
        },

        renderLockedState: function () {
            const container = document.querySelector('.pm-container');
            if (container) container.classList.add('locked-mode');

            if (this.listContainer) {
                this.listContainer.innerHTML = `
                    <div class="pm-locked-state">
                        <i class="fa-solid fa-shield-cat"></i>
                        <h3>Vault is Locked</h3>
                        <p>Enter your Master PIN to view your passwords.</p>
                        
                        <div class="pm-inline-auth">
                            <input type="password" id="pm-inline-pin" placeholder="Enter PIN" maxlength="8">
                            <button id="pm-inline-unlock-btn" class="form-btn-save">Unlock</button>
                        </div>
                        <p id="pm-inline-error" style="color: #ff4d4d; margin-top: 10px; height: 20px; font-size: 0.9rem;"></p>
                    </div>
                `;
            }
            // Re-cache and bind for new elements
            this.cacheDOM();
            this.bindEvents(); // Re-bind inline events to new DOM

            if (this.countBadge) this.countBadge.textContent = "Locked";
            // Focus input
            setTimeout(() => {
                if (this.inlinePinInput) this.inlinePinInput.focus();
            }, 100);
        },

        renderList: function (secrets) {
            // Check if we received secrets from Locker (via explicit call)
            if (secrets) {
                this.secrets = secrets;
                this.lockerDataRef = { secrets: secrets }; // Mock ref if needed
            }

            if (!this.lockerDataRef) {
                this.renderLockedState();
                return;
            }

            console.log("PM: renderList unlocking UI. Secrets:", this.secrets);

            // Unlock Successful: Remove Locked Mode
            const container = document.querySelector('.pm-container');
            if (container) container.classList.remove('locked-mode');

            // Filter
            let filtered = this.secrets.filter(s => {
                const matchesSearch = (s.title || '').toLowerCase().includes(this.searchTerm) ||
                    (s.user || '').toLowerCase().includes(this.searchTerm);
                const matchesFilter = this.filter === 'all' || (this.filter === 'favorites' && s.favorite);
                return matchesSearch && matchesFilter;
            });

            console.log("PM: Filtering results:", filtered.length);

            if (this.countBadge) this.countBadge.textContent = `${filtered.length} items`;

            if (this.listContainer) {
                this.listContainer.innerHTML = '';

                filtered.forEach(s => {
                    // Determine domain for logo: explicit site > title
                    const domain = this.getDomain(s.site) || this.getDomain(s.title);
                    const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
                    const initial = (s.title || '?')[0].toUpperCase();

                    const card = document.createElement('div');
                    card.className = 'pm-card';
                    card.innerHTML = `
                    <div class="pm-card-header">
                        <div class="pm-card-logo">
                             ${logoUrl ? `<img src="${logoUrl}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">` : ''}
                            <div class="pm-card-initial" style="display: ${logoUrl ? 'none' : 'flex'}; background-color: ${this.getColorForString(s.title)}">
                                ${initial}
                            </div>
                        </div>
                        
                        <div class="pm-card-details">
                            <div class="pm-card-row-top">
                                <div class="pm-card-title">
                                    ${this.escapeHtml(s.title)} 
                                    ${s.site ? `<a href="${this.escapeHtml(s.site)}" target="_blank" title="Open Link" class="pm-site-link"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                                </div>
                                <div class="pm-header-actions">
                                    <button class="pm-icon-btn" onclick="window.Homepage.PasswordManager.openEditModal(${s.id})" title="Edit">
                                        <i class="fa-solid fa-pencil"></i>
                                    </button>
                                    <button class="pm-icon-btn delete" onclick="window.Homepage.PasswordManager.deleteSecret(${s.id})" title="Delete">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                    <button class="pm-icon-btn ${s.favorite ? 'active' : ''}" style="${s.favorite ? 'color:gold; opacity:1;' : ''}"
                                        onclick="window.Homepage.PasswordManager.toggleFavorite(${s.id})">
                                        <i class="${s.favorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                                    </button>
                                </div>
                            </div>
                            ${s.user ? `<div class="pm-card-subtitle">${this.escapeHtml(s.user)}</div>` : '<div class="pm-card-subtitle placeholder">No Username</div>'}
                        </div>
                    </div>
                    
                    <div class="pm-pass-field">
                        <input type="password" value="${this.escapeHtml(s.pass, true)}" readonly id="pass-field-${s.id}">
                        <div class="pm-pass-actions">
                            <button class="pm-icon-btn small" onclick="window.Homepage.PasswordManager.toggleVisibility(${s.id})" title="Show/Hide">
                                <i class="fa-solid fa-eye" id="icon-eye-${s.id}"></i>
                            </button>
                            <button class="pm-icon-btn small" onclick="window.Homepage.PasswordManager.copyToClipboard('${this.escapeHtml(s.pass, true)}')" title="Copy">
                                <i class="fa-solid fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `;
                    this.listContainer.appendChild(card);
                });
            }
        },

        toggleVisibility: function (id) {
            const input = document.getElementById(`pass-field-${id}`);
            const icon = document.getElementById(`icon-eye-${id}`);
            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fa-solid fa-eye-slash';
                    icon.style.color = 'var(--pm-accent)';
                } else {
                    input.type = 'password';
                    icon.className = 'fa-solid fa-eye';
                    icon.style.color = '';
                }
            }
        },

        getDomain: function (str) {
            if (!str) return null;
            let val = str.toLowerCase().trim();
            // If it's a full URL
            if (val.startsWith('http')) {
                try { return new URL(val).hostname; } catch (e) { return null; }
            }
            // If it looks like a domain
            if (val.includes('.') && !val.includes(' ')) {
                return val;
            }
            // If simple string (title), try appending .com for logo fetch
            if (/^[a-z0-9]+$/.test(val)) {
                return val + ".com";
            }
            return null;
        },

        openEditModal: function (id = null) {
            this.editModal.classList.add('visible');
            if (id) {
                // Edit Mode
                const s = this.secrets.find(x => x.id === id);
                if (s) {
                    this.editIdInput.value = s.id;
                    this.titleInput.value = s.title;
                    if (this.siteInput) this.siteInput.value = s.site || ''; // Use new field
                    this.userInput.value = s.user;
                    this.passInput.value = s.pass;
                    this.modalTitle.textContent = 'Edit Password';
                }
            } else {
                // Add Mode
                this.editIdInput.value = '';
                this.titleInput.value = '';
                if (this.siteInput) this.siteInput.value = '';
                this.userInput.value = '';
                this.passInput.value = '';
                this.modalTitle.textContent = 'Add New Password';
            }
        },

        closeEditModal: function () {
            this.editModal.classList.remove('visible');
        },

        saveSecret: async function () {
            if (!this.lockerDataRef) return;

            const id = this.editIdInput.value ? parseInt(this.editIdInput.value) : Date.now();
            const title = this.titleInput.value.trim();
            const site = this.siteInput ? this.siteInput.value.trim() : '';
            const user = this.userInput.value.trim();
            const pass = this.passInput.value.trim();

            if (!title) {
                alert("Title is required.");
                return;
            }

            // Find existing
            const existingIndex = this.secrets.findIndex(s => s.id === id);
            const newSecret = {
                id,
                title,
                site, // Save site
                user,
                pass,
                created: new Date().toISOString(),
                favorite: existingIndex >= 0 ? this.secrets[existingIndex].favorite : false
            };

            if (existingIndex >= 0) {
                this.secrets[existingIndex] = newSecret;
            } else {
                this.secrets.push(newSecret);
            }

            // Save via Locker Module
            await this.performSave();

            this.closeEditModal();
            this.renderList();
        },

        deleteSecret: async function (id) {
            if (!confirm("Are you sure you want to delete this password?")) return;

            const idx = this.secrets.findIndex(s => s.id === id);
            if (idx >= 0) {
                this.secrets.splice(idx, 1);
                await this.performSave();
                this.renderList();
            }
        },

        toggleFavorite: async function (id) {
            const s = this.secrets.find(x => x.id === id);
            if (s) {
                s.favorite = !s.favorite;
                await this.performSave();
                this.renderList();
            }
        },

        performSave: async function () {
            if (app.Locker && app.Locker.saveLocker) {
                await app.Locker.saveLocker();
            }
        },

        generateRandomPassword: function () {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
            let pass = "";
            for (let i = 0; i < 16; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return pass;
        },

        copyToClipboard: function (text) {
            navigator.clipboard.writeText(text).then(() => {
                // Toast could go here
            });
        },

        // Utils
        escapeHtml: function (text, escapeQuotes = false) {
            if (!text) return '';
            let str = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            if (escapeQuotes) str = str.replace(/"/g, "&quot;").replace(/'/g, "\\'");
            return str;
        },

        getColorForString: function (str) {
            let hash = 0;
            if (!str) return '#4dff88';
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
            return '#' + "00000".substring(0, 6 - c.length) + c;
        },



    };

})(window.Homepage = window.Homepage || {});
