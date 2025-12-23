(function (app) {
    app.Crypto = {
        name: "SharedCrypto",

        // 1. Derive Key from Password (PBKDF2)
        deriveKey: async function (password, salt, iterations = 600000) {
            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
            );

            return window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: salt,
                    iterations: iterations, // Dynamic: 600k (New) or 100k (Legacy)
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false,
                ["encrypt", "decrypt"]
            );
        },

        // 2. Encrypt Data (High Level - Password Based)
        encryptData: async function (dataObj, password, iterations = 600000) {
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const key = await this.deriveKey(password, salt, iterations);
            return this.encryptWithKey(dataObj, key, salt);
        },

        // 3. Decrypt Data (High Level - Password Based)
        decryptData: async function (encryptedObj, password, iterations = 600000) {
            const { salt } = encryptedObj;
            const saltBytes = this.hexToBuf(salt);
            const key = await this.deriveKey(password, saltBytes, iterations);
            return this.decryptWithKey(encryptedObj, key);
        },

        // --- Low Level (Key Based) ---

        encryptWithKey: async function (dataObj, key, saltBytes) {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const enc = new TextEncoder();
            const encoded = enc.encode(JSON.stringify(dataObj));

            const ciphertext = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                encoded
            );

            return {
                salt: this.bufToHex(saltBytes), // Pass through salt for convenience
                iv: this.bufToHex(iv),
                data: this.bufToHex(ciphertext)
            };
        },

        decryptWithKey: async function (encryptedObj, key) {
            const { iv, data } = encryptedObj;
            const ivBytes = this.hexToBuf(iv);
            const dataBytes = this.hexToBuf(data);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: ivBytes },
                key,
                dataBytes
            );

            const dec = new TextDecoder();
            return JSON.parse(dec.decode(decrypted));
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
        }
    };
})(window.Homepage || (window.Homepage = {}));
