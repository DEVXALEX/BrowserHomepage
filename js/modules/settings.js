(function (app) {
    app.initSettings = function () {
        const settingsModal = document.getElementById('settings-modal');
        const settingsToggleBtn = document.getElementById('settings-toggle-btn');
        const closeSettingsModal = document.getElementById('close-settings-modal');
        const exportDataBtn = document.getElementById('export-data-btn');
        const importDataBtn = document.getElementById('import-data-btn');
        const importFileInput = document.getElementById('import-file-input');

        // Custom Confirm Modal Elements
        const confirmModal = document.getElementById('confirm-modal');
        const confirmTitle = document.getElementById('confirm-title');
        const confirmMessage = document.getElementById('confirm-message');
        const confirmOkBtn = document.getElementById('confirm-ok-btn');
        const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

        function showSettingsModal() {
            settingsModal.classList.add('visible');
        }
        function hideSettingsModal() {
            settingsModal.classList.remove('visible');
        }

        function showConfirm(title, message, onConfirm) {
            if (!confirmModal) {
                if (confirm(message)) onConfirm();
                return;
            }

            confirmTitle.textContent = title;
            confirmMessage.textContent = message;
            confirmModal.classList.add('visible');

            const cleanup = () => {
                confirmModal.classList.remove('visible');
                confirmOkBtn.onclick = null;
                confirmCancelBtn.onclick = null;
            };

            confirmOkBtn.onclick = () => {
                cleanup();
                onConfirm();
            };

            confirmCancelBtn.onclick = () => {
                cleanup();
            };

            // Close on backdrop click
            confirmModal.onclick = (e) => {
                if (e.target === confirmModal) cleanup();
            }
        }

        if (settingsToggleBtn) settingsToggleBtn.addEventListener('click', showSettingsModal);
        if (closeSettingsModal) closeSettingsModal.addEventListener('click', hideSettingsModal);

        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) hideSettingsModal();
            });
        }

        // --- Export ---
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                const exportData = {
                    homepageData: app.Storage.get('homepageData', []),
                    homepageBookmarks: app.Storage.get('homepageBookmarks', []),
                    homepageMultiNotes: app.Storage.get('homepageMultiNotes', []),
                    homepageTodos: app.Storage.get('homepageTodos', []),
                    calendarNotes: app.Storage.get('calendarNotes', {}), // Added Calendar Notes
                    homepageBg: app.Storage.getString('homepageBg', ''),
                    iconOnlyMode: app.Storage.getString('iconOnlyMode') === 'true',
                    searchMode: app.Storage.getString('searchMode', 'google'),
                    exportDate: new Date().toISOString()
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "dashboard_backup_" + new Date().toISOString().slice(0, 10) + ".json");
                document.body.appendChild(downloadAnchorNode); // required for firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            });
        }

        // --- Import ---
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                showConfirm(
                    'Overwrite Data?',
                    'WARNING: This will overwrite all your current dashboard data (links, notes, settings). Are you sure you want to proceed?',
                    () => {
                        importFileInput.value = ''; // Reset to ensure change event fires
                        importFileInput.click();
                    }
                );
            });
        }

        if (importFileInput) {
            importFileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);

                        // Basic validation
                        if (!importedData.homepageData && !importedData.homepageBookmarks) {
                            throw new Error("Invalid backup file format.");
                        }

                        // Restore Data
                        if (importedData.homepageData) app.Storage.set('homepageData', importedData.homepageData);
                        if (importedData.homepageBookmarks) app.Storage.set('homepageBookmarks', importedData.homepageBookmarks);
                        if (importedData.homepageMultiNotes) app.Storage.set('homepageMultiNotes', importedData.homepageMultiNotes);
                        if (importedData.homepageTodos) app.Storage.set('homepageTodos', importedData.homepageTodos);
                        if (importedData.calendarNotes) app.Storage.set('calendarNotes', importedData.calendarNotes); // Restore Calendar Notes
                        if (importedData.homepageBg !== undefined) app.Storage.setString('homepageBg', importedData.homepageBg);
                        if (importedData.iconOnlyMode !== undefined) app.Storage.setString('iconOnlyMode', importedData.iconOnlyMode);
                        if (importedData.searchMode) app.Storage.setString('searchMode', importedData.searchMode);

                        alert('Data imported successfully! The page will now reload.');
                        location.reload();

                    } catch (err) {
                        console.error(err);
                        alert('Error importing data: ' + err.message);
                    }
                };
                reader.readAsText(file);
            });
        }
    };
})(window.Homepage = window.Homepage || {});
