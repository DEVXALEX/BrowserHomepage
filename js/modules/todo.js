(function (app) {
    app.initTodo = function () {
        let todos = [];

        const todoToggleBtn = document.getElementById('todo-toggle-btn');
        const todoModal = document.getElementById('todo-modal');
        const closeTodoModal = document.getElementById('close-todo-modal');
        const todoList = document.getElementById('todo-list');
        const todoForm = document.getElementById('todo-form');
        const todoInput = document.getElementById('todo-input');

        function saveTodos() {
            app.Storage.set('homepageTodos', todos);
        }

        function loadTodos() {
            todos = app.Storage.get('homepageTodos', []);
        }

        function renderTodos() {
            todoList.innerHTML = '';
            if (todos.length === 0) {
                todoList.innerHTML = '<li class="empty-list-msg">No tasks yet.</li>';
                return;
            }

            todos.forEach(task => {
                const li = document.createElement('li');
                li.setAttribute('data-task-id', task.id);
                li.className = task.completed ? 'completed' : '';

                li.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="todo-text">${task.text}</span>
                    <button class="delete-todo-btn" title="Delete Task">
                        <i class="fa-solid fa-times"></i>
                    </button>
                `;
                todoList.appendChild(li);
            });
        }

        function addPendingTask(taskText) {
            const newTask = {
                id: app.generateId(),
                text: taskText,
                completed: false
            };
            todos.push(newTask);
            saveTodos();
            renderTodos();
        }

        function toggleTaskCompletion(taskId) {
            const task = todos.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                saveTodos();
                renderTodos();
            }
        }

        function deleteTask(taskId) {
            todos = todos.filter(t => t.id !== taskId);
            saveTodos();
            renderTodos();
        }

        // Modal logic removed - now integrated into Notes Modal
        // The renderTodos() is sufficient.

        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskText = todoInput.value.trim();
            if (taskText) {
                addPendingTask(taskText);
                todoInput.value = '';
            }
        });

        // Event Delegation
        todoList.addEventListener('click', (e) => {
            // Checkbox
            if (e.target.type === 'checkbox') {
                const li = e.target.closest('li');
                const taskId = parseInt(li.dataset.taskId);
                toggleTaskCompletion(taskId);
                return;
            }

            // Delete Button
            const deleteBtn = e.target.closest('.delete-todo-btn');
            if (deleteBtn) {
                const li = deleteBtn.closest('li');
                const taskId = parseInt(li.dataset.taskId);
                deleteTask(taskId);
                return;
            }

            // Text click (toggle)
            if (e.target.classList.contains('todo-text')) {
                const li = e.target.closest('li');
                const taskId = parseInt(li.dataset.taskId);
                toggleTaskCompletion(taskId);
            }
        });

        loadTodos();
    };
})(window.Homepage = window.Homepage || {});
