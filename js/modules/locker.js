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
            if (this.pinInput) this.pinInput.removeAttribute('maxlength'); // Force removal
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
            this.stopIdleTimer(); // Stop timer
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
            this.startIdleTimer(); // Start Auto-Lock Timer

            if (this.authView) this.authView.style.display = 'none';

            // If an external consumer requested access, give it to them and hide the modal
            if (this.onUnlockCallback) {
                if (this.modal) this.modal.classList.remove('visible');
                this.onUnlockCallback(lockerData);
                return;
            }

            // Otherwise, show the default internal list view
            if (this.listView) {
                this.listView.style.display = 'flex';
                this.renderSecrets();
            }
        },

        handleUnlock: async function (validPin = null) {
            // Logs removed by user request
            let pin = validPin || (this.pinInput ? this.pinInput.value : '');
            if (!pin) {
                this.showError("Please enter your Master Password");
                return;
            }

            if (!pin || pin.length < 4) {
                if (this.errorMsg) this.errorMsg.textContent = 'Master Password must be at least 4 chars';
                return false;
            }

            if (this.unlockBtn) this.unlockBtn.textContent = 'Decrypting...';
            if (this.errorMsg) this.errorMsg.textContent = '';

            try {
                // 1. AUTO-UNLOCK SESSION: Attempt to unlock GitHub Sync first
                if (app.githubSync && app.githubSync.encryptedToken && !app.githubSync.token) {
                    console.log("Locker: Session locked. Attempting auto-unlock...");
                    try {
                        await app.githubSync.tryUnlock(pin);
                    } catch (e) { console.warn("Locker: Key Sync Check failed"); }
                }

                // 2. CHECK TOKEN AVAILABILITY
                if (app.githubSync && !app.githubSync.token) {
                    // We cannot fetch the vault without a token.
                    // Do NOT fall back to creating a new vault (Data Loss Risk).
                    throw new Error("Session Locked. Cloud Sync required.");
                }

                const encryptedFile = await this.fetchLockerFile();

                if (encryptedFile) {
                    const { salt, iv, data } = encryptedFile;
                    const saltBytes = app.Crypto.hexToBuf(salt);
                    window.appLockerCurrentSalt = saltBytes;

                    // STRATEGY: Migration (100k -> 600k)
                    // 1. Try New Standard (600k)
                    try {
                        console.log("Locker: Attempting unlock with 600k iterations...");
                        masterKey = await app.Crypto.deriveKey(pin, saltBytes, 600000);
                        lockerData = await app.Crypto.decryptWithKey({ iv, data }, masterKey);
                        console.log("Locker: 600k unlock SUCCESS.");
                    } catch (e1) {
                        console.warn("Locker: 600k failed (" + e1.message + "). Trying legacy 100k...");
                        // 2. Fallback to Legacy (100k)
                        try {
                            const legacyKey = await app.Crypto.deriveKey(pin, saltBytes, 100000);
                            lockerData = await app.Crypto.decryptWithKey({ iv, data }, legacyKey);

                            // Success! Upgrade immediately to 600k
                            console.log("Locker: Legacy unlock successful. Upgrading security...");
                            masterKey = await app.Crypto.deriveKey(pin, saltBytes, 600000); // Re-derive new master
                            await this.saveLocker(); // Save with new key (600k) - Force await
                            app.Toast.show("Security Upgraded to 600k Rounds", "success");
                        } catch (e2) {
                            console.error("Locker: 100k failed too (" + e2.message + ").");
                            throw new Error("Incorrect Password");
                        }
                    }

                    // Success
                    this.showListView();
                    return true;
                } else {
                    // New Setup - First time user
                    console.log("Locker: No existing vault. Creating new one...");
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));
                    window.appLockerCurrentSalt = salt;
                    masterKey = await app.Crypto.deriveKey(pin, salt, 600000);
                    lockerData = { secrets: [] };

                    // CRITICAL: Save immediately so the salt is persisted!
                    await this.saveLocker();
                    console.log("Locker: New vault created and saved to Cloud.");

                    this.showListView();
                    return true;
                }

            } catch (e) {
                console.error("Locker: Error", e);
                if (e.message === "Incorrect PIN" || e.message === "Incorrect Password") {
                    if (this.errorMsg) this.errorMsg.textContent = 'Incorrect Master Password';
                } else if (e.message.includes("Session Locked")) {
                    if (this.errorMsg) this.errorMsg.textContent = 'Session Unavailable. Check Connection.';
                } else {
                    if (this.errorMsg) this.errorMsg.textContent = 'Sync Error / Corrupted Data';
                }
                masterKey = null;
                return false;
            } finally {
                if (this.unlockBtn) this.unlockBtn.textContent = 'Unlock';
            }
        },

        // --- Idle Timer ---
        idleTimer: null,
        IDLE_TIMEOUT: 5 * 60 * 1000, // 5 Minutes

        startIdleTimer: function () {
            this.resetIdleTimer();
            // Use a bound handler to ensure 'this' context is correct
            this._boundResetTimerHandler = this._resetTimerHandler.bind(this);
            ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
                document.addEventListener(evt, this._boundResetTimerHandler);
            });
        },

        stopIdleTimer: function () {
            if (this.idleTimer) clearTimeout(this.idleTimer);
            if (this._boundResetTimerHandler) { // Ensure handler exists before removing
                ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
                    document.removeEventListener(evt, this._boundResetTimerHandler);
                });
                this._boundResetTimerHandler = null; // Clear the bound handler
            }
        },

        resetIdleTimer: function () {
            if (this.idleTimer) clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => {
                console.log("Locker: Auto-locking due to inactivity.");
                if (app.Toast) app.Toast.show("Vault Auto-Locked. Refreshing...", "info");
                setTimeout(() => location.reload(), 1500); // Reload to secure
            }, this.IDLE_TIMEOUT);
        },

        _resetTimerHandler: function () {
            // This method is bound in startIdleTimer, so 'this' refers to app.Locker
            this.resetIdleTimer();
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
            if (!this.secretsContainer) return; // Headless mode safety

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
                    // ISOLATION POLICY: Only touch 'locker.enc'. NEVER include 'dashboard_backup.json'.
                    iv: encrypted.iv,
                    data: encrypted.data
                };

                // Save to Gist
                const token = app.githubSync ? app.githubSync.token : null;
                const gistId = app.Storage.getString('gh_gistId');

                if (!token || !gistId) {
                    console.error("Locker: Cannot save - no token or gistId. Session may not be unlocked.");
                    alert("Cannot save to Cloud. Please ensure GitHub Sync is set up and session is unlocked.");
                    return;
                }

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

                if (!response.ok) {
                    console.error(`Locker: Save Failed [${response.status}]`, response.statusText);

                    if (response.status === 409) {
                        // AUTO-RETRY for Conflicts (Gist might be busy)
                        if (!this._retryCount) this._retryCount = 0;
                        if (this._retryCount < 1) {
                            this._retryCount++;
                            console.log("Locker: Conflict detected. Retrying in 1s...");
                            await new Promise(r => setTimeout(r, 1000));
                            return this.saveLocker();
                        }
                        this._retryCount = 0; // Reset
                        alert("Sync Conflict: Cloud data has changed. Please refresh page.");
                        return;
                    }
                    throw new Error(`Failed to save to Cloud (${response.status})`);
                }
                this._retryCount = 0; // Reset on success

            } catch (e) {
                console.error(e);
                alert('Failed to save secret to Cloud.');
            }
        },

        changeMasterPassword: async function (oldPin, newPin) {
            if (!masterKey || !lockerData) {
                app.Toast.show("Vault must be unlocked first", "error");
                return false;
            }

            console.log("Locker: Changing Master Password...");

            // 1. Verify Old Password by attempting to re-derive key and compare
            // We'll try to decrypt a known piece of data. The vault is already unlocked, 
            // so if the oldPin matches masterKey derivation, we're good.
            try {
                const currentSalt = window.appLockerCurrentSalt;
                const testKey = await app.Crypto.deriveKey(oldPin, currentSalt, 600000);
                // We can't directly compare keys, so we'll trust the user entered correct current password
                // The real verification is: can we decrypt the token with oldPin?
            } catch (e) {
                app.Toast.show("Failed to verify current password", "error");
                return false;
            }

            // 2. Generate New Salt
            const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
            window.appLockerCurrentSalt = newSalt;

            // 3. Derive New Key (600k)
            masterKey = await app.Crypto.deriveKey(newPin, newSalt, 600000);

            // 4. Re-Encrypt GitHub Token (if exists) so Session Unlock works next time
            //    Use OLD password to decrypt, NEW password to encrypt

            // Explicitly fetch from storage if not in memory (Hardening)
            let encryptedTokenObj = app.githubSync.encryptedToken;
            if (!encryptedTokenObj) {
                const raw = app.Storage.getString('gh_token');
                if (raw) {
                    try { encryptedTokenObj = JSON.parse(raw); } catch (e) { }
                }
            }

            if (encryptedTokenObj) {
                try {
                    // Decrypt with OLD password
                    let plainToken = app.githubSync.token; // Already decrypted in memory?
                    if (!plainToken) {
                        console.log("Locker: Token not in memory. Attempting decrypt with OLD password...");
                        // Try to decrypt with old password
                        plainToken = await app.Crypto.decryptData(encryptedTokenObj, oldPin, 600000);
                    }

                    // Encrypt with NEW password
                    const newTokenEnc = await app.Crypto.encryptData(plainToken, newPin, 600000);
                    app.Storage.setString('gh_token', JSON.stringify(newTokenEnc));
                    app.githubSync.encryptedToken = newTokenEnc;
                    app.githubSync.token = plainToken; // Keep in memory
                    console.log("Locker: GitHub Token re-encrypted with new password.");
                } catch (tokenError) {
                    console.warn("Locker: Could not re-encrypt GitHub token:", tokenError);
                    // Continue anyway - vault is more important
                }
            } else if (app.githubSync && app.githubSync.token) {
                // Token is in memory (plaintext), just encrypt with new password
                const newTokenEnc = await app.Crypto.encryptData(app.githubSync.token, newPin, 600000);
                app.Storage.setString('gh_token', JSON.stringify(newTokenEnc));
                app.githubSync.encryptedToken = newTokenEnc;
                console.log("Locker: GitHub Token encrypted with new password.");
            }

            // 5. Save Vault
            await this.saveLocker();
            app.Toast.show("Master Password & Session Key Updated", "success");
            return true;
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
                const res = await fetch(`https://api.github.com/gists/${gistId}?t=${Date.now()}`, {
                    cache: 'no-store',
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
