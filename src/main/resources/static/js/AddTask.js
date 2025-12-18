// AddTask.js - Firebase Firestore version with enhanced features
import { db, collection, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const input = document.getElementById('taskInput');
    const description = document.getElementById('taskDescription');
    const priority = document.getElementById('prioritySelect');
    const category = document.getElementById('categorySelect');
    const dueDate = document.getElementById('dueDateInput');
    const estimatedTime = document.getElementById('estimatedTime');

    if (!addBtn || !input) return;

    // Set default due date to today
    if (dueDate) {
        const today = new Date().toISOString().split('T')[0];
        dueDate.min = today;
    }

    // Add task on button click
    addBtn.addEventListener('click', addTask);

    // Add task on Enter key (but not in textarea)
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    async function addTask() {
        const title = input.value.trim();

        if (!title) {
            input.classList.add('shake');
            input.focus();
            return;
        }

        // Disable button while submitting
        addBtn.disabled = true;
        addBtn.innerHTML = '<span class="loading-spinner"></span> Adding...';

        try {
            const newTodo = {
                title: title,
                description: description?.value.trim() || '',
                priority: priority?.value || 'MEDIUM',
                category: category?.value || 'personal',
                dueDate: dueDate?.value || null,
                estimatedMinutes: parseInt(estimatedTime?.value) || 60,
                done: false,
                createdAt: new Date(),
                completedAt: null,
                subtasks: [],
                tags: []
            };

            await addDoc(collection(db, 'todos'), newTodo);

            // Clear form
            input.value = '';
            if (description) description.value = '';
            if (dueDate) dueDate.value = '';
            if (priority) priority.value = 'MEDIUM';
            if (category) category.value = 'personal';
            if (estimatedTime) estimatedTime.value = '60';

            // Show success animation
            showSuccessToast('Task added successfully! 🎉');

            // Reload the todo list
            if (window.TodoApp && window.TodoApp.reload) {
                window.TodoApp.reload();
            }
        } catch (error) {
            console.error('Error adding task:', error);
            input.classList.add('shake');
            showErrorToast('Failed to add task. Please try again.');
        } finally {
            addBtn.disabled = false;
            addBtn.innerHTML = '+ Add Task';
        }
    }

    function showSuccessToast(message) {
        showToast(message, 'success');
    }

    function showErrorToast(message) {
        showToast(message, 'error');
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 1000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            font-weight: 500;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ${type === 'success'
                ? 'background: linear-gradient(135deg, #10b981, #059669); color: white;'
                : 'background: linear-gradient(135deg, #ef4444, #dc2626); color: white;'}
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    // Add CSS for toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-10px); }
        }
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Remove shake animation after it completes
    input.addEventListener('animationend', () => {
        input.classList.remove('shake');
    });
});
