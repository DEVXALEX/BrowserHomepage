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
})(window.Homepage = window.Homepage || {});
