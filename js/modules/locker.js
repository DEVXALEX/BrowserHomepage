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

        open: function () {
            if (!app.Storage.getString('gh_token')) {
                alert('Please connect GitHub Sync first to use the Secure Locker.');
                return;
            }
            this.modal.classList.add('visible');
            this.pinInput.value = '';
            this.errorMsg.textContent = '';
            this.showAuthView();
            this.pinInput.focus();
        },

        close: function () {
            this.modal.classList.remove('visible');
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
            this.listView.style.display = 'flex';
            this.renderSecrets();
        },

        handleUnlock: async function () {
            console.log("Locker: handleUnlock started");
            const pin = this.pinInput.value;
            if (pin.length < 4) {
                this.errorMsg.textContent = 'PIN must be at least 4 digits';
                return;
            }

            this.unlockBtn.textContent = 'Decrypting...';
            this.errorMsg.textContent = '';

            try {
                console.log("Locker: Fetching file...");
                // 1. Fetch Encrypted File
                const encryptedFile = await this.fetchLockerFile();
                console.log("Locker: File fetched", encryptedFile);

                if (!encryptedFile) {
                    console.log("Locker: New Setup");
                    // New Locker Setup
                    // Derive key from PIN + random Salt
                    const salt = window.crypto.getRandomValues(new Uint8Array(16));
                    window.appLockerCurrentSalt = salt; // Persist for saving

                    console.log("Locker: Deriving Key (New)");
                    masterKey = await this.deriveKey(pin, salt);
                    console.log("Locker: Key Derived");
                    lockerData = { secrets: [] }; // Empty

                    this.showListView();
                } else {
                    console.log("Locker: Existing Setup");
                    // Existing Locker
                    const { salt, iv, data } = encryptedFile;

                    // Re-derive key
                    const saltBytes = this.hexToBuf(salt);
                    window.appLockerCurrentSalt = saltBytes; // Persist for saving

                    console.log("Locker: Deriving Key (Existing)");
                    masterKey = await this.deriveKey(pin, saltBytes);

                    // Decrypt
                    try {
                        console.log("Locker: Decrypting...");
                        const decryptedJson = await this.decryptData(masterKey, this.hexToBuf(iv), this.hexToBuf(data));
                        lockerData = JSON.parse(decryptedJson);
                        this.showListView();
                    } catch (e) {
                        console.error("Locker: Decryption Failed", e);
                        this.errorMsg.textContent = 'Incorrect PIN or Corrupted Data';
                        masterKey = null; // Wipe invalid key
                        window.appLockerCurrentSalt = null;
                    }
                }
            } catch (e) {
                console.error("Locker: Error", e);
                this.errorMsg.textContent = 'Network Error: ' + e.message;
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

            let saltBytes;
            // Retrieve Salt from memory
            if (window.appLockerCurrentSalt) {
                saltBytes = window.appLockerCurrentSalt;
            } else {
                console.error("Salt lost!");
                return;
            }

            try {
                // Encrypt (New IV generated inside)
                const encrypted = await this.encryptData(masterKey, lockerData);

                // Construct File Object
                const fileContent = {
                    salt: this.bufToHex(saltBytes),
                    iv: this.bufToHex(encrypted.iv),
                    data: this.bufToHex(encrypted.data)
                };

                // Save to Gist
                const token = app.Storage.getString('gh_token');
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

                // Feedback? Blink the add button or something?
                // alert('Saved');

            } catch (e) {
                console.error(e);
                alert('Failed to save secret to Cloud.');
            }
        },

        // --- CRYPTO UTILS ---

        deriveKey: async function (password, salt) {
            // 1. Import Key material
            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
            );

            // 2. Derive Key
            return window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: salt,
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false, // Non-exportable key!
                ["encrypt", "decrypt"]
            );
        },

        encryptData: async function (key, dataObj) {
            const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
            const enc = new TextEncoder();
            const encoded = enc.encode(JSON.stringify(dataObj));

            const ciphertext = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                encoded
            );

            return {
                iv: iv,
                data: ciphertext
            };
        },

        decryptData: async function (key, iv, ciphertext) {
            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                ciphertext
            );
            const dec = new TextDecoder();
            return dec.decode(decrypted);
        },

        // --- GIST UTILS ---

        fetchLockerFile: async function () {
            const token = app.Storage.getString('gh_token');
            const gistId = app.Storage.getString('gh_gistId');
            if (!token || !gistId) return null;

            const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: { 'Authorization': `token ${token}` }
            });
            if (!res.ok) return null;
            const json = await res.json();
            if (json.files && json.files[LOCKER_FILENAME]) {
                return JSON.parse(json.files[LOCKER_FILENAME].content);
            }
            return null;
        },

        // Helpers
        hexToBuf: function (hex) {
            const matches = hex.match(/.{1,2}/g);
            return new Uint8Array(matches ? matches.map(byte => parseInt(byte, 16)) : []);
        },

        bufToHex: function (buf) {
            return Array.from(new Uint8Array(buf))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },

        escapeHtml: function (text) {
            if (!text) return '';
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }
    };
})(window.Homepage || (window.Homepage = {}));
