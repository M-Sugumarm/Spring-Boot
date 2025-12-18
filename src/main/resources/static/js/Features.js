// Features.js - Pomodoro Timer and additional features

document.addEventListener('DOMContentLoaded', () => {
    // ===== POMODORO TIMER =====
    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let timerRunning = false;
    let selectedMinutes = 25;

    const timerDisplay = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('startTimer');
    const resetBtn = document.getElementById('resetTimer');
    const presetBtns = document.querySelectorAll('.preset-btn');

    function updateTimerDisplay() {
        const mins = Math.floor(timerSeconds / 60);
        const secs = timerSeconds % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (timerRunning) {
            // Pause
            clearInterval(timerInterval);
            timerRunning = false;
            startBtn.textContent = '▶ Resume';
            startBtn.classList.remove('running');
        } else {
            // Start
            timerRunning = true;
            startBtn.textContent = '⏸ Pause';
            startBtn.classList.add('running');

            timerInterval = setInterval(() => {
                timerSeconds--;
                updateTimerDisplay();

                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    startBtn.textContent = '▶ Start';
                    startBtn.classList.remove('running');

                    // Timer complete notification
                    showTimerComplete();
                    playNotificationSound();
                    timerSeconds = selectedMinutes * 60;
                    updateTimerDisplay();
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerSeconds = selectedMinutes * 60;
        updateTimerDisplay();
        startBtn.textContent = '▶ Start';
        startBtn.classList.remove('running');
    }

    function setPreset(minutes) {
        selectedMinutes = minutes;
        timerSeconds = minutes * 60;
        updateTimerDisplay();
        resetTimer();

        presetBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.preset-btn[data-minutes="${minutes}"]`)?.classList.add('active');
    }

    function showTimerComplete() {
        // Create notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #6b46ff, #5b8cff);
            color: white;
            padding: 40px 60px;
            border-radius: 24px;
            text-align: center;
            z-index: 10000;
            animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 20px 60px rgba(107, 70, 255, 0.5);
        `;
        notification.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 16px;">🍅</div>
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">Time's Up!</div>
            <div style="opacity: 0.8;">Great focus session! Take a break.</div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function playNotificationSound() {
        // Create a simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    // Bind timer events
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => setPreset(parseInt(btn.dataset.minutes)));
    });

    // Initialize timer display
    updateTimerDisplay();

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const addBtn = document.getElementById('addBtn');
            if (addBtn) addBtn.click();
        }

        // Escape to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('subtaskModal');
            if (modal) modal.classList.remove('active');
        }

        // Space to toggle timer (when not in input)
        if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            startTimer();
        }
    });

    // ===== ADD ANIMATION STYLES =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
        
        /* Tooltip styles */
        [title] {
            position: relative;
        }
        
        /* Focus visible styles */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);

    // ===== AUTO-SAVE INDICATOR =====
    let saveTimeout;
    function showSaveIndicator() {
        clearTimeout(saveTimeout);
        let indicator = document.getElementById('saveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'saveIndicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(16, 185, 129, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                z-index: 1000;
                animation: slideUp 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        indicator.textContent = '✓ Saved to cloud';
        indicator.style.display = 'block';

        saveTimeout = setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }

    // Expose save indicator globally
    window.showSaveIndicator = showSaveIndicator;

    // ===== STREAK NOTIFICATION =====
    function checkStreakMilestone() {
        const streakData = JSON.parse(localStorage.getItem('todoStreak') || '{"count": 0}');
        const milestones = [7, 14, 30, 50, 100];

        if (milestones.includes(streakData.count)) {
            const shownMilestones = JSON.parse(localStorage.getItem('shownMilestones') || '[]');
            if (!shownMilestones.includes(streakData.count)) {
                showMilestoneNotification(streakData.count);
                shownMilestones.push(streakData.count);
                localStorage.setItem('shownMilestones', JSON.stringify(shownMilestones));
            }
        }
    }

    function showMilestoneNotification(days) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            color: white;
            padding: 40px 60px;
            border-radius: 24px;
            text-align: center;
            z-index: 10000;
            animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 20px 60px rgba(255, 107, 107, 0.5);
        `;
        notification.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 16px;">🏆</div>
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">${days} Day Streak!</div>
            <div style="opacity: 0.9;">You're on fire! Keep it up!</div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Check for milestones on load
    setTimeout(checkStreakMilestone, 2000);

    // ===== REQUEST NOTIFICATION PERMISSION =====
    if ('Notification' in window && Notification.permission === 'default') {
        // Ask for notification permission after user interaction
        document.addEventListener('click', function askPermission() {
            Notification.requestPermission();
            document.removeEventListener('click', askPermission);
        }, { once: true });
    }

    console.log('🚀 MegTodo Features loaded!');
});
