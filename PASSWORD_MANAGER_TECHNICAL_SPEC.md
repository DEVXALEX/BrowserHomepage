# Password Manager Technical Specification

## 1. Overview
The Password Manager is a secure, client-side encrypted vault integrated into the Browser Homepage. It adheres to a **Zero-Knowledge Architecture**, meaning the encryption keys and decrypted data exist *only* in the browser's volatile memory (RAM) and are never stored on disk or sent unencrypted to the integration server (GitHub).

## 2. Security Architecture

### 2.1 Encryption Standards
We utilize the **Web Crypto API** (SubtleCrypto) provided natively by modern browsers for all cryptographic operations. No third-party crypto libraries are used, reducing supply chain attack vectors.

*   **Algorithm:** `AES-GCM` (Advanced Encryption Standard in Galois/Counter Mode)
*   **Key Length:** 256-bit
*   **IV (Initialization Vector):** 12 bytes (96 bits), randomly generated for *every* save operation to prevent replay attacks.
*   **Key Derivation:** `PBKDF2` (Password-Based Key Derivation Function 2)
    *   **Hash:** SHA-256
    *   **Iterations:** 100,000 (Industry standard minimum)
    *   **Salt:** 16 bytes, random per user.

### 2.2 The "Zero-Knowledge" Lifecycle
1.  **Unlock:**
    *   User enters **Master PIN**.
    *   System fetches the unique **Salt** from the encrypted file.
    *   **Key Derivation:** `PIN` + `Salt` -> `Master Key` (DerivedKey).
    *   **Decryption:** `Master Key` + `IV` + `Ciphertext` -> `Decrypted Data`.
    *   The `Master Key` and `Decrypted Data` are held in a global JavaScript variable (*transient memory*).
2.  **Usage:**
    *   The UI reads from this memory variable to display passwords.
3.  **Lock/Close:**
    *   When the "Lock" button is clicked or the tab is closed, the variables holding the `Master Key` and `Decrypted Data` are explicitly set to `null`.
    *   Since `localStorage` is never used for secrets, clearing the browser cache or stealing `localStorage` data yields only encrypted blobs.

### 2.3 Token Security (GitHub Sync)
The components use a **GitHub Personal Access Token** to sync data. This token itself is a sensitive secret.
*   **Storage:** The token is **not** stored as plain text.
*   **Protection:** The token is encrypted using the user's PIN (similar to the vault) before being saved to `localStorage`.
*   **Session Unlock:** On browser restart, the user must enter their PIN to "unlock the session," which decrypts the GitHub Token into memory to allow API calls.

## 3. Data Storage & Isolation

### 3.1 Separation of Concerns
The application maintains two distinct storage channels within the same GitHub Gist to prevent data leaks.

| Data Type | Filename | Encryption | Content |
| :--- | :--- | :--- | :--- |
| **Dashboard Data** | `dashboard_backup.json` | None (Plain JSON) | Backgrounds, Bookmarks, Notes, To-Dos (Non-sensitive) |
| **Password Vault** | `locker.enc` | **AES-256-GCM** | Encrypted JSON string containing all passwords |

### 3.2 Data Structure (`locker.enc`)
The `locker.enc` file stored on GitHub is a JSON object containing the cryptographic parameters needed to decrypt the blob (except the PIN).

```json
{
  "salt": "a1b2c3d4...",   // Hex string (Public)
  "iv": "9x8y7z...",       // Hex string (Public, unique per save)
  "data": "f1e2d3..."      // The actual AES-encrypted ciphertext
}
```

## 4. Sync Protocol (GitHub API)

### 4.1 Fetching (Unlock)
1.  **GET** `https://api.github.com/gists/{gist_id}`
2.  Parse `files['locker.enc'].content`.
3.  Extract `salt`, `iv`, and `data`.
4.  Perform client-side decryption using the User's PIN.

### 4.2 Saving (Sync)
1.  User modifies a password.
2.  **Client-Side:**
    *   Generate new random `IV`.
    *   Encrypt the updated JSON object using the cached `Master Key`.
3.  **API Request:**
    *   **PATCH** `https://api.github.com/gists/{gist_id}`
    *   Payload:
        ```json
        {
          "files": {
            "locker.enc": { "content": "{ \"salt\": \"...\", \"iv\": \"...\", \"data\": \"...\" }" }
          }
        }
        ```
    *   *Note:* The `dashboard_backup.json` file is **not** touched during this operation, preserving bandwidth and preventing race conditions with general settings.

## 5. Code Module Interactions

*   **`locker.js` (The Core):**
    *   Contains the `app.Crypto` calls.
    *   Manages the "Auth View" (PIN Input) vs "List View".
    *   Holds the `masterKey` variable.
*   **`githubSync.js` (The Transport):**
    *   Manages the GitHub Token.
    *   Handles finding/creating the Gist.
    *   Provides the transport layer for fetching `locker.enc`.
*   **`passwordManager.js` (The UI):**
    *   The "Frontend" for the vault.
    *   It does **not** handle encryption.
    *   It requests data by calling `app.Locker.open()`.
    *   It implements the **Masking Logic** (10-dot mask) to prevent shoulder-surfing.
