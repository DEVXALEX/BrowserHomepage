(function (app) {
    app.initNavbar = function () {
        const navLinks = document.querySelectorAll('.nav-links li');

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const action = link.dataset.action;
                handleNavAction(action);
            });
        });
    };

    function handleNavAction(action) {
        // Map nav actions to existing sidebar buttons or functions
        switch (action) {
            case 'home':
                if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                    window.location.href = 'index.html';
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                break;
            case 'passwords':
                // Check if we are already on a passwords page (light or dark)
                // If not, go to default passwords page
                if (!window.location.pathname.includes('passwords')) {
                    window.location.href = 'passwords.html';
                }
                break;
            case 'calendar':
                toggleCalendar();
                break;
            case 'todo': // Fallthrough to notes
            case 'notes':
                // If we are on ANY passwords page, redirect to index with hash
                if (window.location.pathname.includes('passwords')) {
                    window.location.href = 'index.html#notes';
                }
                break;
            case 'bookmarks':
                if (window.location.pathname.includes('passwords')) {
                    window.location.href = 'index.html#bookmarks';
                }
                break;
            case 'bg':
                clickIfExists('bg-toggle-btn');
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    function clickIfExists(id) {
        const el = document.getElementById(id);
        if (el) el.click();
    }

    function toggleCalendar() {
        const modal = document.getElementById('calendar-modal');
        if (modal) {
            modal.style.visibility = 'visible'; // Ensure visibility for transition
            modal.classList.add('visible');
        }
    }

})(window.Homepage = window.Homepage || {});
