const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskCategory = document.getElementById('taskCategory');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const emptyState = document.getElementById('emptyState');
const currentDateEl = document.getElementById('currentDate');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const progressBarFill = document.getElementById('progressBarFill');
const taskProgressText = document.getElementById('taskProgressText');
const navButtons = document.querySelectorAll('.nav-btn');

// Estado da aplicação
let tasks = JSON.parse(localStorage.getItem('taskhub_tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

// Exibir data atual formatada
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
currentDateEl.textContent = new Date().toLocaleDateString('pt-BR', options);

// Salvar no LocalStorage e Renderizar
function saveAndRender() {
    localStorage.setItem('taskhub_tasks', JSON.stringify(tasks));
    renderTasks();
    updateStats();
}

// Adicionar Tarefa
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        category: taskCategory.value,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    saveAndRender();
});

// Renderizar Tarefas na Tela
function renderTasks() {
    taskList.innerHTML = '';

    // Filtragem por categoria e busca
    let filteredTasks = tasks.filter(task => {
        const matchesCategory = currentFilter === 'all' || task.category === currentFilter;
        const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
                <span>${escapeHTML(task.text)}</span>
                <span class="badge">${task.category}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})" title="Excluir">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        taskList.appendChild(li);
    });
}

// Alternar status da tarefa (Concluída / Pendente)
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

// Deletar tarefa individual
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// Limpar todas as tarefas concluídas
clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveAndRender();
});

// Atualizar barra de progresso e estatísticas
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    progressBarFill.style.width = `${percentage}%`;
    taskProgressText.textContent = `${completed} de ${total} concluídas (${percentage}%)`;
}

// Filtros da barra lateral
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

// Barra de pesquisa em tempo real
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

// Sistema de Tema (Modo Escuro / Claro)
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('taskhub_theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span>Modo Escuro</span>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('taskhub_theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Modo Claro</span>';
    }
});

// Carregar tema salvo ao abrir
const savedTheme = localStorage.getItem('taskhub_theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Modo Claro</span>';
}

// Segurança básica contra XSS ao inserir texto
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Inicialização
renderTasks();
updateStats();