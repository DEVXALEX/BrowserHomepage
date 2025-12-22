(function (app) {
    app.getFaviconURL = function (url) {
        let domain;
        try {
            domain = new URL(url).hostname;
        } catch (e) {
            domain = url;
        }
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    };

    app.ensureProtocol = function (url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    };

    app.generateId = function () {
        return Date.now();
    };

    app.debounce = function (func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    };

    // Simple Toast Notification
    app.Toast = {
        show: function (message, type = 'info', x = null, y = null) {
            console.log(`[Toast ${type.toUpperCase()}]: ${message}`);

            const toast = document.createElement('div');
            toast.textContent = message;

            if (x !== null && y !== null) {
                // FLOATING TOAST (At Cursor)
                toast.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y + 40}px;
                    background: ${type === 'success' ? '#2ea44f' : type === 'error' ? '#ff4d4d' : '#333'};
                    color: white; padding: 8px 16px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    font-family: inherit; font-size: 0.85rem; opacity: 0; transform: translateY(10px); transition: all 0.2s ease;
                    z-index: 10000; pointer-events: none;
                `;
                document.body.appendChild(toast);
            } else {
                // STANDARD TOAST (Bottom Right)
                let container = document.getElementById('toast-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'toast-container';
                    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
                    document.body.appendChild(container);
                }

                toast.style.cssText = `
                    background: ${type === 'success' ? '#2ea44f' : type === 'error' ? '#ff4d4d' : '#333'};
                    color: white; padding: 12px 24px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    font-family: inherit; font-size: 0.9rem; opacity: 0; transform: translateY(20px); transition: all 0.3s ease;
                `;
                container.appendChild(toast);
            }

            // Animate In
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            });

            // Remove after duration
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                setTimeout(() => toast.remove(), 300);
            }, 1000); // Snappy 1s duration
        }
    };
})(window.Homepage = window.Homepage || {});
