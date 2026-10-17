const storageKey = 'small-wins-tasks';
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const progressCount = document.querySelector('#progress-count');
const progressBar = document.querySelector('#progress-bar');
const remainingCount = document.querySelector('#remaining-count');
const clearCompletedButton = document.querySelector('#clear-completed');

let tasks = loadTasks();

document.querySelector('#today').textContent = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
}).format(new Date());

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ id: crypto.randomUUID(), text, done: false });
  taskInput.value = '';
  saveAndRender();
  taskInput.focus();
});

taskList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const task = tasks.find((item) => item.id === button.dataset.id);
  if (!task) return;

  if (button.dataset.action === 'toggle') task.done = !task.done;
  if (button.dataset.action === 'delete') tasks = tasks.filter((item) => item.id !== task.id);
  saveAndRender();
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.done);
  saveAndRender();
});

function loadTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(storedTasks)
      ? storedTasks.filter((task) => task && typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean')
      : [];
  } catch {
    return [];
  }
}

function saveAndRender() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
  render();
}

function render() {
  taskList.replaceChildren();
  emptyState.hidden = tasks.length > 0;

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' is-done' : ''}`;

    const toggle = document.createElement('button');
    toggle.className = 'task-toggle';
    toggle.type = 'button';
    toggle.dataset.action = 'toggle';
    toggle.dataset.id = task.id;
    toggle.setAttribute('aria-pressed', String(task.done));
    toggle.setAttribute('aria-label', `${task.done ? 'Mark incomplete' : 'Complete'}: ${task.text}`);

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.dataset.id = task.id;
    remove.setAttribute('aria-label', `Delete: ${task.text}`);
    remove.title = 'Delete task';
    remove.textContent = '×';

    item.append(toggle, text, remove);
    taskList.append(item);
  }

  const completed = tasks.filter((task) => task.done).length;
  const remaining = tasks.length - completed;
  progressCount.textContent = `${completed} / ${tasks.length}`;
  progressBar.style.width = `${tasks.length ? (completed / tasks.length) * 100 : 0}%`;
  remainingCount.textContent = remaining ? `${remaining} left to do` : tasks.length ? 'All done. Nice work.' : 'A fresh page.';
  clearCompletedButton.disabled = completed === 0;
}

render();