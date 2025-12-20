(function (app) {
    const LOCKER_FILENAME = 'locker.enc';
    let masterKey = null; // Transient Memory Only
    let lockerData = null; // Transient Memory Only

    app.Locker = {
        init: function () {
            console.log("Locker: Init");
            // Check for Web Crypto API Support
            if (!window.crypto || !window.crypto.subtle) {
                console.error("Web Crypto API not supported");
                alert("Secure Locker requires a Secure Context (HTTPS or localhost). It may not work on basic file:// paths depending on your browser.");
            }
            this.cacheDOM();
            this.bindEvents();
        },

        cacheDOM: function () {
            this.modal = document.getElementById('locker-modal');
            this.closeBtn = document.getElementById('locker-close-btn');

            // Auth View
            this.authView = document.getElementById('locker-auth-view');
            this.pinInput = document.getElementById('locker-pin-input');
            this.unlockBtn = document.getElementById('locker-unlock-btn');
            this.errorMsg = document.getElementById('locker-error-msg');
            this.authTitle = document.getElementById('locker-auth-title');

            // List View
            this.listView = document.getElementById('locker-list-view');
            this.secretsContainer = document.getElementById('locker-secrets-container');

            // Add Form
            this.addBtn = document.getElementById('locker-add-btn');
            this.newTitle = document.getElementById('new-secret-title');
            this.newUser = document.getElementById('new-secret-user');
            this.newPass = document.getElementById('new-secret-pass');

            // Navbar Trigger
            const navItem = document.querySelector('li[data-action="passwords"]');
            if (navItem) {
                navItem.addEventListener('click', () => this.open());
            }
        },

        bindEvents: function () {
            console.log("Locker: Binding Events", this.unlockBtn);
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
            if (this.modal) {
                this.modal.addEventListener('click', (e) => {
                    if (e.target === this.modal) this.close();
                });
            }

            if (this.unlockBtn) {
                this.unlockBtn.addEventListener('click', () => {
                    console.log("Unlock Clicked");
                    this.handleUnlock();
                });
            } else {
                console.error("Locker: Unlock Button not found");
            }

            if (this.pinInput) {
                this.pinInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleUnlock();
                });
            }

            if (this.addBtn) this.addBtn.addEventListener('click', () => this.handleAddSecret());
        },

        open: function (callback, autoPin = null) {
            if (!app.githubSync || !app.githubSync.token) {
                if (app.githubSync && app.githubSync.encryptedToken && app.githubSync.showUnlockModal) {
                    // Trigger Session Unlock with Callback for SSO
                    app.githubSync.showUnlockModal((pin) => {
                        // SSO: Try to unlock locker with same PIN provided
                        this.open(callback, pin);
                    });
                } else {
                    alert('Please connect GitHub Sync first (or Unlock Session) to use the Secure Locker.');
                }
                return;
            }
            this.onUnlockCallback = callback; // Hook for external modules (Password Manager)

            this.pinInput.value = autoPin || '';
            this.errorMsg.textContent = '';

            if (autoPin) {
                // Try silent unlock
                this.handleUnlock(autoPin);
            } else {
                this.modal.classList.add('visible');
                this.showAuthView();
                this.pinInput.focus();
            }
        },

        close: function () {
            this.modal.classList.remove('visible');
            this.onUnlockCallback = null; // Clear callback
            // ZERO KNOWLEDGE WIPE
            masterKey = null;
            lockerData = null;
            if (this.secretsContainer) this.secretsContainer.innerHTML = '';
            this.pinInput.value = '';
        },

        showAuthView: function () {
            this.authView.style.display = 'flex';
            this.listView.style.display = 'none';
        },

        showListView: function () {
            this.authView.style.display = 'none';

            // If an external consumer requested access, give it to them and hide the modal
            if (this.onUnlockCallback) {
                this.modal.classList.remove('visible');
                this.onUnlockCallback(lockerData);
                return;
            }

            // Otherwise, show the default internal list view
            this.listView.style.display = 'flex';
            this.renderSecrets();
        },

        handleUnlock: async function (validPin = null) {
            console.log("Locker: handleUnlock started");
            const pin = validPin || this.pinInput.value;
            if (pin.length < 4) {
                this.errorMsg.textContent = 'PIN must be at least 4 digits';
                if (validPin) {
                    this.modal.classList.add('visible');
                    this.showAuthView();
                }
                return;
            }

            this.unlockBtn.textContent = 'Decrypting...';
            this.errorMsg.textContent = '';

            try {
                console.log("Locker: Fetching file...");
                const encryptedFile = await this.fetchLockerFile();

                // CRITICAL: Always prioritize Salt from Cloud File if it exists
                if (encryptedFile) {
                    console.log("Locker: Existing Cloud File Found");
                    const { salt, iv, data } = encryptedFile;

                    // Salt is stored as Hex String in file -> Convert to Buffer
                    const saltBytes = app.Crypto.hexToBuf(salt);

                    // Update Session Salt to match Cloud Truth
                    window.appLockerCurrentSalt = saltBytes;

                    masterKey = await app.Crypto.deriveKey(pin, saltBytes);

                    try {
                        lockerData = await app.Crypto.decryptWithKey({ iv, data }, masterKey);
                    } catch (e) {
                        console.error("Locker: Decryption Failed", e);
                        // Decryption failed = Wrong PIN (since salt is correct)
                        throw new Error("Incorrect PIN");
                    }

                    // Decryption Success - Now update UI
                    // If this fails, it's a bug, not a wrong PIN
                    this.showListView();
                } else {
                    console.log("Locker: No Cloud File - New Setup");

                    // Only generate new salt if one doesn't exist in session specific for locker
                    // Actually, if it's a new setup, we MUST generate a new salt.
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));
                    window.appLockerCurrentSalt = salt;

                    masterKey = await app.Crypto.deriveKey(pin, salt);
                    lockerData = { secrets: [] };
                    this.showListView();
                }

            } catch (e) {
                console.error("Locker: Error", e);
                // Differentiate Network vs Crypto Error
                if (e.message === "Incorrect PIN") {
                    this.errorMsg.textContent = 'Incorrect PIN';
                } else {
                    this.errorMsg.textContent = 'Sync Error / Corrupted Data';
                }

                masterKey = null;

                // Ensure modal is visible to retry
                if (validPin) {
                    this.modal.classList.add('visible');
                    this.showAuthView();
                }
            } finally {
                this.unlockBtn.textContent = 'Unlock';
            }
        },

        handleAddSecret: async function () {
            const title = this.newTitle.value.trim();
            const pass = this.newPass.value;
            const user = this.newUser.value.trim();

            if (!title || !pass) {
                alert('Title and Password are required');
                return;
            }

            if (!lockerData) lockerData = { secrets: [] };

            lockerData.secrets.push({
                id: Date.now(),
                title,
                user,
                pass,
                created: new Date().toISOString()
            });

            // Encrypt and Save
            await this.saveLocker();

            // Clear Form
            this.newTitle.value = '';
            this.newUser.value = '';
            this.newPass.value = '';

            this.renderSecrets();
        },

        deleteSecret: async function (id) {
            if (!confirm('Delete this secret?')) return;
            lockerData.secrets = lockerData.secrets.filter(s => s.id !== id);
            await this.saveLocker();
            this.renderSecrets();
        },

        renderSecrets: function () {
            if (!lockerData || !lockerData.secrets.length) {
                this.secretsContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 2rem;">No secrets yet.</div>';
                return;
            }

            this.secretsContainer.innerHTML = lockerData.secrets.map(s => `
                <div class="secret-item">
                    <div class="secret-info">
                        <div class="secret-title">${this.escapeHtml(s.title)}</div>
                        <div class="secret-meta">${this.escapeHtml(s.user || '')}</div>
                        <div class="secret-value" id="secret-${s.id}">${this.escapeHtml(s.pass)}</div>
                    </div>
                    <div class="secret-actions">
                        <button class="secret-btn" onclick="app.Locker.toggleReveal(${s.id})"><i class="fa-solid fa-eye"></i></button>
                        <button class="secret-btn" onclick="app.Locker.copySecret(${s.id})"><i class="fa-solid fa-copy"></i></button>
                        <button class="secret-btn delete" onclick="app.Locker.deleteSecret(${s.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        },

        toggleReveal: function (id) {
            const el = document.getElementById(`secret-${id}`);
            if (el) el.classList.toggle('visible');
        },

        copySecret: function (id) {
            const secret = lockerData.secrets.find(s => s.id === id);
            if (secret) {
                navigator.clipboard.writeText(secret.pass);
                // Feedback?
            }
        },

        saveLocker: async function () {
            if (!masterKey) return;

            // Retrieve Salt from memory
            let saltBytes;
            if (window.appLockerCurrentSalt) {
                saltBytes = window.appLockerCurrentSalt;
            } else {
                console.error("Salt lost!");
                return;
            }

            try {
                // Encrypt (New IV generated inside, returns Hex Strings)
                // Returns { salt, iv, data } - Salt is passed through as Hex
                const encrypted = await app.Crypto.encryptWithKey(lockerData, masterKey, saltBytes);

                // Construct File Object (Standard Format)
                const fileContent = {
                    salt: encrypted.salt,
                    iv: encrypted.iv,
                    data: encrypted.data
                };

                // Save to Gist
                const token = app.githubSync.token;
                const gistId = app.Storage.getString('gh_gistId');

                const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        files: {
                            [LOCKER_FILENAME]: { content: JSON.stringify(fileContent) }
                        }
                    })
                });

                if (!response.ok) throw new Error('Failed to save to Cloud');

            } catch (e) {
                console.error(e);
                alert('Failed to save secret to Cloud.');
            }
        },

        // Helper
        // --- GIST UTILS ---

        fetchLockerFile: async function () {
            const LOCKER_FILENAME = 'locker.enc'; // Re-declare or assume scope? 
            // LOCKER_FILENAME is defined at top of IIFE, so it is accessible.
            const token = app.githubSync ? app.githubSync.token : '';
            const gistId = app.Storage.getString('gh_gistId');
            if (!token || !gistId) return null;

            try {
                const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                    headers: { 'Authorization': `token ${token}` }
                });
                if (!res.ok) return null;
                const json = await res.json();
                if (json.files && json.files[LOCKER_FILENAME]) {
                    return JSON.parse(json.files[LOCKER_FILENAME].content);
                }
            } catch (e) {
                console.error("Locker: Fetch Error", e);
            }
            return null;
        },

        // Helper
        escapeHtml: function (text) {
            if (!text) return '';
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }
    };
})(window.Homepage || (window.Homepage = {}));
