document.addEventListener('DOMContentLoaded', () => {
    const app = window.Homepage;
    if (app) {
        if (app.initClock) app.initClock();
        if (app.initQuote) app.initQuote();
        if (app.initLinks) app.initLinks();
        if (app.initBookmarks) app.initBookmarks();
        if (app.initSearch) app.initSearch();
        if (app.initNotes) app.initNotes();
        if (app.initTodo) app.initTodo();

        // Namespace Pattern Modules
        if (app.initBackground) app.initBackground();
        if (app.initAmbient) app.initAmbient();
        if (app.initCalculator) app.initCalculator();
        if (app.initSidebar) app.initSidebar();
        if (app.initNavbar) app.initNavbar();
        if (app.initCalendar) app.initCalendar();
        if (app.initSettings) app.initSettings();
        if (app.githubSync && app.githubSync.init) app.githubSync.init(); // Initialize Cloud Sync
        if (app.Locker && app.Locker.init) app.Locker.init(); // Initialize Secure Locker
    } else {
        console.error("Homepage app not initialized. Check script loading order.");
    }
});
