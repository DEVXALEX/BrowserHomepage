# Browser Homepage

A sophisticated, locally-hosted web application designed to replace the standard browser new tab page. It serves as a personalized productivity dashboard, combining aesthetic elegance with functional utility.

## Features

- **Productivity**: Centralize daily tasks, notes, and navigation.
- **Privacy**: Local-only data storage with optional encryption.
- **Customization**: Interactive clock, backgrounds, and links.
- **Widgets**: Calculator, Notes, To-Do, Calendar.
- **Zero-Dependency**: Built with Vanilla HTML, CSS, and JavaScript.

## Tech Stack

This project is built with a **Vanilla Web Stack** (No Frameworks), designed for performance, security, and simplicity.

- **Frontend**: HTML5, CSS3 (Custom & Modular), JavaScript (ES6+ Modules).
- **Security**: Web Crypto API (Native PBKDF2 & AES-GCM for strong client-side encryption).
- **Storage**: LocalStorage (Persisted client-side data).
- **Cloud Sync**: GitHub Gist API (Secure JSON datastore).
- **Architecture**: Modular IIFE Pattern (Namespaced to `window.Homepage`).
- **External Libraries**:
    - [Font Awesome 6](https://fontawesome.com/) (Icons)
    - [Google Fonts](https://fonts.google.com/) (Outfit typeface)
    - [DiceBear API](https://www.dicebear.com/) (Identicons)

## Getting Started

Since this is a static site, you can simply open `index.html` in your browser.
