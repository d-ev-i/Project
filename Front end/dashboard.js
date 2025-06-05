document.addEventListener('DOMContentLoaded', function() {
    // User Management
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        name: 'Guest',
        email: 'guest@example.com',
        avatar: '',
        tasks: [],
        schedule: [],
        recurringEvents: [],
        preferences: {
            workHours: { start: '09:00', end: '17:00' },
            breakFrequency: '60',
            pomodoroLength: '25',
            theme: 'system',
            aiProactivity: 'medium',
            notifications: 'daily'
        },
        stats: {
            focusSessions: { today: 0, week: 0 },
            tasksCompleted: { today: 0, week: 0 }
        }
    };

    // Initialize UI with user data
    function initializeUserUI() {
        // Set user profile
        const avatarFallback = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('userProfile').innerHTML = `
            <div class="user-avatar" style="background-color: ${stringToColor(currentUser.name)}">
                ${currentUser.avatar ? `<img src="${currentUser.avatar}" alt="${currentUser.name}">` : avatarFallback}
            </div>
            <div class="user-info">
                <span class="username">${currentUser.name}</span>
                <span class="user-email">${currentUser.email}</span>
            </div>
            <i class="fas fa-chevron-down"></i>
        `;

        // Set greeting based on time of day
        const hour = new Date().getHours();
        let greeting;
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        document.getElementById('greeting').textContent = `${greeting}, ${currentUser.name.split(' ')[0]}`;

        // Set current date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);

        // Load user preferences
        loadUserPreferences();
    }

    // Helper function to generate color from string
    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 60%)`;
    }

    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            contentSections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(`${section}-section`).classList.add('active');
            
            // Load section-specific data
            switch(section) {
                case 'dashboard':
                    loadDashboardData();
                    break;
                case 'schedule':
                    loadScheduleData();
                    break;
                case 'tasks':
                    loadTasksData();
                    break;
                case 'analytics':
                    loadAnalyticsData();
                    break;
                case 'settings':
                    loadSettingsData();
                    break;
            }
        });
    });

    // Load user preferences into settings form
    function loadUserPreferences() {
        const prefs = currentUser.preferences;
        
        // Work hours
        document.getElementById('workStart').value = prefs.workHours.start;
        document.getElementById('workEnd').value = prefs.workHours.end;
        
        // Other preferences
        document.getElementById('breakFrequency').value = prefs.breakFrequency;
        document.getElementById('pomodoroLength').value = prefs.pomodoroLength;
        document.getElementById('aiProactivity').value = prefs.aiProactivity;
        document.getElementById('notificationFrequency').value = prefs.notifications;
        
        // Theme
        document.querySelector(`input[name="theme"][value="${prefs.theme}"]`).checked = true;
        applyTheme(prefs.theme);
    }

    // Apply theme
    function applyTheme(theme) {
        if (theme === 'system') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
    }

    // Theme toggle
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', function() {
            currentUser.preferences.theme = this.value;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            applyTheme(this.value);
        });
    });

    // Save profile changes
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        currentUser.name = document.getElementById('userName').value;
        currentUser.email = document.getElementById('userEmail').value;
        
        const avatarFile = document.getElementById('userAvatar').files[0];
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentUser.avatar = e.target.result;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                initializeUserUI();
            };
            reader.readAsDataURL(avatarFile);
        } else {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            initializeUserUI();
        }
        
        alert('Profile updated successfully!');
    });

    // Save preferences
    document.getElementById('preferencesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        currentUser.preferences = {
            workHours: {
                start: document.getElementById('workStart').value,
                end: document.getElementById('workEnd').value
            },
            breakFrequency: document.getElementById('breakFrequency').value,
            pomodoroLength: document.getElementById('pomodoroLength').value,
            theme: currentUser.preferences.theme, // Theme is saved immediately when changed
            aiProactivity: document.getElementById('aiProactivity').value,
            notifications: document.getElementById('notificationFrequency').value
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('Preferences saved successfully!');
    });

    // Save AI settings
    document.getElementById('aiSettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        currentUser.preferences.aiProactivity = document.getElementById('aiProactivity').value;
        currentUser.preferences.notifications = document.getElementById('notificationFrequency').value;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('AI settings saved successfully!');
    });

    // Dashboard Functions
    function loadDashboardData() {
        updateTodaySchedule();
        updateProductivityStats();
        updateMotivationalQuote();
        updateProgressWheel();
        generateAISuggestion();
    }

    function updateTodaySchedule() {
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = currentUser.schedule.filter(event => 
            event.date === today
        ).sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        const scheduleContainer = document.getElementById('todaySchedule');
        scheduleContainer.innerHTML = '';
        
        if (todayEvents.length === 0) {
            scheduleContainer.innerHTML = '<p class="empty-state">No events scheduled for today</p>';
            return;
        }
        
        todayEvents.slice(0, 5).forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'schedule-item';
            eventElement.innerHTML = `
                <div class="time">${formatTime(event.startTime)}</div>
                <div class="title">${event.title}</div>
                <div class="actions">
                    <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                </div>
            `;
            scheduleContainer.appendChild(eventElement);
        });
    }

    function updateProductivityStats() {
        document.getElementById('todayTasks').textContent = currentUser.stats.tasksCompleted.today;
        document.getElementById('weekTasks').textContent = currentUser.stats.tasksCompleted.week;
        document.getElementById('focusTime').textContent = `${Math.floor(currentUser.stats.focusSessions.today * 25 / 60)}h`;
    }

    function updateMotivationalQuote() {
        const quotes = [
            {
                text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
                author: "Paul J. Meyer"
            },
            {
                text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
                author: "Stephen Covey"
            },
            {
                text: "You don't have to see the whole staircase, just take the first step.",
                author: "Martin Luther King Jr."
            }
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('motivationalQuote').innerHTML = `
            <p>"${randomQuote.text}"</p>
            <div class="author">— ${randomQuote.author}</div>
        `;
    }

    function updateProgressWheel() {
        const totalTasks = currentUser.tasks.length;
        const completedTasks = currentUser.tasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        document.getElementById('progressText').textContent = `${progress}% Done`;
        
        const ctx = document.getElementById('progressChart').getContext('2d');
        if (window.progressChart) {
            window.progressChart.destroy();
        }
        
        window.progressChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [completedTasks, totalTasks - completedTasks],
                    backgroundColor: [
                        '#10B981',
                        '#E2E8F0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function generateAISuggestion() {
        const now = new Date();
        const currentHour = now.getHours();
        const suggestions = [
            {
                title: "Focus Block Available",
                message: `You seem free between ${currentHour + 1}:00-${currentHour + 2}:00. Want to schedule a focus session?`,
                action: "Schedule Focus"
            },
            {
                title: "Break Reminder",
                message: "You've been working for 90 minutes straight. Consider taking a 10-minute break.",
                action: "Start Break Timer"
            },
            {
                title: "Task Prioritization",
                message: "You have 3 high-priority tasks due today. Would you like to optimize your schedule?",
                action: "Optimize Now"
            }
        ];
        
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        document.getElementById('aiSuggestion').innerHTML = `
            <h4><i class="fas fa-lightbulb"></i> ${randomSuggestion.title}</h4>
            <p>${randomSuggestion.message}</p>
            <div class="ai-suggestion-actions">
                <button class="btn small">${randomSuggestion.action}</button>
                <button class="btn small secondary">Dismiss</button>
            </div>
        `;
    }

    // Quick Add Task
    document.getElementById('quickAddForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('quickTaskInput').value;
        const category = document.getElementById('taskCategory').value;
        
        const newTask = {
            id: Date.now(),
            title: title,
            category: category,
            dueDate: '',
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        currentUser.tasks.push(newTask);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        document.getElementById('quickTaskInput').value = '';
        updateProgressWheel();
        updateProductivityStats();
        
        alert('Task added successfully!');
    });

    // Schedule Functions
    function loadScheduleData() {
        renderCalendar('day');
        updateRecurringEvents();
    }

    function renderCalendar(view) {
        const calendarContainer = document.getElementById('calendarView');
        calendarContainer.innerHTML = `
            <div class="calendar-header">
                <button class="btn-icon" id="prevWeek"><i class="fas fa-chevron-left"></i></button>
                <h4 id="calendarTitle">${getCalendarTitle(view)}</h4>
                <button class="btn-icon" id="nextWeek"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
        `;
        
        // Render calendar based on view
        if (view === 'day') {
            renderDayView();
        } else if (view === 'week') {
            renderWeekView();
        } else {
            renderMonthView();
        }
    }

    function renderDayView() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = `
            <div class="time-column">
                ${generateTimeSlots()}
            </div>
            <div class="events-column">
                ${generateDayEvents()}
            </div>
        `;
    }

    function generateTimeSlots() {
        let slots = '';
        for (let hour = 8; hour <= 20; hour++) {
            slots += `<div class="time-slot">${hour}:00</div>`;
        }
        return slots;
    }

    function generateDayEvents() {
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = currentUser.schedule.filter(event => event.date === today);
        
        let eventsHTML = '';
        todayEvents.forEach(event => {
            eventsHTML += `
                <div class="calendar-event" style="top: ${calculateEventPosition(event.startTime)}px; height: ${calculateEventDuration(event.startTime, event.endTime)}px">
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">${formatTime(event.startTime)} - ${formatTime(event.endTime)}</div>
                </div>
            `;
        });
        
        return eventsHTML;
    }

    function calculateEventPosition(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours - 8) * 60 + minutes;
    }

    function calculateEventDuration(startTime, endTime) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        return (endH - startH) * 60 + (endM - startM);
    }

    function updateRecurringEvents() {
        const container = document.getElementById('recurringEvents');
        container.innerHTML = '';
        
        if (currentUser.recurringEvents.length === 0) {
            container.innerHTML = '<p class="empty-state">No recurring events</p>';
            return;
        }
        
        currentUser.recurringEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'recurring-event';
            eventElement.innerHTML = `
                <div class="details">
                    <div class="title">${event.title}</div>
                    <div class="frequency">${formatRecurrence(event.recurrence)}</div>
                </div>
                <div class="actions">
                    <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                </div>
            `;
            container.appendChild(eventElement);
        });
    }

    function formatRecurrence(recurrence) {
        switch(recurrence.type) {
            case 'daily':
                return 'Daily';
            case 'weekly':
                return `Weekly on ${recurrence.days.join(', ')}`;
            case 'monthly':
                return `Monthly on day ${recurrence.day}`;
            default:
                return recurrence.type;
        }
    }

    // Tasks Functions
    function loadTasksData() {
        updateTaskLists();
        initializePomodoroTimer();
    }

    function updateTaskLists() {
        updateTaskList('work', currentUser.tasks.filter(task => task.category === 'work'));
        updateTaskList('personal', currentUser.tasks.filter(task => task.category === 'personal'));
        updateTaskList('urgent', currentUser.tasks.filter(task => task.priority === 'high'));
    }

    function updateTaskList(category, tasks) {
        const container = document.getElementById(`${category}Tasks`);
        container.innerHTML = '';
        
        if (tasks.length === 0) {
            container.innerHTML = '<li class="empty-task">No tasks in this category</li>';
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}">
                </div>
                <div class="task-title">${task.title}</div>
                ${task.dueDate ? `<div class="due-date">${formatDate(task.dueDate)}</div>` : ''}
                <div class="priority ${task.priority}"></div>
                <div class="task-actions">
                    <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                </div>
            `;
            container.appendChild(taskElement);
        });
        
        // Add event listeners to checkboxes
        document.querySelectorAll(`#${category}Tasks .checkbox input`).forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = parseInt(this.getAttribute('data-task-id'));
                const task = currentUser.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = this.checked;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    // Update stats
                    if (this.checked) {
                        currentUser.stats.tasksCompleted.today++;
                        currentUser.stats.tasksCompleted.week++;
                    } else {
                        currentUser.stats.tasksCompleted.today--;
                        currentUser.stats.tasksCompleted.week--;
                    }
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    updateProgressWheel();
                    updateProductivityStats();
                }
            });
        });
    }

    function initializePomodoroTimer() {
        const timerDisplay = document.querySelector('#pomodoroTimer .timer-display');
        const startButton = document.getElementById('startPomodoroBtn');
        const resetButton = document.getElementById('resetPomodoroBtn');
        
        let timerInterval;
        let secondsLeft = parseInt(currentUser.preferences.pomodoroLength) * 60;
        
        updateTimerDisplay();
        
        startButton.addEventListener('click', function() {
            if (!timerInterval) {
                timerInterval = setInterval(() => {
                    secondsLeft--;
                    updateTimerDisplay();
                    
                    if (secondsLeft <= 0) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                        alert('Pomodoro session complete! Take a 5-minute break.');
                        
                        // Update stats
                        currentUser.stats.focusSessions.today++;
                        currentUser.stats.focusSessions.week++;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        document.getElementById('todaySessions').textContent = currentUser.stats.focusSessions.today;
                        document.getElementById('weekSessions').textContent = currentUser.stats.focusSessions.week;
                        updateProductivityStats();
                    }
                }, 1000);
                
                startButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                startButton.innerHTML = '<i class="fas fa-play"></i> Start Focus';
            }
        });
        
        resetButton.addEventListener('click', function() {
            clearInterval(timerInterval);
            timerInterval = null;
            secondsLeft = parseInt(currentUser.preferences.pomodoroLength) * 60;
            updateTimerDisplay();
            startButton.innerHTML = '<i class="fas fa-play"></i> Start Focus';
        });
        
        function updateTimerDisplay() {
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }

    // Analytics Functions
    function loadAnalyticsData() {
        renderTimeDistributionChart();
        renderFocusHeatmap();
        updateProductivityScore();
        generateAIInsights();
        renderComparisonChart();
    }

    function renderTimeDistributionChart() {
        const ctx = document.getElementById('timeDistributionChart').getContext('2d');
        
        if (window.timeDistributionChart) {
            window.timeDistributionChart.destroy();
        }
        
        window.timeDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Work', 'Meetings', 'Break', 'Learning', 'Other'],
                datasets: [{
                    data: [35, 15, 10, 5, 5],
                    backgroundColor: [
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B',
                        '#8B5CF6',
                        '#64748B'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    function renderFocusHeatmap() {
        const ctx = document.getElementById('focusHeatmap').getContext('2d');
        
        if (window.focusHeatmap) {
            window.focusHeatmap.destroy();
        }
        
        // Sample data for heatmap
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Focus Time',
                data: [
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                ].map((day, dayIndex) => 
                    day.map(hour => 
                        Math.floor(Math.random() * 5) * (dayIndex < 5 ? 1 : 0.5) // Less focus on weekends
                    )
                ),
                borderWidth: 1
            }]
        };
        
        window.focusHeatmap = new Chart(ctx, {
            type: 'matrix',
            data: data,
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return `${data.labels[context[0].row]}, ${context[0].column}:00`;
                            },
                            label: function(context) {
                                const value = context.raw;
                                return `Focus level: ${value}/5`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'HH:mm'
                            }
                        },
                        offset: true,
                        ticks: {
                            stepSize: 2
                        }
                    },
                    y: {
                        type: 'category',
                        labels: data.labels
                    }
                }
            }
        });
    }

    function updateProductivityScore() {
        // Calculate a simple productivity score (0-100)
        const totalTasks = currentUser.tasks.length;
        const completedTasks = currentUser.tasks.filter(task => task.completed).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        // Factor in focus sessions
        const focusScore = Math.min(currentUser.stats.focusSessions.week * 5, 30);
        
        // Final score
        const score = Math.min(Math.round(completionRate * 0.7 + focusScore), 100);
        
        document.getElementById('productivityScore').textContent = score;
        
        // Comparison text
        const lastWeekScore = Math.max(0, score - 5 + Math.floor(Math.random() * 10));
        const difference = score - lastWeekScore;
        
        let comparisonText;
        if (difference > 0) {
            comparisonText = `↑ ${difference}% from last week`;
        } else if (difference < 0) {
            comparisonText = `↓ ${Math.abs(difference)}% from last week`;
        } else {
            comparisonText = '→ Same as last week';
        }
        
        document.getElementById('scoreComparisonText').textContent = comparisonText;
    }

    function generateAIInsights() {
        const insights = [
            {
                title: "Peak Productivity Hours",
                message: "You're most productive between 10AM-12PM. Try scheduling your most important tasks during this time.",
                action: "Optimize Schedule"
            },
            {
                title: "Task Completion Trend",
                message: "You complete 30% more tasks on Tuesdays and Wednesdays compared to other weekdays.",
                action: "View Details"
            },
            {
                title: "Break Frequency",
                message: "Taking regular breaks improves your focus. Consider setting a timer for every 50 minutes of work.",
                action: "Set Reminder"
            }
        ];
        
        const container = document.getElementById('aiInsights');
        container.innerHTML = '';
        
        insights.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = 'ai-insight';
            insightElement.innerHTML = `
                <h4><i class="fas fa-lightbulb"></i> ${insight.title}</h4>
                <p>${insight.message}</p>
                <div class="ai-insight-actions">
                    <button class="btn small">${insight.action}</button>
                    <button class="btn small secondary">Dismiss</button>
                </div>
            `;
            container.appendChild(insightElement);
        });
    }

    function renderComparisonChart() {
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        const metric = document.getElementById('comparisonMetric').value;
        
        if (window.comparisonChart) {
            window.comparisonChart.destroy();
        }
        
        let labels, thisWeekData, lastWeekData;
        
        if (metric === 'tasks') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            thisWeekData = [3, 5, 7, 4, 6, 2, 1];
            lastWeekData = [2, 4, 5, 3, 5, 1, 0];
        } else if (metric === 'focus') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            thisWeekData = [2, 3, 4, 2, 3, 1, 0];
            lastWeekData = [1, 2, 3, 2, 2, 0, 0];
        } else {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            thisWeekData = [70, 80, 85, 75, 82, 60, 40];
            lastWeekData = [65, 75, 80, 70, 78, 55, 35];
        }
        
        window.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'This Week',
                        data: thisWeekData,
                        backgroundColor: '#3B82F6'
                    },
                    {
                        label: 'Last Week',
                        data: lastWeekData,
                        backgroundColor: '#E2E8F0'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: metric === 'productivity' ? 100 : Math.max(...thisWeekData, ...lastWeekData) + 2
                    }
                }
            }
        });
        
        // Update chart when metric changes
        document.getElementById('comparisonMetric').addEventListener('change', renderComparisonChart);
    }

    // Helper functions
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function getCalendarTitle(view) {
        const now = new Date();
        
        if (view === 'day') {
            return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        } else if (view === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else {
            return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    }

    // Initialize the dashboard
    initializeUserUI();
    loadDashboardData();

    // Set dashboard as active by default
    document.querySelector('.nav-links li[data-section="dashboard"]').classList.add('active');
    document.getElementById('dashboard-section').classList.add('active');
});