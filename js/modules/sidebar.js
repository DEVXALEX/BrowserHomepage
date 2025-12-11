(function (app) {
    app.initSidebar = function () {
        const sidebarToggleBtn = document.getElementById('sidebar-toggle');
        const icon = sidebarToggleBtn ? sidebarToggleBtn.querySelector('i') : null;

        // Load State
        const isCollapsed = app.Storage.getString('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
            if (icon) icon.className = 'fa-solid fa-chevron-left';
        }

        if (sidebarToggleBtn) {
            sidebarToggleBtn.addEventListener('click', () => {
                const collapsed = document.body.classList.toggle('sidebar-collapsed');
                app.Storage.setString('sidebarCollapsed', collapsed);

                if (icon) {
                    icon.className = collapsed ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right';
                }
            });
        }
    };
})(window.Homepage = window.Homepage || {});
