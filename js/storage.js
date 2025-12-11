(function (app) {
    app.Storage = {
        get: function (key, defaultValue) {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        },

        set: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new Event('homepage-data-changed'));
        },

        getString: function (key, defaultValue) {
            return localStorage.getItem(key) || defaultValue;
        },

        setString: function (key, value) {
            localStorage.setItem(key, value);
            window.dispatchEvent(new Event('homepage-data-changed'));
        }
    };
})(window.Homepage = window.Homepage || {});
