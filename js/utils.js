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
})(window.Homepage = window.Homepage || {});
