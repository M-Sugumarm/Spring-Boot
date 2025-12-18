// TodoList.js - Firebase Firestore version with enhanced features
import { db, collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from './firebase-config.js';

window.TodoApp = (function () {
    let todos = [];
    let filter = 'all';
    let priorityFilter = 'ALL';
    let categoryFilter = 'ALL';
    let searchQuery = '';

    // Category emoji map
    const categoryEmojis = {
        personal: '👤',
        work: '💼',
        shopping: '🛒',
        health: '💪',
        learning: '📚',
        other: '📌'
    };

    async function load(q = '') {
        searchQuery = q ? q.toLowerCase() : '';

        try {
            const todosCollection = collection(db, 'todos');
            const queryRef = query(todosCollection, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(queryRef);

            todos = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                todos.push({
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate() || null,
                    dueDate: data.dueDate || null
                });
            });

            render();
            updateStats();
        } catch (error) {
            console.error('Error loading todos:', error);
            showError('Failed to load tasks. Please check your connection.');
        }
    }

    function isOverdue(todo) {
        if (!todo.dueDate || todo.done) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(todo.dueDate);
        return due < today;
    }

    function render() {
        const container = document.getElementById('todoList');
        container.innerHTML = '';

        let list = todos
            .filter(t => {
                if (filter === 'active') return !t.done;
                if (filter === 'done') return t.done;
                if (filter === 'overdue') return isOverdue(t);
                return true;
            })
            .filter(t => priorityFilter === 'ALL' ? true : (t.priority === priorityFilter))
            .filter(t => categoryFilter === 'ALL' ? true : (t.category === categoryFilter));

        // Apply search filter
        if (searchQuery) {
            list = list.filter(t =>
                t.title.toLowerCase().includes(searchQuery) ||
                (t.description && t.description.toLowerCase().includes(searchQuery))
            );
        }

        // Update task count badge
        const badge = document.getElementById('taskCountBadge');
        if (badge) badge.textContent = list.length;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="card glass-card" style="text-align: center; padding: 60px 40px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">📭</div>
                    <p style="opacity: 0.6; margin: 0; font-size: 18px;">No tasks found</p>
                    <p style="opacity: 0.4; margin: 8px 0 0; font-size: 14px;">Add a new task above to get started!</p>
                </div>
            `;
        } else {
            list.forEach(t => {
                const el = document.createElement('div');
                const overdueClass = isOverdue(t) ? ' overdue' : '';
                el.className = `todo card glass-card priority-${t.priority || 'MEDIUM'}${t.done ? ' done' : ''}${overdueClass}`;

                // Build task badges
                let badges = '';
                badges += `<span class="priority-badge ${t.priority || 'MEDIUM'}">${t.priority || 'MEDIUM'}</span>`;
                if (t.category) {
                    badges += `<span class="task-tag category">${categoryEmojis[t.category] || '📌'} ${t.category}</span>`;
                }
                if (t.dueDate) {
                    const dueClass = isOverdue(t) ? ' overdue' : '';
                    badges += `<span class="task-tag due-date${dueClass}">📅 ${formatDueDate(t.dueDate)}</span>`;
                }
                if (t.estimatedMinutes) {
                    badges += `<span class="task-tag time-estimate">⏱️ ${formatTime(t.estimatedMinutes)}</span>`;
                }

                el.innerHTML = `
                    <div class="meta">
                        <h3>${escapeHtml(t.title)}</h3>
                        <div class="task-badges">${badges}</div>
                        <small>Created ${formatDate(t.createdAt)}</small>
                        ${t.description ? `<p>${escapeHtml(t.description)}</p>` : ''}
                        ${t.subtasks && t.subtasks.length > 0 ? `
                            <div class="subtask-progress">
                                <small>Subtasks: ${t.subtasks.filter(s => s.done).length}/${t.subtasks.length}</small>
                            </div>
                        ` : ''}
                    </div>
                    <div class="todo-actions">
                        <input type="checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''} title="Mark as ${t.done ? 'incomplete' : 'complete'}" />
                        <button data-subtask="${t.id}" class="subtask-btn">📋 Subtasks</button>
                        <button data-delete="${t.id}" class="delete-btn">🗑️ Delete</button>
                    </div>
                `;
                container.appendChild(el);
            });
        }

        bindEvents();
    }

    function updateStats() {
        const total = todos.length;
        const done = todos.filter(t => t.done).length;
        const active = todos.filter(t => !t.done).length;
        const overdue = todos.filter(t => isOverdue(t)).length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        // Update counts
        document.getElementById('totalCount').textContent = total;
        document.getElementById('doneCount').textContent = done;
        document.getElementById('activeCount').textContent = active;
        document.getElementById('overdueCount').textContent = overdue;

        // Update progress ring
        const circle = document.getElementById('progressCircle');
        const percentText = document.getElementById('progressPercent');
        if (circle && percentText) {
            const circumference = 314; // 2 * PI * 50
            const offset = circumference - (progress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            percentText.textContent = progress;
        }

        // Update time estimates
        const totalMinutes = todos.filter(t => !t.done).reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
        const timeElement = document.getElementById('totalTimeRemaining');
        if (timeElement) {
            timeElement.textContent = formatTime(totalMinutes);
        }

        // Completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedToday = todos.filter(t => {
            if (!t.completedAt) return false;
            const completed = new Date(t.completedAt);
            completed.setHours(0, 0, 0, 0);
            return completed.getTime() === today.getTime();
        }).length;

        const completedElement = document.getElementById('completedToday');
        if (completedElement) {
            completedElement.textContent = completedToday;
        }

        // Update streak (stored in localStorage for persistence)
        updateStreak();
    }

    function updateStreak() {
        const streakData = JSON.parse(localStorage.getItem('todoStreak') || '{"count": 0, "lastDate": null}');
        const today = new Date().toDateString();
        const completedToday = todos.filter(t => {
            if (!t.completedAt) return false;
            const completed = new Date(t.completedAt);
            return completed.toDateString() === today;
        }).length;

        if (completedToday > 0 && streakData.lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (streakData.lastDate === yesterday.toDateString() || !streakData.lastDate) {
                streakData.count++;
            } else {
                streakData.count = 1;
            }
            streakData.lastDate = today;
            localStorage.setItem('todoStreak', JSON.stringify(streakData));
        }

        const streakElement = document.getElementById('streakCount');
        if (streakElement) {
            streakElement.textContent = streakData.count;
        }

        // Update achievements
        updateAchievements(streakData.count);
    }

    function updateAchievements(streak) {
        const badges = document.querySelectorAll('.badge');
        const totalCompleted = todos.filter(t => t.done).length;

        badges.forEach((badge, index) => {
            let unlocked = false;
            switch (index) {
                case 0: unlocked = totalCompleted >= 1; break;
                case 1: unlocked = totalCompleted >= 10; break;
                case 2: unlocked = streak >= 7; break;
                case 3: unlocked = totalCompleted >= 100; break;
            }
            badge.classList.toggle('locked', !unlocked);
        });
    }

    function bindEvents() {
        // Toggle completion
        document.querySelectorAll('#todoList input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                try {
                    const todoRef = doc(db, 'todos', id);
                    const todo = todos.find(t => t.id === id);
                    const newDoneState = !todo.done;

                    await updateDoc(todoRef, {
                        done: newDoneState,
                        completedAt: newDoneState ? new Date() : null
                    });

                    // Celebration animation when completing a task
                    if (newDoneState) {
                        celebrate();
                    }

                    await load(searchQuery);
                } catch (error) {
                    console.error('Error toggling todo:', error);
                    showError('Failed to update task.');
                }
            });
        });

        // Delete
        document.querySelectorAll('#todoList [data-delete]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-delete');
                const todoEl = e.target.closest('.todo');
                todoEl.style.opacity = '0';
                todoEl.style.transform = 'translateX(100px)';

                setTimeout(async () => {
                    try {
                        await deleteDoc(doc(db, 'todos', id));
                        await load(searchQuery);
                    } catch (error) {
                        console.error('Error deleting todo:', error);
                        showError('Failed to delete task.');
                        todoEl.style.opacity = '1';
                        todoEl.style.transform = 'none';
                    }
                }, 300);
            });
        });

        // Subtasks modal
        document.querySelectorAll('#todoList [data-subtask]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-subtask');
                openSubtaskModal(id);
            });
        });
    }

    function openSubtaskModal(todoId) {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const modal = document.getElementById('subtaskModal');
        const parentInfo = document.getElementById('parentTaskInfo');
        const subtaskList = document.getElementById('subtaskList');

        parentInfo.innerHTML = `<strong>${escapeHtml(todo.title)}</strong>`;

        renderSubtasks(todoId, todo.subtasks || []);

        modal.classList.add('active');

        // Close modal
        modal.querySelector('.close-modal').onclick = () => modal.classList.remove('active');
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        };

        // Add subtask
        const addBtn = document.getElementById('addSubtaskBtn');
        const addInput = document.getElementById('subtaskInput');

        addBtn.onclick = async () => {
            const title = addInput.value.trim();
            if (!title) return;

            const subtasks = todo.subtasks || [];
            subtasks.push({ id: Date.now(), title, done: false });

            await updateDoc(doc(db, 'todos', todoId), { subtasks });
            addInput.value = '';
            todo.subtasks = subtasks;
            renderSubtasks(todoId, subtasks);
            await load(searchQuery);
        };
    }

    function renderSubtasks(todoId, subtasks) {
        const list = document.getElementById('subtaskList');
        list.innerHTML = subtasks.map(s => `
            <div class="subtask-item">
                <input type="checkbox" data-subtask-id="${s.id}" data-todo-id="${todoId}" ${s.done ? 'checked' : ''} />
                <span style="${s.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(s.title)}</span>
            </div>
        `).join('');

        // Bind subtask toggle
        list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', async (e) => {
                const subtaskId = parseInt(e.target.getAttribute('data-subtask-id'));
                const todoId = e.target.getAttribute('data-todo-id');
                const todo = todos.find(t => t.id === todoId);

                const subtask = todo.subtasks.find(s => s.id === subtaskId);
                if (subtask) {
                    subtask.done = !subtask.done;
                    await updateDoc(doc(db, 'todos', todoId), { subtasks: todo.subtasks });
                    renderSubtasks(todoId, todo.subtasks);
                    await load(searchQuery);
                }
            });
        });
    }

    function celebrate() {
        const container = document.getElementById('celebration');
        const colors = ['#6b46ff', '#5b8cff', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = dateString instanceof Date ? dateString : new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDueDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function formatTime(minutes) {
        if (!minutes) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    }

    function showError(message) {
        const container = document.getElementById('todoList');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'card error-message glass-card';
        errorDiv.style.cssText = 'background: rgba(239, 68, 68, 0.2); border-left: 4px solid #ef4444; margin-bottom: 16px;';
        errorDiv.innerHTML = `<p style="margin: 0; color: #ef4444;">⚠️ ${message}</p>`;
        container.insertBefore(errorDiv, container.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        load();

        // Search functionality
        const searchInput = document.getElementById('search');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => load(e.target.value), 300);
            });
        }

        // Filter tabs
        document.querySelectorAll('.tab').forEach(b => {
            b.addEventListener('click', (ev) => {
                document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
                ev.target.classList.add('active');
                filter = ev.target.dataset.filter;
                render();
            });
        });

        // Priority filter chips
        document.querySelectorAll('.chip[data-priority]').forEach(c => {
            c.addEventListener('click', (ev) => {
                document.querySelectorAll('.chip[data-priority]').forEach(x => x.classList.remove('active'));
                ev.target.classList.add('active');
                priorityFilter = ev.target.dataset.priority;
                render();
            });
        });

        // Category filter
        document.querySelectorAll('.category-chip[data-category]').forEach(c => {
            c.addEventListener('click', (ev) => {
                document.querySelectorAll('.category-chip').forEach(x => x.classList.remove('active'));
                ev.target.classList.add('active');
                categoryFilter = ev.target.dataset.category;
                render();
            });
        });

        // Dark mode toggle
        const dt = document.getElementById('darkToggle');
        if (dt) {
            dt.addEventListener('click', () => {
                document.body.classList.toggle('light');
                dt.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
            });
        }
    });

    return { reload: () => load(searchQuery) };
})();
