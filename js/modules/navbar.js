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
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'calendar':
                toggleCalendar();
                break;
            case 'todo':
                clickIfExists('todo-toggle-btn');
                break;
            case 'notes':
                clickIfExists('notes-toggle-btn');
                break;
            case 'bg':
                clickIfExists('bg-toggle-btn');
                break;
            case 'ambient':
                clickIfExists('ambient-toggle-btn');
                break;
            case 'settings':
                clickIfExists('settings-toggle-btn');
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
