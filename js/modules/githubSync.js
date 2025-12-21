(function (app) {
    const GIST_FILENAME = 'dashboard_backup.json';
    const GIST_DESCRIPTION = 'Browser Homepage Auto-Backup';

    app.githubSync = {
        token: '', // Decrypted (RAM only)
        encryptedToken: null, // Encrypted Object
        gistId: '',
        autoSync: false,
        lastSync: null,
        statusEl: null,
        pendingRestoreData: null,

        init: function () {
            // 1. Read Storage
            const rawToken = app.Storage.getString('gh_token', '');
            this.gistId = app.Storage.getString('gh_gistId', '');
            this.autoSync = app.Storage.getString('gh_autoSync') === 'true';
            this.lastSync = app.Storage.getString('gh_lastSync', '');

            this.cacheDOM();
            this.bindEvents();

            // 2. Check Token Type
            if (rawToken) {
                try {
                    const parsed = JSON.parse(rawToken);
                    if (parsed.iv && parsed.data && parsed.salt) {
                        // Case A: Encrypted Token
                        this.encryptedToken = parsed;
                        this.updateStatus('Session Locked (Unlock in Settings)', 'normal');
                        this.showLockedState(); // Show Unlock Button, Hide Setup
                        return;
                    }
                } catch (e) { }

                // Case B: Legacy Plain Text
                console.warn("Legacy Plain-Text Token detected.");
                this.token = rawToken;
                this.updateStatus("⚠️ Token Unsecured (Legacy)", "error");
                this.finishInit();
            } else {
                // Case C: No Token
                this.showSetupState();
            }
        },

        // Called after successful unlock or legacy load
        finishInit: async function () {
            // UI State Init
            if (this.token) {
                // Validate/Find gist if missing
                if (!this.gistId) {
                    this.updateStatus('Connecting to Cloud Storage...', 'normal');
                    try {
                        const success = await this.findOrCreateGist();
                        if (!success) {
                            this.updateStatus('Cloud Storage Error', 'error');
                            return;
                        }
                    } catch (e) {
                        this.updateStatus(`Storage Error: ${e.message}`, 'error');
                        return;
                    }
                }

                // Restore connection state
                if (this.lastSync) {
                    this.updateStatus(`Connected. Last Sync: ${this.lastSync}`, 'success');
                } else {
                    this.updateStatus('Connected & Ready', 'success');
                }
                this.showConnectedState();
            }
        },

        cacheDOM: function () {
            this.tokenInput = document.getElementById('github-token-input');
            this.connectBtn = document.getElementById('gh-save-token-btn');
            this.manualSyncBtn = document.getElementById('gh-manual-sync-btn');
            this.restoreBtn = document.getElementById('gh-restore-btn');
            this.editBtn = document.getElementById('gh-edit-token-btn');
            this.autoSyncToggle = document.getElementById('gh-autosync-toggle');
            this.statusEl = document.getElementById('gh-sync-status');

            // Sidebar Badge
            this.syncBadge = document.getElementById('main-sync-badge');

            this.setupBtn = document.getElementById('gh-setup-btn');
            this.unlockSessionBtn = document.getElementById('gh-unlock-session-btn');
            this.configArea = document.getElementById('gh-config-area');

            // Restore Modal Elements
            this.restoreModal = document.getElementById('restore-modal');
            this.restoreStats = document.getElementById('restore-stats');
            this.restoreConfirmBtn = document.getElementById('restore-confirm-btn');
            this.restoreCancelBtn = document.getElementById('restore-cancel-btn');

            // Session Unlock Modal
            this.unlockModal = document.getElementById('session-unlock-modal');
            this.unlockPinInput = document.getElementById('session-pin-input');
            this.unlockBtn = document.getElementById('session-unlock-btn');
            this.skipBtn = document.getElementById('session-skip-btn');
            this.unlockError = document.getElementById('session-error-msg');
        },

        // ... [Bind Events] ...

        // ... [Rest of logic] ...

        updateStatus: function (msg, type = 'normal') {
            if (this.statusEl) {
                this.statusEl.textContent = `Status: ${msg}`;
                this.statusEl.style.color = type === 'success' ? '#4dff88' : (type === 'error' ? '#ff4d4d' : '#888');
            }

            // Update Sidebar Badge
            if (this.syncBadge) {
                this.syncBadge.className = 'sync-badge'; // Reset base class

                const lowerMsg = msg.toLowerCase();

                // 1. Error State
                if (type === 'error') {
                    this.syncBadge.classList.add('error');
                    this.syncBadge.title = `Sync Error: ${msg}`;
                    return;
                }

                // 2. Active Syncing
                if (lowerMsg.includes('syncing') || lowerMsg.includes('encrypting') || lowerMsg.includes('connecting')) {
                    this.syncBadge.classList.add('syncing');
                    this.syncBadge.title = msg;
                    return;
                }

                // 3. Explicit Success or Connected Message
                if (type === 'success' || lowerMsg.includes('connected')) {
                    this.syncBadge.classList.add('connected');
                    this.syncBadge.title = `Cloud Connected: ${msg}`;
                    return;
                }

                // 4. Idle/Normal State - Check actual Token existence AND Gist Connection
                // If we have a token AND a gistId, we are effectively "connected".
                if (this.token && this.gistId && !lowerMsg.includes('locked')) {
                    this.syncBadge.classList.add('connected');
                    this.syncBadge.title = "Cloud Connected & Idle";
                } else {
                    // Default Grey (Locked, Offline, or No Gist)
                    this.syncBadge.title = msg || "Offline";
                }
            }
        },

        bindEvents: function () {
            // ... Standard Events ...
            if (this.setupBtn) {
                this.setupBtn.addEventListener('click', () => {
                    this.setupBtn.style.display = 'none';
                    if (this.configArea) this.configArea.style.display = 'block';
                });
            }

            if (this.unlockSessionBtn) {
                this.unlockSessionBtn.addEventListener('click', () => {
                    this.showUnlockModal();
                });
            }

            if (this.connectBtn) {
                this.connectBtn.addEventListener('click', () => {
                    const token = this.tokenInput.value.trim();
                    if (token) {
                        this.connect(token);
                    } else {
                        alert('Please enter a valid GitHub Token.');
                    }
                });
            }

            if (this.manualSyncBtn) {
                this.manualSyncBtn.addEventListener('click', () => this.syncUp(true));
            }

            if (this.restoreBtn) {
                this.restoreBtn.addEventListener('click', () => {
                    this.syncDown();
                });
            }

            if (this.editBtn) {
                this.editBtn.addEventListener('click', () => {
                    this.showSetupState();
                });
            }

            if (this.autoSyncToggle) {
                this.autoSyncToggle.checked = this.autoSync;
                this.autoSyncToggle.addEventListener('change', (e) => {
                    this.autoSync = e.target.checked;
                    app.Storage.setString('gh_autoSync', this.autoSync);
                    if (this.autoSync) this.uploadData();
                });
            }

            if (this.restoreModal) {
                this.restoreModal.addEventListener('click', (e) => {
                    if (e.target === this.restoreModal) this.closeRestoreModal();
                });
            }

            // Sync Badge Click
            if (this.syncBadge) {
                this.syncBadge.addEventListener('click', () => {
                    if (this.token) {
                        // Connected: Trigger Sync
                        this.syncUp(true);
                    } else if (this.encryptedToken) {
                        // Locked: Prompt PIN
                        this.showUnlockModal();
                    } else {
                        // Not Configured: Open Settings
                        // We need a way to open settings modal from here.
                        // The settings button does: document.getElementById('settings-modal').classList.add('visible');
                        // Let's just emulate that or use a global helper if available.
                        const settingsModal = document.getElementById('settings-modal');
                        if (settingsModal) settingsModal.classList.add('visible');
                    }
                });
            }

            window.addEventListener('homepage-data-changed', () => {
                if (this.autoSync && this.token && this.gistId) {
                    this.debounceSync();
                }
            });

            // Unlock Modal Logic
            if (this.unlockBtn) {
                this.unlockBtn.addEventListener('click', () => this.handleUnlock());
            }
            if (this.unlockPinInput) {
                this.unlockPinInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleUnlock();
                });
            }
            if (this.skipBtn) {
                this.skipBtn.addEventListener('click', () => {
                    this.unlockModal.classList.remove('visible');
                    this.updateStatus('Offline (Session Locked)', 'normal');
                });
            }
        },

        connect: async function (token) {
            this.updateStatus('Connecting...');

            // 1. Verify Token first (using plain text)
            // We use a temporary object to test connection
            const tempToken = token;

            try {
                // Determine Gist ID (find or create)
                // We'll borrow the logic from findOrCreateGist but we need to do it carefully
                // to not save state yet.
                // Actually, let's just Prompt for PIN FIRST.

                const pin = prompt("🔐 Create a Master PIN to secure this token:\n(You will need this PIN every time you restart the browser)", "");
                if (!pin || pin.length < 4) {
                    alert("Connection Cancelled. PIN must be at least 4 digits.");
                    this.updateStatus('Setup Cancelled');
                    return;
                }

                // 2. Encrypt Token
                this.updateStatus('Encrypting...');
                const encrypted = await app.Crypto.encryptData(token, pin);

                // 3. Save Encrypted Token
                app.Storage.setString('gh_token', JSON.stringify(encrypted));

                // 4. Set Memory State
                this.token = token;
                this.encryptedToken = encrypted;

                // 5. Proceed with Sync Setup
                const success = await this.findOrCreateGist();
                if (success) {
                    this.updateStatus('Connected & Encrypted', 'success');
                    this.showConnectedState();
                    this.checkForBackup();
                }

            } catch (error) {
                console.error(error);
                this.updateStatus(`Connection Failed: ${error.message}`, 'error');
                // Revert storage if failed?
            }
        },

        // onUnlockCallback: function(pin) {}
        showUnlockModal: function (onUnlockCallback = null) {
            this.pendingUnlockCallback = onUnlockCallback; // Store callback
            if (this.unlockModal) {
                this.unlockModal.classList.add('visible');
                if (this.unlockPinInput) {
                    this.unlockPinInput.value = '';
                    this.unlockPinInput.focus();
                }
            }
        },

        // UI Event Handler
        handleUnlock: async function () {
            const pin = this.unlockPinInput.value;
            if (!pin) return;

            this.unlockBtn.textContent = 'Decrypting...';
            this.unlockError.textContent = '';

            const success = await this.tryUnlock(pin);

            this.unlockBtn.textContent = 'Unlock';

            if (success) {
                this.unlockModal.classList.remove('visible');
                // Callback handled in tryUnlock or here? 
                // tryUnlock handles finishInit.
                // handleUnlock logic for callbacks specific to UI modal:
                if (this.pendingUnlockCallback) {
                    this.pendingUnlockCallback(pin);
                    this.pendingUnlockCallback = null;
                }
            } else {
                this.unlockError.textContent = 'Incorrect PIN';
            }
        },

        // Programmatic Unlock
        tryUnlock: async function (pin) {
            if (!this.encryptedToken || !pin) return false;

            try {
                const decryptedToken = await app.Crypto.decryptData(this.encryptedToken, pin);

                // Verify it looks like a token?
                if (!decryptedToken || !decryptedToken.startsWith('gh')) {
                    // Soft check. 
                }

                this.token = decryptedToken;
                this.finishInit(); // Resume init

                // Update Badge State immediately
                this.updateStatus('Session Unlocked', 'success');

                return true;

            } catch (e) {
                console.error("Unlock failed", e);
                return false;
            }
        },

        checkForBackup: async function () {
            try {
                const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                    headers: { 'Authorization': `token ${this.token}` }
                });
                if (response.ok) {
                    const gist = await response.json();
                    if (gist.files && gist.files[GIST_FILENAME]) {
                        // Found backup. Show status update or prompt?
                        // User wants seamless, less popup unless requested.
                        // But we should probably indicate it's available.
                        this.updateStatus('Cloud Backup Detected', 'success');
                        // We rely on user clicking "Restore" button if they want it,
                        // OR if it's the very first connection, maybe prompt? 
                        // Current logic: Just notify status.
                    }
                }
            } catch (e) { }
        },

        showSetupState: function () {
            if (this.setupBtn) this.setupBtn.style.display = 'block';
            if (this.unlockSessionBtn) this.unlockSessionBtn.style.display = 'none';
            if (this.configArea) this.configArea.style.display = 'none';
            if (this.manualSyncBtn) this.manualSyncBtn.style.display = 'none';
            if (this.restoreBtn) this.restoreBtn.style.display = 'none';
            if (this.editBtn) this.editBtn.style.display = 'none';

            // Clear input to prevent user from submitting the masked "••••" value
            if (this.tokenInput) this.tokenInput.value = '';
        },

        showLockedState: function () {
            if (this.setupBtn) this.setupBtn.style.display = 'none';
            if (this.unlockSessionBtn) this.unlockSessionBtn.style.display = 'block';
            if (this.configArea) this.configArea.style.display = 'none';
            if (this.manualSyncBtn) this.manualSyncBtn.style.display = 'none';
            if (this.restoreBtn) this.restoreBtn.style.display = 'none';
            if (this.editBtn) this.editBtn.style.display = 'none';
        },

        showConnectedState: function () {
            if (this.setupBtn) this.setupBtn.style.display = 'none';
            if (this.unlockSessionBtn) this.unlockSessionBtn.style.display = 'none';
            if (this.configArea) this.configArea.style.display = 'none';

            if (this.manualSyncBtn) {
                this.manualSyncBtn.style.display = 'block';
                this.manualSyncBtn.disabled = false;
            }
            if (this.restoreBtn) {
                this.restoreBtn.style.display = 'block';
                this.restoreBtn.disabled = false;
            }
            if (this.editBtn) {
                this.editBtn.style.display = 'block';
            }
            if (this.autoSyncToggle) this.autoSyncToggle.disabled = false;
        },

        findOrCreateGist: async function () {
            try {
                // 1. List Gists
                const response = await fetch('https://api.github.com/gists', {
                    headers: { 'Authorization': `token ${this.token}` }
                });

                if (response.status === 401) throw new Error('Invalid Token (401)');
                if (response.status === 403) throw new Error('Missing "gist" Scope (403)');
                if (!response.ok) throw new Error(`GitHub API Error (${response.status})`);

                const gists = await response.json();

                // 2. Find existing
                const existing = gists.find(g => g.files && g.files[GIST_FILENAME]);

                if (existing) {
                    this.gistId = existing.id;
                    app.Storage.setString('gh_gistId', this.gistId);
                    this.updateStatus('Linked to existing Gist');
                    return true;
                }

                // 3. Create new if not found
                return await this.createGist();

            } catch (e) {
                throw e; // Propagate error to connect()
            }
        },

        createGist: async function () {
            this.updateStatus('Creating new Gist...');
            try {
                const response = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        description: GIST_DESCRIPTION,
                        public: false,
                        files: {
                            [GIST_FILENAME]: { content: JSON.stringify(this.getExportData()) }
                        }
                    })
                });

                if (response.ok) {
                    const gist = await response.json();
                    this.gistId = gist.id;
                    app.Storage.setString('gh_gistId', this.gistId);
                    return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        },

        syncUp: async function (manual = false) {
            if (!this.token || !this.gistId) return;

            if (manual) this.updateStatus('Syncing up...');

            const data = this.getExportData();

            try {
                const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        files: {
                            [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) }
                        }
                    })
                });

                if (response.status === 401) {
                    this.updateStatus('Session Expired (401). Please Re-connect.', 'error');
                    this.autoSync = false;
                    app.Storage.setString('gh_autoSync', 'false');
                    if (this.autoSyncToggle) this.autoSyncToggle.checked = false;
                    this.showSetupState();
                    return;
                }

                if (!response.ok) throw new Error('Sync Failed');

                const now = new Date();
                this.lastSync = now.toLocaleString();
                app.Storage.setString('gh_lastSync', this.lastSync);

                this.updateStatus(`Last Synced: ${this.lastSync}`, 'success');

            } catch (e) {
                console.error(e);
                this.updateStatus('Sync Failed', 'error');
            }
        },

        // Phase 1: Fetch and Show Modal
        syncDown: async function () {
            this.updateStatus('Checking Backup...');
            try {
                const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                    headers: { 'Authorization': `token ${this.token}` }
                });

                if (response.status === 401) {
                    this.updateStatus('Session Expired (401). Please Re-connect.', 'error');
                    this.showSetupState();
                    alert('Session Expired. Please re-enter your GitHub Token.');
                    return;
                }

                if (!response.ok) throw new Error('Fetch failed');
                const gist = await response.json();

                if (gist.files && gist.files[GIST_FILENAME]) {
                    const content = gist.files[GIST_FILENAME].content;
                    this.pendingRestoreData = JSON.parse(content);

                    this.openRestoreModal(this.pendingRestoreData);
                    this.updateStatus('Waiting for confirmation...', 'normal');
                } else {
                    this.updateStatus('No backup file found in Gist.', 'error');
                    this.pendingRestoreData = null;
                }

            } catch (e) {
                console.error(e);
                this.updateStatus('Restore Failed', 'error');
                this.pendingRestoreData = null;
            }
        },

        // Phase 2: Apply Logic
        applyRestore: function () {
            const data = this.pendingRestoreData;
            if (!data) return;

            // Restore to Storage
            if (data.homepageData) app.Storage.set('homepageData', data.homepageData);
            if (data.homepageBookmarks) app.Storage.set('homepageBookmarks', data.homepageBookmarks);
            if (data.homepageMultiNotes) app.Storage.set('homepageMultiNotes', data.homepageMultiNotes);
            if (data.homepageTodos) app.Storage.set('homepageTodos', data.homepageTodos);
            if (data.calendarNotes) app.Storage.set('calendarNotes', data.calendarNotes);

            if (data.backgroundSettings) app.Storage.set('backgroundSettings', data.backgroundSettings);
            if (data.backgroundFavorites) app.Storage.set('backgroundFavorites', data.backgroundFavorites);

            if (data.homepageBg) app.Storage.setString('homepageBg', data.homepageBg);
            if (data.iconOnlyMode !== undefined) app.Storage.setString('iconOnlyMode', data.iconOnlyMode);
            if (data.searchMode) app.Storage.setString('searchMode', data.searchMode);

            // Show Success UI in Modal with Date
            const dateStr = data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Unknown Date';

            if (this.restoreModal) {
                const modalContent = this.restoreModal.querySelector('.modal-form');
                if (modalContent) {
                    modalContent.innerHTML = `
                        <div style="padding: 2rem 0; color: #4dff88;">
                            <i class="fa-solid fa-circle-check" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <h3 style="margin-bottom: 1rem;">Restore Complete!</h3>
                            <p style="color: #ccc; font-size: 0.9rem;">Restored data from:<br><strong style="color: white; font-size: 1rem;">${dateStr}</strong></p>
                        </div>
                    `;
                }
            }

            this.updateStatus('Restore Complete!', 'success');

            // Auto close and reload
            setTimeout(() => {
                location.reload();
            }, 2000); // 2 seconds delay
        },

        openRestoreModal: function (data) {
            if (this.restoreModal) {
                this.restoreModal.classList.add('visible');
                // Stats hidden by default as requested
            }
        },

        closeRestoreModal: function () {
            if (this.restoreModal) {
                this.restoreModal.classList.remove('visible');
            }
        },

        // Legacy / Helper Methods
        uploadData: function () {
            this.syncUp(); // Alias
        },

        // Debounce for Auto-Sync
        debounceTimer: null,
        debounceSync: function () {
            clearTimeout(this.debounceTimer);
            this.updateStatus('Changes detected... waiting to sync');
            this.debounceTimer = setTimeout(() => {
                this.syncUp();
            }, 5000); // Sync 5 seconds after last change
        },

        getExportData: function () {
            return {
                homepageData: app.Storage.get('homepageData', []),
                homepageBookmarks: app.Storage.get('homepageBookmarks', []),
                homepageMultiNotes: app.Storage.get('homepageMultiNotes', []),
                homepageTodos: app.Storage.get('homepageTodos', []),
                calendarNotes: app.Storage.get('calendarNotes', {}),
                backgroundSettings: app.Storage.get('backgroundSettings', {}),
                backgroundFavorites: app.Storage.get('backgroundFavorites', []),
                homepageBg: app.Storage.getString('homepageBg', ''),
                iconOnlyMode: app.Storage.getString('iconOnlyMode') === 'true',
                searchMode: app.Storage.getString('searchMode', 'google'),
                lastUpdated: new Date().toISOString()
            };
        },



        enableControls: function () {
            if (this.manualSyncBtn) this.manualSyncBtn.disabled = false;
            if (this.autoSyncToggle) this.autoSyncToggle.disabled = false;
            if (this.tokenInput) this.tokenInput.value = '•••••••••••••••••';
        }
    };

})(window.Homepage || (window.Homepage = {}));
