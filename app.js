// Начальные демо-данные, чтобы при первом открытии портфолио не было пустым
const defaultTasks = [
    { id: 1, title: "SaaS Landing Page Architecture", price: 450, priority: "High", tag: "Frontend", completed: true },
    { id: 2, title: "Stripe & Telegram Stars Integration", price: 300, priority: "High", tag: "API", completed: false },
    { id: 3, title: "Responsive Design System Tokens", price: 250, priority: "Medium", tag: "UI/UX", completed: false },
    { id: 4, title: "SEO & Core Web Vitals Optimization", price: 180, priority: "Low", tag: "Performance", completed: true }
];

let tasks = JSON.parse(localStorage.getItem('veloce_tasks')) || defaultTasks;
let currentFilter = 'all';

// DOM Elements
const taskListEl = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const priorityFilter = document.getElementById('priority-filter');
const modalOverlay = document.getElementById('modal-overlay');
const taskForm = document.getElementById('task-form');

// Сохранение в localStorage
function saveTasks() {
    localStorage.setItem('veloce_tasks', JSON.stringify(tasks));
}

// Обновление всех счетчиков и аналитики
function updateMetrics() {
    const totalCount = tasks.length;
    const completedTasks = tasks.filter(t => t.completed);
    const activeTasks = tasks.filter(t => !t.completed);

    document.getElementById('count-all').textContent = totalCount;
    document.getElementById('count-progress').textContent = activeTasks.length;
    document.getElementById('count-completed').textContent = completedTasks.length;

    const totalRevenue = tasks.reduce((sum, t) => sum + Number(t.price), 0);
    const pipelineRevenue = activeTasks.reduce((sum, t) => sum + Number(t.price), 0);
    const completionRate = totalCount ? Math.round((completedTasks.length / totalCount) * 100) : 0;
    const avgValue = totalCount ? Math.round(totalRevenue / totalCount) : 0;

    document.getElementById('total-budget').textContent = `$${totalRevenue.toLocaleString()}`;
    document.getElementById('budget-bar').style.width = `${completionRate}%`;
    document.getElementById('metric-pipeline').textContent = `$${pipelineRevenue.toLocaleString()}`;
    document.getElementById('metric-rate').textContent = `${completionRate}%`;
    document.getElementById('metric-avg').textContent = `$${avgValue.toLocaleString()}`;
}

// Отрисовка списка задач
function renderTasks() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedPriority = priorityFilter.value;

    const filtered = tasks.filter(task => {
        const matchesStatus =
            currentFilter === 'all' ||
            (currentFilter === 'completed' && task.completed) ||
            (currentFilter === 'in-progress' && !task.completed);

        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery) ||
            task.tag.toLowerCase().includes(searchQuery);

        const matchesPriority =
            selectedPriority === 'all' || task.priority === selectedPriority;

        return matchesStatus && matchesSearch && matchesPriority;
    });

    taskListEl.innerHTML = '';

    if (filtered.length === 0) {
        taskListEl.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 32px;">No deliverables match your current filters.</p>`;
        return;
    }

    filtered.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'done' : ''}`;
        item.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="task-title">${task.title}</span>
            </div>
            <div class="task-meta">
                <span class="tag">${task.tag}</span>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <span class="task-price">$${task.price}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">&times;</button>
            </div>
        `;
        taskListEl.appendChild(item);
    });

    updateMetrics();
}

// Действия с задачами
window.toggleTask = function(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks();
};

window.deleteTask = function(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
};

// Навигация по вкладкам
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Живой поиск и фильтр
searchInput.addEventListener('input', renderTasks);
priorityFilter.addEventListener('change', renderTasks);

// Управление модалкой
document.getElementById('open-modal-btn').addEventListener('click', () => modalOverlay.classList.add('open'));
document.getElementById('close-modal-btn').addEventListener('click', () => modalOverlay.classList.remove('open'));
document.getElementById('cancel-btn').addEventListener('click', () => modalOverlay.classList.remove('open'));

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        title: document.getElementById('task-title').value,
        price: Number(document.getElementById('task-price').value),
        priority: document.getElementById('task-priority').value,
        tag: document.getElementById('task-tag').value,
        completed: false
    };
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
    modalOverlay.classList.remove('open');
});

// Первый запуск
renderTasks();
