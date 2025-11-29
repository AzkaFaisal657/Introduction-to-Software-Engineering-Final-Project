/* =====================================================
   AMAL-NAMA - Main Application Module
   Handles routing, authentication, and UI rendering
   ===================================================== */

const App = {
    currentPage: 'login',
    currentUser: null,
    charts: {},

    // Initialize application
    init() {
        Utils.toast.init();
        Utils.modal.init();
        
        this.bindEvents();
        this.checkAuth();
    },

    // Check if user is already logged in
    checkAuth() {
        const user = DataManager.session.getCurrentUser();
        if (user) {
            this.currentUser = user;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    },

    // Event Bindings
    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Password toggle
        document.querySelector('.password-toggle').addEventListener('click', () => {
            const input = document.getElementById('login-password');
            const eyeOpen = document.querySelector('.eye-open');
            const eyeClosed = document.querySelector('.eye-closed');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
            } else {
                input.type = 'password';
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
            }
        });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            this.handleLogout();
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Notification panel
        document.getElementById('notification-btn').addEventListener('click', () => {
            this.toggleNotificationPanel(true);
        });

        document.getElementById('close-notifications').addEventListener('click', () => {
            this.toggleNotificationPanel(false);
        });

        document.getElementById('notification-overlay').addEventListener('click', () => {
            this.toggleNotificationPanel(false);
        });

        document.getElementById('mark-all-read').addEventListener('click', () => {
            DataManager.notifications.markAllAsRead(this.currentUser.id);
            this.updateNotificationBadge();
            this.renderNotifications();
            Utils.toast.success('Success', 'All notifications marked as read');
        });

        // Credential quick-fill
        document.querySelectorAll('.credential-item').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                const id = item.querySelector('.id').textContent;
                const pass = item.querySelector('.pass').textContent;
                document.getElementById('login-id').value = id;
                document.getElementById('login-password').value = pass;
            });
        });

        // Global search
        document.getElementById('global-search').addEventListener('input', 
            Utils.debounce((e) => this.handleSearch(e.target.value), 300)
        );

        // Profile menu
        document.getElementById('header-user').addEventListener('click', () => {
            this.navigateTo('profile');
        });
    },

    // Login handler
    handleLogin() {
        const id = document.getElementById('login-id').value.trim();
        const password = document.getElementById('login-password').value;

        if (!id || !password) {
            Utils.toast.error('Error', 'Please enter both ID and password');
            return;
        }

        const user = DataManager.users.authenticate(id, password);
        
        if (user) {
            DataManager.session.login(user);
            this.currentUser = user;
            Utils.toast.success('Welcome!', `Logged in as ${user.name}`);
            this.showDashboard();
        } else {
            Utils.toast.error('Login Failed', 'Invalid ID or password');
        }
    },

    // Logout handler
    handleLogout() {
        Utils.modal.confirm(
            'Logout',
            'Are you sure you want to logout?',
            () => {
                DataManager.session.logout();
                this.currentUser = null;
                Utils.toast.info('Logged Out', 'You have been logged out successfully');
                this.showLogin();
            },
            'Logout',
            'btn-danger'
        );
    },

    // Page Management
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    },

    showLogin() {
        this.showPage('login-page');
        document.getElementById('login-id').value = '';
        document.getElementById('login-password').value = '';
    },

    showDashboard() {
        this.showPage('dashboard-page');
        this.setupDashboard();
    },

    // Dashboard Setup
    setupDashboard() {
        const user = this.currentUser;
        
        // Update sidebar
        document.getElementById('sidebar-role').textContent = this.capitalizeFirst(user.role) + ' Portal';
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-id').textContent = 'ID: ' + user.id;
        document.getElementById('user-avatar').textContent = Utils.getInitials(user.name);
        
        // Update header
        document.getElementById('header-name').textContent = user.name.split(' ')[0];
        document.getElementById('header-avatar').textContent = Utils.getInitials(user.name);
        
        // Setup navigation based on role
        this.setupNavigation();
        
        // Update notifications
        this.updateNotificationBadge();
        
        // Load initial view
        this.navigateTo('dashboard');
    },

    setupNavigation() {
        const navContainer = document.getElementById('sidebar-nav');
        let navHtml = '';
        
        const navItems = this.getNavItems();
        
        navItems.forEach(section => {
            navHtml += `
                <div class="nav-section">
                    <div class="nav-section-title">${section.title}</div>
            `;
            
            section.items.forEach(item => {
                const badge = item.badge ? `<span class="badge">${item.badge}</span>` : '';
                navHtml += `
                    <div class="nav-item" data-page="${item.page}" data-testid="nav-${item.page}">
                        ${item.icon}
                        <span>${item.label}</span>
                        ${badge}
                    </div>
                `;
            });
            
            navHtml += '</div>';
        });
        
        navContainer.innerHTML = navHtml;
        
        // Bind navigation clicks
        navContainer.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateTo(item.dataset.page);
                // Close mobile menu
                document.getElementById('sidebar').classList.remove('open');
            });
        });
    },

    getNavItems() {
        const role = this.currentUser.role;
        
        const commonItems = [
            {
                title: 'Main',
                items: [
                    { page: 'dashboard', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' }
                ]
            }
        ];
        
        if (role === 'student') {
            return [
                ...commonItems,
                {
                    title: 'Academic',
                    items: [
                        { page: 'my-attendance', label: 'My Attendance', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
                        { page: 'my-results', label: 'My Results', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>' },
                        { page: 'my-courses', label: 'My Courses', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' }
                    ]
                },
                {
                    title: 'Account',
                    items: [
                        { page: 'notifications', label: 'Notifications', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>', badge: DataManager.notifications.getUnreadCount(this.currentUser.id) || null },
                        { page: 'profile', label: 'Profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
                    ]
                }
            ];
        } else if (role === 'teacher') {
            return [
                ...commonItems,
                {
                    title: 'Teaching',
                    items: [
                        { page: 'mark-attendance', label: 'Mark Attendance', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>' },
                        { page: 'enter-grades', label: 'Enter Grades', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' },
                        { page: 'my-courses', label: 'My Courses', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
                        { page: 'at-risk-students', label: 'At-Risk Students', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' }
                    ]
                },
                {
                    title: 'Reports',
                    items: [
                        { page: 'attendance-reports', label: 'Attendance Reports', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' },
                        { page: 'grade-reports', label: 'Grade Reports', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' }
                    ]
                },
                {
                    title: 'Account',
                    items: [
                        { page: 'notifications', label: 'Notifications', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>', badge: DataManager.notifications.getUnreadCount(this.currentUser.id) || null },
                        { page: 'profile', label: 'Profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
                    ]
                }
            ];
        } else { // admin
            return [
                ...commonItems,
                {
                    title: 'Management',
                    items: [
                        { page: 'manage-users', label: 'Manage Users', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' },
                        { page: 'manage-courses', label: 'Manage Courses', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
                        { page: 'enrollments', label: 'Enrollments', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' }
                    ]
                },
                {
                    title: 'Analytics',
                    items: [
                        { page: 'system-stats', label: 'System Statistics', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
                        { page: 'audit-log', label: 'Audit Log', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>' },
                        { page: 'policy-violations', label: 'Policy Violations', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' }
                    ]
                },
                {
                    title: 'Account',
                    items: [
                        { page: 'notifications', label: 'Notifications', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>', badge: DataManager.notifications.getUnreadCount(this.currentUser.id) || null },
                        { page: 'profile', label: 'Profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' }
                    ]
                }
            ];
        }
    },

    navigateTo(page) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
        
        // Render page content
        const contentArea = document.getElementById('content-area');
        
        switch(page) {
            case 'dashboard':
                this.renderDashboard(contentArea);
                break;
            case 'my-attendance':
                this.renderMyAttendance(contentArea);
                break;
            case 'my-results':
                this.renderMyResults(contentArea);
                break;
            case 'my-courses':
                this.renderMyCourses(contentArea);
                break;
            case 'mark-attendance':
                this.renderMarkAttendance(contentArea);
                break;
            case 'enter-grades':
                this.renderEnterGrades(contentArea);
                break;
            case 'at-risk-students':
                this.renderAtRiskStudents(contentArea);
                break;
            case 'attendance-reports':
                this.renderAttendanceReports(contentArea);
                break;
            case 'grade-reports':
                this.renderGradeReports(contentArea);
                break;
            case 'manage-users':
                this.renderManageUsers(contentArea);
                break;
            case 'manage-courses':
                this.renderManageCourses(contentArea);
                break;
            case 'enrollments':
                this.renderEnrollments(contentArea);
                break;
            case 'system-stats':
                this.renderSystemStats(contentArea);
                break;
            case 'audit-log':
                this.renderAuditLog(contentArea);
                break;
            case 'policy-violations':
                this.renderPolicyViolations(contentArea);
                break;
            case 'notifications':
                this.renderNotificationsPage(contentArea);
                break;
            case 'profile':
                this.renderProfile(contentArea);
                break;
            default:
                contentArea.innerHTML = '<div class="empty-state"><h3>Page Not Found</h3></div>';
        }
        
        // Update page title
        const pageTitle = this.capitalizeFirst(page.replace(/-/g, ' '));
        document.getElementById('page-title').textContent = pageTitle;
        document.getElementById('page-subtitle').textContent = this.getPageSubtitle(page);
    },

    getPageSubtitle(page) {
        const subtitles = {
            'dashboard': `Welcome back, ${this.currentUser.name.split(' ')[0]}`,
            'my-attendance': 'Track your class attendance',
            'my-results': 'View your grades and performance',
            'my-courses': 'Your enrolled courses',
            'mark-attendance': 'Mark student attendance',
            'enter-grades': 'Enter and manage grades',
            'at-risk-students': 'Students needing attention',
            'attendance-reports': 'Generate attendance reports',
            'grade-reports': 'Generate grade reports',
            'manage-users': 'Add, edit, or remove users',
            'manage-courses': 'Manage course offerings',
            'enrollments': 'Manage student enrollments',
            'system-stats': 'System overview and metrics',
            'audit-log': 'Track system activities',
            'policy-violations': 'Review policy issues',
            'notifications': 'Your notifications',
            'profile': 'Your account settings'
        };
        return subtitles[page] || '';
    },

    // Dashboard Renderers
    renderDashboard(container) {
        const role = this.currentUser.role;
        
        if (role === 'student') {
            this.renderStudentDashboard(container);
        } else if (role === 'teacher') {
            this.renderTeacherDashboard(container);
        } else {
            this.renderAdminDashboard(container);
        }
    },

    renderStudentDashboard(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByStudent(user.id);
        const overallAttendance = DataManager.attendance.getStats(user.id);
        const cgpa = DataManager.grades.calculateCGPA(user.id);
        const notifications = DataManager.notifications.getByUser(user.id);
        const unreadCount = notifications.filter(n => !n.read).length;
        
        const attendanceClass = Utils.getAttendanceClass(overallAttendance.percentage);
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon ${attendanceClass === 'high' ? 'green' : attendanceClass === 'medium' ? 'orange' : 'red'}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Overall Attendance</div>
                        <div class="stat-value">${overallAttendance.percentage}%</div>
                        ${overallAttendance.percentage < 85 ? '<div class="stat-change negative">Below required 85%</div>' : '<div class="stat-change positive">Good standing</div>'}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Current CGPA</div>
                        <div class="stat-value">${cgpa}</div>
                        <div class="stat-change positive">Out of 4.0</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Enrolled Courses</div>
                        <div class="stat-value">${courses.length}</div>
                        <div class="stat-change">This semester</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon ${unreadCount > 0 ? 'orange' : 'green'}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Notifications</div>
                        <div class="stat-value">${unreadCount}</div>
                        <div class="stat-change">${unreadCount > 0 ? 'Unread alerts' : 'All caught up'}</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Attendance Trend</div>
                            <div class="card-subtitle">Last 30 days</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="attendance-chart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Course Performance</div>
                            <div class="card-subtitle">Current grades by course</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="performance-chart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Course Overview</div>
                            <div class="card-subtitle">Your enrolled courses with attendance and grades</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Instructor</th>
                                        <th>Attendance</th>
                                        <th>Current Grade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${courses.map(course => {
                                        const attendance = DataManager.attendance.calculatePercentage(user.id, course.id);
                                        const gradePercent = DataManager.grades.calculateCourseTotal(user.id, course.id);
                                        const letterGrade = DataManager.grades.calculateLetterGrade(gradePercent);
                                        const attClass = Utils.getAttendanceClass(attendance);
                                        const gradeClass = Utils.getGradeClass(letterGrade);
                                        
                                        return `
                                            <tr>
                                                <td>
                                                    <strong>${course.name}</strong>
                                                    <div class="text-muted" style="font-size: 12px;">${course.code}</div>
                                                </td>
                                                <td>${course.teacherName}</td>
                                                <td>
                                                    <div class="attendance-percent">
                                                        <div class="percent-bar">
                                                            <div class="percent-fill ${attClass}" style="width: ${attendance}%"></div>
                                                        </div>
                                                        <span class="percent-text ${attClass}">${attendance}%</span>
                                                    </div>
                                                </td>
                                                <td><span class="grade-badge ${gradeClass}">${letterGrade}</span></td>
                                                <td><span class="status-badge ${attendance >= 85 ? 'present' : 'absent'}">${attendance >= 85 ? 'On Track' : 'At Risk'}</span></td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Recent Notifications</div>
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('notifications')" data-testid="button-view-all-notifications">View All</button>
                    </div>
                    <div class="card-body">
                        ${notifications.slice(0, 5).length > 0 ? notifications.slice(0, 5).map(n => `
                            <div class="notification-item ${n.read ? '' : 'unread'}">
                                <div class="notification-icon ${n.type}">
                                    ${this.getNotificationIcon(n.type)}
                                </div>
                                <div class="notification-content">
                                    <div class="notification-title">${n.title}</div>
                                    <div class="notification-text">${n.message}</div>
                                    <div class="notification-time">${DataManager.getRelativeTime(n.createdAt)}</div>
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state"><p class="text-muted">No notifications</p></div>'}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Alerts & Warnings</div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${courses.filter(c => DataManager.attendance.calculatePercentage(user.id, c.id) < 90).map(course => {
                            const att = DataManager.attendance.calculatePercentage(user.id, course.id);
                            return `
                                <div class="alert ${att < 85 ? 'danger' : 'warning'}">
                                    <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    <div class="alert-content">
                                        <div class="alert-title">${course.code}: ${att}% Attendance</div>
                                        <div class="alert-text">${att < 85 ? 'Critical! Below minimum requirement.' : 'Warning: Approaching minimum threshold.'}</div>
                                    </div>
                                </div>
                            `;
                        }).join('') || '<div class="alert success"><svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg><div class="alert-content"><div class="alert-title">All Good!</div><div class="alert-text">Your attendance is above threshold in all courses.</div></div></div>'}
                    </div>
                </div>
            </div>
        `;

        // Create attendance trend chart
        setTimeout(() => {
            const attendanceData = this.getAttendanceTrendData(user.id, 30);
            this.charts.attendance = Utils.charts.createLineChart('attendance-chart', 
                attendanceData.labels,
                [{
                    label: 'Attendance %',
                    data: attendanceData.data,
                    borderColor: 'rgba(159, 122, 234, 1)',
                    backgroundColor: 'rgba(159, 122, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            );

            // Create performance chart
            const perfLabels = courses.map(c => c.code);
            const perfData = courses.map(c => DataManager.grades.calculateCourseTotal(user.id, c.id));
            this.charts.performance = Utils.charts.createBarChart('performance-chart',
                perfLabels,
                [{
                    label: 'Grade %',
                    data: perfData,
                    backgroundColor: 'rgba(91, 54, 152, 0.8)',
                    borderRadius: 4
                }]
            );
        }, 100);
    },

    renderTeacherDashboard(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByTeacher(user.id);
        const totalStudents = courses.reduce((sum, c) => sum + c.students.length, 0);
        
        // Calculate at-risk students
        const atRiskStudents = [];
        courses.forEach(course => {
            course.students.forEach(studentId => {
                const attendance = DataManager.attendance.calculatePercentage(studentId, course.id);
                if (attendance < 85) {
                    const student = DataManager.users.getById(studentId);
                    if (student && !atRiskStudents.find(s => s.id === studentId)) {
                        atRiskStudents.push({ ...student, attendance, course: course.code });
                    }
                }
            });
        });

        const notifications = DataManager.notifications.getByUser(user.id);
        const unreadCount = notifications.filter(n => !n.read).length;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">My Courses</div>
                        <div class="stat-value">${courses.length}</div>
                        <div class="stat-change">Active this semester</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Total Students</div>
                        <div class="stat-value">${totalStudents}</div>
                        <div class="stat-change">Across all courses</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon ${atRiskStudents.length > 0 ? 'red' : 'green'}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">At-Risk Students</div>
                        <div class="stat-value">${atRiskStudents.length}</div>
                        <div class="stat-change ${atRiskStudents.length > 0 ? 'negative' : 'positive'}">${atRiskStudents.length > 0 ? 'Need attention' : 'All students on track'}</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon ${unreadCount > 0 ? 'orange' : 'green'}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Notifications</div>
                        <div class="stat-value">${unreadCount}</div>
                        <div class="stat-change">${unreadCount > 0 ? 'Unread alerts' : 'All caught up'}</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Quick Actions</div>
                            <div class="card-subtitle">Common tasks</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="btn-group flex-wrap gap-8">
                            <button class="btn btn-primary" onclick="App.navigateTo('mark-attendance')" data-testid="button-quick-attendance">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                                Mark Attendance
                            </button>
                            <button class="btn btn-primary" onclick="App.navigateTo('enter-grades')" data-testid="button-quick-grades">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Enter Grades
                            </button>
                            <button class="btn btn-secondary" onclick="App.navigateTo('attendance-reports')" data-testid="button-quick-reports">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Course Overview</div>
                            <div class="card-subtitle">Your assigned courses</div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${courses.map(course => {
                            const avgAttendance = course.students.length > 0 
                                ? Math.round(course.students.reduce((sum, sid) => sum + DataManager.attendance.calculatePercentage(sid, course.id), 0) / course.students.length)
                                : 100;
                            const attClass = Utils.getAttendanceClass(avgAttendance);
                            
                            return `
                                <div class="list-item" style="background: var(--gray-800); padding: 16px; border-radius: var(--border-radius); margin-bottom: 12px;">
                                    <div>
                                        <strong>${course.name}</strong>
                                        <div class="text-muted" style="font-size: 12px;">${course.code} | ${course.students.length} students</div>
                                    </div>
                                    <div class="attendance-percent">
                                        <div class="percent-bar">
                                            <div class="percent-fill ${attClass}" style="width: ${avgAttendance}%"></div>
                                        </div>
                                        <span class="percent-text ${attClass}">${avgAttendance}%</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">At-Risk Students</div>
                            <div class="card-subtitle">Attendance below 85%</div>
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('at-risk-students')" data-testid="button-view-all-atrisk">View All</button>
                    </div>
                    <div class="card-body">
                        ${atRiskStudents.slice(0, 5).length > 0 ? atRiskStudents.slice(0, 5).map(student => `
                            <div class="list-item" style="background: rgba(239, 68, 68, 0.05); padding: 12px; border-radius: var(--border-radius); margin-bottom: 8px; border-left: 3px solid var(--danger-500);">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="user-avatar" style="width: 36px; height: 36px; font-size: 12px;">${Utils.getInitials(student.name)}</div>
                                    <div>
                                        <strong>${student.name}</strong>
                                        <div class="text-muted" style="font-size: 12px;">${student.id} | ${student.course}</div>
                                    </div>
                                </div>
                                <span class="percent-text low">${student.attendance}%</span>
                            </div>
                        `).join('') : '<div class="empty-state"><p class="text-muted">No at-risk students</p></div>'}
                    </div>
                </div>

                <div class="card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Class Performance Distribution</div>
                            <div class="card-subtitle">Grade distribution across courses</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="chart-container" style="height: 300px;">
                            <canvas id="grade-distribution-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create grade distribution chart
        setTimeout(() => {
            const gradeDistribution = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
            courses.forEach(course => {
                course.students.forEach(studentId => {
                    const percent = DataManager.grades.calculateCourseTotal(studentId, course.id);
                    const grade = DataManager.grades.calculateLetterGrade(percent);
                    if (grade.startsWith('A')) gradeDistribution['A']++;
                    else if (grade.startsWith('B')) gradeDistribution['B']++;
                    else if (grade.startsWith('C')) gradeDistribution['C']++;
                    else if (grade === 'D') gradeDistribution['D']++;
                    else gradeDistribution['F']++;
                });
            });

            this.charts.gradeDistribution = Utils.charts.createDoughnutChart('grade-distribution-chart',
                Object.keys(gradeDistribution),
                Object.values(gradeDistribution),
                {
                    colors: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }
            );
        }, 100);
    },

    renderAdminDashboard(container) {
        const allUsers = DataManager.users.getAll();
        const allCourses = DataManager.courses.getAll();
        const allStudents = allUsers.filter(u => u.role === 'student');
        const allTeachers = allUsers.filter(u => u.role === 'teacher');
        
        // Calculate average attendance across all students
        let totalAttendance = 0;
        let studentCount = 0;
        allStudents.forEach(student => {
            const att = DataManager.attendance.getStats(student.id);
            if (att.total > 0) {
                totalAttendance += att.percentage;
                studentCount++;
            }
        });
        const avgAttendance = studentCount > 0 ? Math.round(totalAttendance / studentCount) : 100;

        // Get policy violations (students below 80%)
        const violations = [];
        allStudents.forEach(student => {
            const courses = DataManager.courses.getByStudent(student.id);
            courses.forEach(course => {
                const att = DataManager.attendance.calculatePercentage(student.id, course.id);
                if (att < 80) {
                    violations.push({
                        student,
                        course,
                        attendance: att
                    });
                }
            });
        });

        const auditLogs = DataManager.auditLog.getAll();
        const flaggedLogs = auditLogs.filter(l => l.flagged);

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Total Students</div>
                        <div class="stat-value">${allStudents.length}</div>
                        <div class="stat-change">Registered in system</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Total Teachers</div>
                        <div class="stat-value">${allTeachers.length}</div>
                        <div class="stat-change">Active faculty</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Active Courses</div>
                        <div class="stat-value">${allCourses.length}</div>
                        <div class="stat-change">This semester</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon ${avgAttendance >= 85 ? 'green' : 'orange'}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Avg Attendance</div>
                        <div class="stat-value">${avgAttendance}%</div>
                        <div class="stat-change ${avgAttendance >= 85 ? 'positive' : 'negative'}">${avgAttendance >= 85 ? 'Above threshold' : 'Below target'}</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Quick Actions</div>
                            <div class="card-subtitle">Administrative tasks</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="btn-group flex-wrap gap-8">
                            <button class="btn btn-primary" onclick="App.openAddUserModal()" data-testid="button-add-user">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                Add User
                            </button>
                            <button class="btn btn-primary" onclick="App.openAddCourseModal()" data-testid="button-add-course">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                                Add Course
                            </button>
                            <button class="btn btn-secondary" onclick="App.navigateTo('audit-log')" data-testid="button-view-audit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                View Audit Log
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Policy Violations</div>
                            <div class="card-subtitle">Students below 80% attendance</div>
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('policy-violations')" data-testid="button-view-violations">View All</button>
                    </div>
                    <div class="card-body">
                        ${violations.slice(0, 5).length > 0 ? violations.slice(0, 5).map(v => `
                            <div class="alert danger mb-8">
                                <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                                <div class="alert-content">
                                    <div class="alert-title">${v.student.name} (${v.student.id})</div>
                                    <div class="alert-text">${v.course.code}: ${v.attendance}% attendance</div>
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state"><p class="text-muted">No policy violations</p></div>'}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Flagged Activities</div>
                            <div class="card-subtitle">Suspicious system activities</div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${flaggedLogs.slice(0, 5).length > 0 ? flaggedLogs.slice(0, 5).map(log => `
                            <div class="alert warning mb-8">
                                <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                                <div class="alert-content">
                                    <div class="alert-title">${log.action.replace(/_/g, ' ')}</div>
                                    <div class="alert-text">${log.details} - ${DataManager.getRelativeTime(log.timestamp)}</div>
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state"><p class="text-muted">No flagged activities</p></div>'}
                    </div>
                </div>

                <div class="card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Attendance Distribution by Course</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="chart-container" style="height: 300px;">
                            <canvas id="course-attendance-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create course attendance chart
        setTimeout(() => {
            const courseLabels = allCourses.map(c => c.code);
            const courseAttendance = allCourses.map(course => {
                if (course.students.length === 0) return 100;
                const total = course.students.reduce((sum, sid) => 
                    sum + DataManager.attendance.calculatePercentage(sid, course.id), 0);
                return Math.round(total / course.students.length);
            });

            this.charts.courseAttendance = Utils.charts.createBarChart('course-attendance-chart',
                courseLabels,
                [{
                    label: 'Average Attendance %',
                    data: courseAttendance,
                    backgroundColor: courseAttendance.map(att => 
                        att >= 90 ? 'rgba(16, 185, 129, 0.8)' :
                        att >= 85 ? 'rgba(59, 130, 246, 0.8)' :
                        att >= 80 ? 'rgba(245, 158, 11, 0.8)' :
                        'rgba(239, 68, 68, 0.8)'
                    ),
                    borderRadius: 4
                }]
            );
        }, 100);
    },

    // Additional page renderers
    renderMyAttendance(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByStudent(user.id);
        const overall = DataManager.attendance.getStats(user.id);
        
        container.innerHTML = `
            <div class="card mb-24">
                <div class="card-header">
                    <div>
                        <div class="card-title">Overall Attendance Summary</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: var(--lilac-400);">${overall.percentage}%</div>
                            <div class="text-muted">Overall</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: var(--success-400);">${overall.present}</div>
                            <div class="text-muted">Present</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: var(--danger-400);">${overall.absent}</div>
                            <div class="text-muted">Absent</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: var(--warning-400);">${overall.late}</div>
                            <div class="text-muted">Late</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-24">
                <div class="card-header">
                    <div>
                        <div class="card-title">Attendance Trend (Last 30 Days)</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="attendance-trend-chart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Attendance by Course</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Total Classes</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Late</th>
                                    <th>Percentage</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courses.map(course => {
                                    const stats = DataManager.attendance.getStats(user.id, course.id);
                                    const attClass = Utils.getAttendanceClass(stats.percentage);
                                    return `
                                        <tr>
                                            <td>
                                                <strong>${course.name}</strong>
                                                <div class="text-muted" style="font-size: 12px;">${course.code}</div>
                                            </td>
                                            <td>${stats.total}</td>
                                            <td><span class="text-success">${stats.present}</span></td>
                                            <td><span class="text-danger">${stats.absent}</span></td>
                                            <td><span class="text-warning">${stats.late}</span></td>
                                            <td>
                                                <div class="attendance-percent">
                                                    <div class="percent-bar">
                                                        <div class="percent-fill ${attClass}" style="width: ${stats.percentage}%"></div>
                                                    </div>
                                                    <span class="percent-text ${attClass}">${stats.percentage}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="status-badge ${stats.percentage >= 85 ? 'present' : stats.percentage >= 80 ? 'late' : 'absent'}">
                                                    ${stats.percentage >= 85 ? 'Good' : stats.percentage >= 80 ? 'Warning' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            const trendData = this.getAttendanceTrendData(user.id, 30);
            this.charts.attendanceTrend = Utils.charts.createLineChart('attendance-trend-chart',
                trendData.labels,
                [{
                    label: 'Attendance %',
                    data: trendData.data,
                    borderColor: 'rgba(159, 122, 234, 1)',
                    backgroundColor: 'rgba(159, 122, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            );
        }, 100);
    },

    renderMyResults(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByStudent(user.id);
        const cgpa = DataManager.grades.calculateCGPA(user.id);

        container.innerHTML = `
            <div class="card mb-24">
                <div class="card-header">
                    <div>
                        <div class="card-title">Academic Summary</div>
                    </div>
                    <button class="btn btn-primary" onclick="Utils.export.gradeReport('${user.id}')" data-testid="button-export-transcript">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export Transcript
                    </button>
                </div>
                <div class="card-body">
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 48px; font-weight: 700; color: var(--lilac-400);">${cgpa}</div>
                        <div class="text-muted" style="font-size: 16px;">Cumulative GPA (out of 4.0)</div>
                    </div>
                </div>
            </div>

            ${courses.map(course => {
                const grades = DataManager.grades.getByStudentAndCourse(user.id, course.id);
                const totalPercent = DataManager.grades.calculateCourseTotal(user.id, course.id);
                const letterGrade = DataManager.grades.calculateLetterGrade(totalPercent);
                const stats = DataManager.grades.getCourseStats(course.id);
                const gradeClass = Utils.getGradeClass(letterGrade);

                return `
                    <div class="card mb-24">
                        <div class="card-header">
                            <div>
                                <div class="card-title">${course.name}</div>
                                <div class="card-subtitle">${course.code} | ${course.teacherName}</div>
                            </div>
                            <span class="grade-badge ${gradeClass}" style="font-size: 18px; padding: 8px 16px;">${letterGrade}</span>
                        </div>
                        <div class="card-body">
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Assessment</th>
                                            <th>Weight</th>
                                            <th>Max Marks</th>
                                            <th>Obtained</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${grades.map(g => `
                                            <tr>
                                                <td>${g.assessmentType}</td>
                                                <td>${g.weight}%</td>
                                                <td>${g.maxMarks}</td>
                                                <td>${g.obtainedMarks}</td>
                                                <td>
                                                    <div class="attendance-percent">
                                                        <div class="percent-bar" style="max-width: 60px;">
                                                            <div class="percent-fill ${g.percentage >= 80 ? 'high' : g.percentage >= 60 ? 'medium' : 'low'}" style="width: ${g.percentage}%"></div>
                                                        </div>
                                                        <span>${g.percentage.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr style="background: var(--gray-800);">
                                            <td colspan="4"><strong>Total</strong></td>
                                            <td><strong class="${gradeClass}">${totalPercent.toFixed(1)}%</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div style="margin-top: 16px; display: flex; gap: 24px; font-size: 13px;">
                                <span class="text-muted">Class Average: <strong>${stats.average}%</strong></span>
                                <span class="text-muted">Highest: <strong class="text-success">${stats.highest}%</strong></span>
                                <span class="text-muted">Lowest: <strong class="text-danger">${stats.lowest}%</strong></span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    },

    renderMyCourses(container) {
        const user = this.currentUser;
        let courses;
        
        if (user.role === 'student') {
            courses = DataManager.courses.getByStudent(user.id);
        } else {
            courses = DataManager.courses.getByTeacher(user.id);
        }

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${user.role === 'student' ? 'Enrolled Courses' : 'Assigned Courses'}</div>
                        <div class="card-subtitle">${courses.length} courses</div>
                    </div>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
                        ${courses.map(course => {
                            const studentCount = course.students.length;
                            
                            return `
                                <div class="card" style="background: var(--gray-800);">
                                    <div class="card-body">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                            <div>
                                                <h3 style="font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px;">${course.name}</h3>
                                                <div class="text-muted" style="font-size: 13px;">${course.code}</div>
                                            </div>
                                            <span class="status-badge present">${course.creditHours} CH</span>
                                        </div>
                                        <div style="font-size: 13px; color: var(--gray-300); margin-bottom: 12px;">
                                            <div style="margin-bottom: 4px;"><strong>Instructor:</strong> ${course.teacherName}</div>
                                            <div style="margin-bottom: 4px;"><strong>Schedule:</strong> ${course.schedule}</div>
                                            <div><strong>Room:</strong> ${course.room}</div>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--gray-700);">
                                            <span class="text-muted" style="font-size: 12px;">${studentCount} students enrolled</span>
                                            ${user.role === 'teacher' ? `<button class="btn btn-sm btn-ghost" onclick="App.viewCourseDetails('${course.id}')" data-testid="button-view-course-${course.id}">View Details</button>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderMarkAttendance(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByTeacher(user.id);
        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = `
            <div class="card mb-24">
                <div class="card-header">
                    <div>
                        <div class="card-title">Mark Attendance</div>
                        <div class="card-subtitle">Select a course and date to mark attendance</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="form-label">Course</label>
                            <select class="form-select" id="attendance-course" data-testid="select-attendance-course">
                                <option value="">Select a course</option>
                                ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-field">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-input" id="attendance-date" value="${today}" max="${today}" data-testid="input-attendance-date">
                        </div>
                    </div>
                </div>
            </div>

            <div id="attendance-form-container"></div>
        `;

        // Event listener for course/date change
        const loadAttendanceForm = () => {
            const courseId = document.getElementById('attendance-course').value;
            const date = document.getElementById('attendance-date').value;
            
            if (!courseId || !date) {
                document.getElementById('attendance-form-container').innerHTML = '';
                return;
            }

            const course = DataManager.courses.getById(courseId);
            const students = course.students.map(id => DataManager.users.getById(id)).filter(Boolean);
            const existingAttendance = DataManager.attendance.getForCourseAndDate(courseId, date);

            document.getElementById('attendance-form-container').innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${course.name} - ${DataManager.formatDate(date, 'short')}</div>
                            <div class="card-subtitle">${students.length} students</div>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-secondary" onclick="App.markAllAttendance('present')" data-testid="button-mark-all-present">Mark All Present</button>
                            <button class="btn btn-sm btn-primary" onclick="App.saveAttendance()" data-testid="button-save-attendance">Save Attendance</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="data-table" id="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Student Name</th>
                                        <th>Current %</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(student => {
                                        const existing = existingAttendance.find(a => a.studentId === student.id);
                                        const currentAtt = DataManager.attendance.calculatePercentage(student.id, courseId);
                                        const attClass = Utils.getAttendanceClass(currentAtt);
                                        
                                        return `
                                            <tr data-student-id="${student.id}">
                                                <td>${student.id}</td>
                                                <td>${student.name}</td>
                                                <td><span class="percent-text ${attClass}">${currentAtt}%</span></td>
                                                <td>
                                                    <div class="attendance-btn-group">
                                                        <button class="attendance-btn present ${existing?.status === 'present' ? 'active' : ''}" data-status="present" data-testid="btn-present-${student.id}">P</button>
                                                        <button class="attendance-btn absent ${existing?.status === 'absent' ? 'active' : ''}" data-status="absent" data-testid="btn-absent-${student.id}">A</button>
                                                        <button class="attendance-btn late ${existing?.status === 'late' ? 'active' : ''}" data-status="late" data-testid="btn-late-${student.id}">L</button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <input type="text" class="form-input" style="height: 32px; font-size: 12px;" placeholder="Optional notes" value="${existing?.notes || ''}" data-testid="input-notes-${student.id}">
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Bind attendance button clicks
            document.querySelectorAll('.attendance-btn-group').forEach(group => {
                group.querySelectorAll('.attendance-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        group.querySelectorAll('.attendance-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    });
                });
            });
        };

        document.getElementById('attendance-course').addEventListener('change', loadAttendanceForm);
        document.getElementById('attendance-date').addEventListener('change', loadAttendanceForm);
    },

    markAllAttendance(status) {
        document.querySelectorAll('.attendance-btn-group').forEach(group => {
            group.querySelectorAll('.attendance-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.status === status);
            });
        });
    },

    saveAttendance() {
        const courseId = document.getElementById('attendance-course').value;
        const date = document.getElementById('attendance-date').value;
        const rows = document.querySelectorAll('#attendance-table tbody tr');
        
        let attendanceData = [];
        let hasErrors = false;

        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const activeBtn = row.querySelector('.attendance-btn.active');
            const notes = row.querySelector('input').value;

            if (!activeBtn) {
                hasErrors = true;
                return;
            }

            attendanceData.push({
                studentId,
                status: activeBtn.dataset.status,
                notes
            });
        });

        if (hasErrors) {
            Utils.toast.warning('Incomplete', 'Please mark attendance for all students');
            return;
        }

        DataManager.attendance.markBulk(courseId, date, attendanceData, this.currentUser.id);
        DataManager.auditLog.add('ATTENDANCE_MARKED', this.currentUser.id, this.currentUser.name, 
            `Marked attendance for ${courseId} on ${date} - ${attendanceData.length} students`);

        Utils.toast.success('Success', 'Attendance saved successfully');
        
        // Refresh the form to show updated percentages
        this.navigateTo('mark-attendance');
    },

    renderEnterGrades(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByTeacher(user.id);

        container.innerHTML = `
            <div class="card mb-24">
                <div class="card-header">
                    <div>
                        <div class="card-title">Enter Grades</div>
                        <div class="card-subtitle">Select a course to enter grades</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="form-label">Course</label>
                            <select class="form-select" id="grade-course" data-testid="select-grade-course">
                                <option value="">Select a course</option>
                                ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-field">
                            <label class="form-label">Assessment Type</label>
                            <select class="form-select" id="grade-assessment" data-testid="select-grade-assessment">
                                <option value="">Select assessment</option>
                                <option value="Quiz 1">Quiz 1 (5%)</option>
                                <option value="Quiz 2">Quiz 2 (5%)</option>
                                <option value="Quiz 3">Quiz 3 (5%)</option>
                                <option value="Assignment 1">Assignment 1 (5%)</option>
                                <option value="Assignment 2">Assignment 2 (5%)</option>
                                <option value="Assignment 3">Assignment 3 (5%)</option>
                                <option value="Midterm">Midterm (25%)</option>
                                <option value="Final">Final (45%)</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label class="form-label">Max Marks</label>
                            <input type="number" class="form-input" id="grade-max-marks" placeholder="e.g., 100" data-testid="input-max-marks">
                        </div>
                    </div>
                </div>
            </div>

            <div id="grade-form-container"></div>
        `;

        // Event listener for course/assessment change
        const loadGradeForm = () => {
            const courseId = document.getElementById('grade-course').value;
            const assessmentType = document.getElementById('grade-assessment').value;
            const maxMarks = document.getElementById('grade-max-marks').value;
            
            if (!courseId || !assessmentType || !maxMarks) {
                document.getElementById('grade-form-container').innerHTML = '';
                return;
            }

            const course = DataManager.courses.getById(courseId);
            const students = course.students.map(id => DataManager.users.getById(id)).filter(Boolean);
            const existingGrades = DataManager.grades.getByCourse(courseId)
                .filter(g => g.assessmentType === assessmentType);

            // Get weight from assessment type
            const weightMap = {
                'Quiz 1': 5, 'Quiz 2': 5, 'Quiz 3': 5,
                'Assignment 1': 5, 'Assignment 2': 5, 'Assignment 3': 5,
                'Midterm': 25, 'Final': 45
            };

            document.getElementById('grade-form-container').innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${course.name} - ${assessmentType}</div>
                            <div class="card-subtitle">Max Marks: ${maxMarks} | Weight: ${weightMap[assessmentType]}%</div>
                        </div>
                        <button class="btn btn-primary" onclick="App.saveGrades()" data-testid="button-save-grades">Save Grades</button>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="data-table" id="grades-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Student Name</th>
                                        <th>Obtained Marks</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(student => {
                                        const existing = existingGrades.find(g => g.studentId === student.id);
                                        
                                        return `
                                            <tr data-student-id="${student.id}">
                                                <td>${student.id}</td>
                                                <td>${student.name}</td>
                                                <td>
                                                    <input type="number" class="form-input grade-input" 
                                                        style="width: 100px; height: 36px;" 
                                                        min="0" max="${maxMarks}" 
                                                        value="${existing?.obtainedMarks || ''}"
                                                        data-testid="input-grade-${student.id}">
                                                </td>
                                                <td class="grade-percent">-</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Calculate percentage on input
            document.querySelectorAll('.grade-input').forEach(input => {
                input.addEventListener('input', () => {
                    const obtained = parseFloat(input.value) || 0;
                    const percent = ((obtained / maxMarks) * 100).toFixed(1);
                    const percentCell = input.closest('tr').querySelector('.grade-percent');
                    percentCell.textContent = `${percent}%`;
                    
                    // Color code
                    percentCell.className = 'grade-percent';
                    if (obtained >= maxMarks * 0.8) percentCell.classList.add('text-success');
                    else if (obtained >= maxMarks * 0.6) percentCell.classList.add('text-warning');
                    else percentCell.classList.add('text-danger');
                });
                
                // Trigger for existing values
                input.dispatchEvent(new Event('input'));
            });
        };

        document.getElementById('grade-course').addEventListener('change', loadGradeForm);
        document.getElementById('grade-assessment').addEventListener('change', loadGradeForm);
        document.getElementById('grade-max-marks').addEventListener('input', loadGradeForm);
    },

    saveGrades() {
        const courseId = document.getElementById('grade-course').value;
        const assessmentType = document.getElementById('grade-assessment').value;
        const maxMarks = parseInt(document.getElementById('grade-max-marks').value);
        const rows = document.querySelectorAll('#grades-table tbody tr');
        
        const weightMap = {
            'Quiz 1': 5, 'Quiz 2': 5, 'Quiz 3': 5,
            'Assignment 1': 5, 'Assignment 2': 5, 'Assignment 3': 5,
            'Midterm': 25, 'Final': 45
        };

        let savedCount = 0;

        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const input = row.querySelector('.grade-input');
            const obtainedMarks = parseFloat(input.value);

            if (isNaN(obtainedMarks)) return;

            // Check if grade exists
            const existingGrades = DataManager.grades.getByStudentAndCourse(studentId, courseId)
                .filter(g => g.assessmentType === assessmentType);

            if (existingGrades.length > 0) {
                DataManager.grades.update(existingGrades[0].id, { obtainedMarks });
            } else {
                DataManager.grades.add({
                    studentId,
                    courseId,
                    assessmentType,
                    weight: weightMap[assessmentType],
                    maxMarks,
                    obtainedMarks,
                    postedBy: this.currentUser.id
                });
            }
            savedCount++;
        });

        DataManager.auditLog.add('GRADE_POSTED', this.currentUser.id, this.currentUser.name,
            `Posted ${assessmentType} grades for ${courseId} - ${savedCount} students`);

        Utils.toast.success('Success', `Saved grades for ${savedCount} students`);
    },

    renderAtRiskStudents(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByTeacher(user.id);
        
        const atRiskStudents = [];
        courses.forEach(course => {
            course.students.forEach(studentId => {
                const attendance = DataManager.attendance.calculatePercentage(studentId, course.id);
                if (attendance < 85) {
                    const student = DataManager.users.getById(studentId);
                    if (student) {
                        atRiskStudents.push({
                            ...student,
                            attendance,
                            course: course.name,
                            courseCode: course.code,
                            courseId: course.id
                        });
                    }
                }
            });
        });

        // Sort by attendance ascending
        atRiskStudents.sort((a, b) => a.attendance - b.attendance);

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">At-Risk Students</div>
                        <div class="card-subtitle">${atRiskStudents.length} students with attendance below 85%</div>
                    </div>
                </div>
                <div class="card-body">
                    ${atRiskStudents.length > 0 ? `
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Course</th>
                                        <th>Attendance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${atRiskStudents.map(student => `
                                        <tr>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <div class="user-avatar" style="width: 36px; height: 36px; font-size: 12px;">${Utils.getInitials(student.name)}</div>
                                                    <div>
                                                        <strong>${student.name}</strong>
                                                        <div class="text-muted" style="font-size: 12px;">${student.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>${student.courseCode}</td>
                                            <td>
                                                <div class="attendance-percent">
                                                    <div class="percent-bar">
                                                        <div class="percent-fill ${student.attendance < 80 ? 'low' : 'medium'}" style="width: ${student.attendance}%"></div>
                                                    </div>
                                                    <span class="percent-text ${student.attendance < 80 ? 'low' : 'medium'}">${student.attendance}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="status-badge ${student.attendance < 80 ? 'absent' : 'late'}">
                                                    ${student.attendance < 80 ? 'Critical' : 'Warning'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn btn-sm btn-ghost" onclick="App.sendReminder('${student.id}', '${student.courseId}')" data-testid="button-remind-${student.id}">
                                                    Send Reminder
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                <polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                            <div class="empty-state-title">All Students On Track</div>
                            <div class="empty-state-text">No students are currently at risk in your courses.</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    sendReminder(studentId, courseId) {
        const student = DataManager.users.getById(studentId);
        const course = DataManager.courses.getById(courseId);
        const attendance = DataManager.attendance.calculatePercentage(studentId, courseId);

        DataManager.notifications.create({
            userId: studentId,
            type: 'warning',
            title: 'Attendance Reminder',
            message: `Your attendance in ${course.name} is ${attendance}%. Please attend classes regularly to avoid academic penalties.`
        });

        Utils.toast.success('Reminder Sent', `Notification sent to ${student.name}`);
    },

    renderAttendanceReports(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByTeacher(user.id);

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Generate Attendance Report</div>
                        <div class="card-subtitle">Export attendance data as PDF</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="form-label">Course</label>
                            <select class="form-select" id="report-course" data-testid="select-report-course">
                                <option value="">Select a course</option>
                                ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-field">
                            <label class="form-label">Start Date (Optional)</label>
                            <input type="date" class="form-input" id="report-start-date" data-testid="input-report-start">
                        </div>
                        <div class="form-field">
                            <label class="form-label">End Date (Optional)</label>
                            <input type="date" class="form-input" id="report-end-date" data-testid="input-report-end">
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <button class="btn btn-primary" onclick="App.generateAttendanceReport()" data-testid="button-generate-report">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                            Generate PDF Report
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    generateAttendanceReport() {
        const courseId = document.getElementById('report-course').value;
        const startDate = document.getElementById('report-start-date').value || null;
        const endDate = document.getElementById('report-end-date').value || null;

        if (!courseId) {
            Utils.toast.error('Error', 'Please select a course');
            return;
        }

        Utils.export.attendanceReport(courseId, startDate, endDate);
    },

    renderGradeReports(container) {
        const user = this.currentUser;
        const courses = DataManager.courses.getByTeacher(user.id);

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Generate Grade Report</div>
                        <div class="card-subtitle">Export grades as PDF or CSV</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="form-label">Course</label>
                            <select class="form-select" id="grade-report-course" data-testid="select-grade-report-course">
                                <option value="">Select a course</option>
                                ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="margin-top: 20px; display: flex; gap: 12px;">
                        <button class="btn btn-primary" onclick="App.exportGradePDF()" data-testid="button-export-grade-pdf">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                            Export PDF
                        </button>
                        <button class="btn btn-secondary" onclick="App.exportGradeCSV()" data-testid="button-export-grade-csv">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    exportGradePDF() {
        const courseId = document.getElementById('grade-report-course').value;
        if (!courseId) {
            Utils.toast.error('Error', 'Please select a course');
            return;
        }
        
        const course = DataManager.courses.getById(courseId);
        const students = course.students.map(id => DataManager.users.getById(id)).filter(Boolean);
        
        let content = `<table><thead><tr><th>Roll No</th><th>Student Name</th><th>Total %</th><th>Grade</th></tr></thead><tbody>`;
        
        students.forEach(student => {
            const total = DataManager.grades.calculateCourseTotal(student.id, courseId);
            const grade = DataManager.grades.calculateLetterGrade(total);
            const gradeClass = Utils.getGradeClass(grade);
            content += `<tr><td>${student.id}</td><td>${student.name}</td><td>${total.toFixed(1)}%</td><td class="${gradeClass}">${grade}</td></tr>`;
        });
        
        content += '</tbody></table>';
        
        Utils.export.generatePDF(`Grade Report - ${course.name} (${course.code})`, content);
    },

    exportGradeCSV() {
        const courseId = document.getElementById('grade-report-course').value;
        if (!courseId) {
            Utils.toast.error('Error', 'Please select a course');
            return;
        }
        
        Utils.export.courseGradesCSV(courseId);
        Utils.toast.success('Success', 'CSV file downloaded');
    },

    renderManageUsers(container) {
        const allUsers = DataManager.users.getAll();
        const students = allUsers.filter(u => u.role === 'student');
        const teachers = allUsers.filter(u => u.role === 'teacher');
        const admins = allUsers.filter(u => u.role === 'admin');

        container.innerHTML = `
            <div class="tabs" id="user-tabs">
                <div class="tab active" data-tab="students">Students (${students.length})</div>
                <div class="tab" data-tab="teachers">Teachers (${teachers.length})</div>
                <div class="tab" data-tab="admins">Admins (${admins.length})</div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title" id="users-table-title">Students</div>
                    </div>
                    <button class="btn btn-primary" onclick="App.openAddUserModal()" data-testid="button-add-new-user">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add User
                    </button>
                </div>
                <div class="card-body">
                    <div id="users-table-container">
                        ${this.renderUsersTable(students)}
                    </div>
                </div>
            </div>
        `;

        // Tab switching
        document.querySelectorAll('#user-tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#user-tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabType = tab.dataset.tab;
                let users;
                if (tabType === 'students') users = students;
                else if (tabType === 'teachers') users = teachers;
                else users = admins;
                
                document.getElementById('users-table-title').textContent = this.capitalizeFirst(tabType);
                document.getElementById('users-table-container').innerHTML = this.renderUsersTable(users);
            });
        });
    },

    renderUsersTable(users) {
        if (users.length === 0) {
            return '<div class="empty-state"><p class="text-muted">No users found</p></div>';
        }

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 11px;">${Utils.getInitials(user.name)}</div>
                                        ${user.name}
                                    </div>
                                </td>
                                <td>${user.email}</td>
                                <td><span class="status-badge ${user.role === 'admin' ? 'excused' : user.role === 'teacher' ? 'late' : 'present'}">${this.capitalizeFirst(user.role)}</span></td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-ghost" onclick="App.editUser('${user.id}')" data-testid="button-edit-${user.id}">Edit</button>
                                        ${user.id !== this.currentUser.id ? `<button class="btn btn-sm btn-danger" onclick="App.deleteUser('${user.id}')" data-testid="button-delete-${user.id}">Delete</button>` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    openAddUserModal() {
        const bodyContent = `
            <form id="add-user-form">
                <div class="form-grid">
                    <div class="form-field">
                        <label class="form-label">ID / Roll Number <span class="required">*</span></label>
                        <input type="text" class="form-input" id="new-user-id" required placeholder="e.g., 21K-1234" data-testid="input-new-user-id">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Full Name <span class="required">*</span></label>
                        <input type="text" class="form-input" id="new-user-name" required placeholder="Full name" data-testid="input-new-user-name">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Email <span class="required">*</span></label>
                        <input type="email" class="form-input" id="new-user-email" required placeholder="email@example.com" data-testid="input-new-user-email">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Password <span class="required">*</span></label>
                        <input type="password" class="form-input" id="new-user-password" required placeholder="Password" data-testid="input-new-user-password">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Role <span class="required">*</span></label>
                        <select class="form-select" id="new-user-role" required data-testid="select-new-user-role">
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="form-field">
                        <label class="form-label">Department</label>
                        <input type="text" class="form-input" id="new-user-department" placeholder="Department" data-testid="input-new-user-department">
                    </div>
                </div>
            </form>
        `;

        const footerContent = `
            <button class="btn btn-secondary" onclick="Utils.modal.close()" data-testid="button-cancel-user">Cancel</button>
            <button class="btn btn-primary" onclick="App.saveNewUser()" data-testid="button-save-user">Create User</button>
        `;

        Utils.modal.open('Add New User', bodyContent, footerContent);
    },

    saveNewUser() {
        const id = document.getElementById('new-user-id').value.trim();
        const name = document.getElementById('new-user-name').value.trim();
        const email = document.getElementById('new-user-email').value.trim();
        const password = document.getElementById('new-user-password').value;
        const role = document.getElementById('new-user-role').value;
        const department = document.getElementById('new-user-department').value.trim();

        if (!id || !name || !email || !password) {
            Utils.toast.error('Error', 'Please fill in all required fields');
            return;
        }

        // Check if ID already exists
        if (DataManager.users.getById(id)) {
            Utils.toast.error('Error', 'A user with this ID already exists');
            return;
        }

        DataManager.users.create({
            id,
            name,
            email,
            password,
            role,
            department,
            enrolledCourses: [],
            courses: []
        });

        DataManager.auditLog.add('USER_CREATED', this.currentUser.id, this.currentUser.name,
            `Created new ${role} user: ${name} (${id})`);

        Utils.toast.success('Success', 'User created successfully');
        Utils.modal.close();
        this.navigateTo('manage-users');
    },

    editUser(userId) {
        const user = DataManager.users.getById(userId);
        if (!user) return;

        const bodyContent = `
            <form id="edit-user-form">
                <div class="form-grid">
                    <div class="form-field">
                        <label class="form-label">ID</label>
                        <input type="text" class="form-input" value="${user.id}" disabled>
                    </div>
                    <div class="form-field">
                        <label class="form-label">Full Name <span class="required">*</span></label>
                        <input type="text" class="form-input" id="edit-user-name" value="${user.name}" required data-testid="input-edit-user-name">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Email <span class="required">*</span></label>
                        <input type="email" class="form-input" id="edit-user-email" value="${user.email}" required data-testid="input-edit-user-email">
                    </div>
                    <div class="form-field">
                        <label class="form-label">New Password (leave blank to keep)</label>
                        <input type="password" class="form-input" id="edit-user-password" placeholder="New password" data-testid="input-edit-user-password">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Department</label>
                        <input type="text" class="form-input" id="edit-user-department" value="${user.department || ''}" data-testid="input-edit-user-department">
                    </div>
                </div>
            </form>
        `;

        const footerContent = `
            <button class="btn btn-secondary" onclick="Utils.modal.close()" data-testid="button-cancel-edit">Cancel</button>
            <button class="btn btn-primary" onclick="App.updateUser('${userId}')" data-testid="button-update-user">Update User</button>
        `;

        Utils.modal.open('Edit User', bodyContent, footerContent);
    },

    updateUser(userId) {
        const name = document.getElementById('edit-user-name').value.trim();
        const email = document.getElementById('edit-user-email').value.trim();
        const password = document.getElementById('edit-user-password').value;
        const department = document.getElementById('edit-user-department').value.trim();

        const updates = { name, email, department };
        if (password) updates.password = password;

        DataManager.users.update(userId, updates);
        
        DataManager.auditLog.add('USER_UPDATED', this.currentUser.id, this.currentUser.name,
            `Updated user: ${name} (${userId})`);

        Utils.toast.success('Success', 'User updated successfully');
        Utils.modal.close();
        this.navigateTo('manage-users');
    },

    deleteUser(userId) {
        const user = DataManager.users.getById(userId);
        if (!user) return;

        Utils.modal.confirm(
            'Delete User',
            `Are you sure you want to delete ${user.name} (${userId})? This action cannot be undone.`,
            () => {
                DataManager.users.delete(userId);
                DataManager.auditLog.add('USER_DELETED', this.currentUser.id, this.currentUser.name,
                    `Deleted user: ${user.name} (${userId})`);
                Utils.toast.success('Success', 'User deleted successfully');
                this.navigateTo('manage-users');
            },
            'Delete',
            'btn-danger'
        );
    },

    renderManageCourses(container) {
        const courses = DataManager.courses.getAll();

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">All Courses</div>
                        <div class="card-subtitle">${courses.length} courses in the system</div>
                    </div>
                    <button class="btn btn-primary" onclick="App.openAddCourseModal()" data-testid="button-add-new-course">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Course
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Instructor</th>
                                    <th>Credits</th>
                                    <th>Students</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courses.map(course => `
                                    <tr>
                                        <td><strong>${course.code}</strong></td>
                                        <td>${course.name}</td>
                                        <td>${course.teacherName}</td>
                                        <td>${course.creditHours}</td>
                                        <td>${course.students.length}</td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-ghost" onclick="App.editCourse('${course.id}')" data-testid="button-edit-course-${course.id}">Edit</button>
                                                <button class="btn btn-sm btn-danger" onclick="App.deleteCourse('${course.id}')" data-testid="button-delete-course-${course.id}">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    openAddCourseModal() {
        const teachers = DataManager.users.getByRole('teacher');

        const bodyContent = `
            <form id="add-course-form">
                <div class="form-grid">
                    <div class="form-field">
                        <label class="form-label">Course Code <span class="required">*</span></label>
                        <input type="text" class="form-input" id="new-course-code" required placeholder="e.g., CS-501" data-testid="input-new-course-code">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Course Name <span class="required">*</span></label>
                        <input type="text" class="form-input" id="new-course-name" required placeholder="Course name" data-testid="input-new-course-name">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Credit Hours <span class="required">*</span></label>
                        <input type="number" class="form-input" id="new-course-credits" required min="1" max="6" placeholder="3" data-testid="input-new-course-credits">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Instructor <span class="required">*</span></label>
                        <select class="form-select" id="new-course-teacher" required data-testid="select-new-course-teacher">
                            <option value="">Select instructor</option>
                            ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-field full-width">
                        <label class="form-label">Schedule</label>
                        <input type="text" class="form-input" id="new-course-schedule" placeholder="e.g., Mon, Wed 2:00 PM - 3:30 PM" data-testid="input-new-course-schedule">
                    </div>
                    <div class="form-field">
                        <label class="form-label">Room</label>
                        <input type="text" class="form-input" id="new-course-room" placeholder="e.g., Room 301" data-testid="input-new-course-room">
                    </div>
                </div>
            </form>
        `;

        const footerContent = `
            <button class="btn btn-secondary" onclick="Utils.modal.close()" data-testid="button-cancel-course">Cancel</button>
            <button class="btn btn-primary" onclick="App.saveNewCourse()" data-testid="button-save-course">Create Course</button>
        `;

        Utils.modal.open('Add New Course', bodyContent, footerContent);
    },

    saveNewCourse() {
        const code = document.getElementById('new-course-code').value.trim();
        const name = document.getElementById('new-course-name').value.trim();
        const creditHours = parseInt(document.getElementById('new-course-credits').value);
        const teacherId = document.getElementById('new-course-teacher').value;
        const schedule = document.getElementById('new-course-schedule').value.trim();
        const room = document.getElementById('new-course-room').value.trim();

        if (!code || !name || !creditHours || !teacherId) {
            Utils.toast.error('Error', 'Please fill in all required fields');
            return;
        }

        const teacher = DataManager.users.getById(teacherId);

        DataManager.courses.create({
            id: code,
            code,
            name,
            creditHours,
            teacherId,
            teacherName: teacher.name,
            schedule,
            room,
            department: teacher.department || 'General',
            semester: 1,
            students: []
        });

        DataManager.auditLog.add('COURSE_CREATED', this.currentUser.id, this.currentUser.name,
            `Created new course: ${name} (${code})`);

        Utils.toast.success('Success', 'Course created successfully');
        Utils.modal.close();
        this.navigateTo('manage-courses');
    },

    editCourse(courseId) {
        Utils.toast.info('Info', 'Course editing coming soon');
    },

    deleteCourse(courseId) {
        const course = DataManager.courses.getById(courseId);
        if (!course) return;

        Utils.modal.confirm(
            'Delete Course',
            `Are you sure you want to delete ${course.name} (${course.code})? This will also remove all associated attendance and grade records.`,
            () => {
                DataManager.courses.delete(courseId);
                DataManager.auditLog.add('COURSE_DELETED', this.currentUser.id, this.currentUser.name,
                    `Deleted course: ${course.name} (${courseId})`);
                Utils.toast.success('Success', 'Course deleted successfully');
                this.navigateTo('manage-courses');
            },
            'Delete',
            'btn-danger'
        );
    },

    renderEnrollments(container) {
        const courses = DataManager.courses.getAll();
        const students = DataManager.users.getByRole('student');

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Manage Enrollments</div>
                        <div class="card-subtitle">Enroll or unenroll students from courses</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-grid mb-24">
                        <div class="form-field">
                            <label class="form-label">Select Course</label>
                            <select class="form-select" id="enrollment-course" data-testid="select-enrollment-course">
                                <option value="">Select a course</option>
                                ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="enrollment-students-container"></div>
                </div>
            </div>
        `;

        document.getElementById('enrollment-course').addEventListener('change', (e) => {
            const courseId = e.target.value;
            if (!courseId) {
                document.getElementById('enrollment-students-container').innerHTML = '';
                return;
            }

            const course = DataManager.courses.getById(courseId);

            document.getElementById('enrollment-students-container').innerHTML = `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Program</th>
                                <th>Semester</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => {
                                const isEnrolled = course.students.includes(student.id);
                                return `
                                    <tr>
                                        <td>${student.id}</td>
                                        <td>${student.name}</td>
                                        <td>${student.program || 'N/A'}</td>
                                        <td>${student.semester || 'N/A'}</td>
                                        <td>
                                            <span class="status-badge ${isEnrolled ? 'present' : 'absent'}">
                                                ${isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                                            </span>
                                        </td>
                                        <td>
                                            ${isEnrolled 
                                                ? `<button class="btn btn-sm btn-danger" onclick="App.unenrollStudent('${courseId}', '${student.id}')" data-testid="button-unenroll-${student.id}">Unenroll</button>`
                                                : `<button class="btn btn-sm btn-success" onclick="App.enrollStudent('${courseId}', '${student.id}')" data-testid="button-enroll-${student.id}">Enroll</button>`
                                            }
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });
    },

    enrollStudent(courseId, studentId) {
        DataManager.courses.enrollStudent(courseId, studentId);
        const course = DataManager.courses.getById(courseId);
        const student = DataManager.users.getById(studentId);
        
        DataManager.auditLog.add('STUDENT_ENROLLED', this.currentUser.id, this.currentUser.name,
            `Enrolled ${student.name} (${studentId}) in ${course.code}`);
        
        Utils.toast.success('Success', `${student.name} enrolled in ${course.code}`);
        
        // Refresh the view
        document.getElementById('enrollment-course').dispatchEvent(new Event('change'));
    },

    unenrollStudent(courseId, studentId) {
        DataManager.courses.unenrollStudent(courseId, studentId);
        const course = DataManager.courses.getById(courseId);
        const student = DataManager.users.getById(studentId);
        
        DataManager.auditLog.add('STUDENT_UNENROLLED', this.currentUser.id, this.currentUser.name,
            `Unenrolled ${student.name} (${studentId}) from ${course.code}`);
        
        Utils.toast.success('Success', `${student.name} unenrolled from ${course.code}`);
        
        // Refresh the view
        document.getElementById('enrollment-course').dispatchEvent(new Event('change'));
    },

    renderSystemStats(container) {
        // Redirect to admin dashboard stats
        this.renderAdminDashboard(container);
    },

    renderAuditLog(container) {
        const logs = DataManager.auditLog.getAll();

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Audit Log</div>
                        <div class="card-subtitle">System activity history</div>
                    </div>
                    <button class="btn btn-secondary" onclick="Utils.export.auditLogCSV()" data-testid="button-download-audit" style="margin-top: 0;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px; display: inline;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download CSV
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logs.map(log => `
                                    <tr>
                                        <td style="white-space: nowrap;">${DataManager.formatDate(log.timestamp, 'full')}</td>
                                        <td><strong>${log.action.replace(/_/g, ' ')}</strong></td>
                                        <td>
                                            <div>${log.userName}</div>
                                            <div class="text-muted" style="font-size: 11px;">${log.userId}</div>
                                        </td>
                                        <td>${log.details}</td>
                                        <td>
                                            ${log.flagged 
                                                ? '<span class="status-badge absent">Flagged</span>' 
                                                : '<span class="status-badge present">Normal</span>'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderPolicyViolations(container) {
        const students = DataManager.users.getByRole('student');
        const violations = [];

        students.forEach(student => {
            const courses = DataManager.courses.getByStudent(student.id);
            courses.forEach(course => {
                const att = DataManager.attendance.calculatePercentage(student.id, course.id);
                if (att < 80) {
                    violations.push({
                        student,
                        course,
                        attendance: att,
                        severity: att < 75 ? 'critical' : 'warning'
                    });
                }
            });
        });

        violations.sort((a, b) => a.attendance - b.attendance);

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Policy Violations</div>
                        <div class="card-subtitle">${violations.length} students with attendance below 80%</div>
                    </div>
                </div>
                <div class="card-body">
                    ${violations.length > 0 ? `
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Course</th>
                                        <th>Attendance</th>
                                        <th>Severity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${violations.map(v => `
                                        <tr>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <div class="user-avatar" style="width: 36px; height: 36px; font-size: 12px;">${Utils.getInitials(v.student.name)}</div>
                                                    <div>
                                                        <strong>${v.student.name}</strong>
                                                        <div class="text-muted" style="font-size: 12px;">${v.student.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>${v.course.code}</td>
                                            <td>
                                                <span class="percent-text low">${v.attendance}%</span>
                                            </td>
                                            <td>
                                                <span class="status-badge ${v.severity === 'critical' ? 'absent' : 'late'}">
                                                    ${v.severity === 'critical' ? 'Critical' : 'Warning'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn btn-sm btn-ghost" onclick="App.sendWarningNotification('${v.student.id}', '${v.course.id}')" data-testid="button-warn-${v.student.id}">
                                                    Send Warning
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                <polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                            <div class="empty-state-title">No Policy Violations</div>
                            <div class="empty-state-text">All students are maintaining acceptable attendance levels.</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    sendWarningNotification(studentId, courseId) {
        const student = DataManager.users.getById(studentId);
        const course = DataManager.courses.getById(courseId);
        const attendance = DataManager.attendance.calculatePercentage(studentId, courseId);

        DataManager.notifications.create({
            userId: studentId,
            type: 'danger',
            title: 'Official Attendance Warning',
            message: `Your attendance in ${course.name} (${course.code}) is ${attendance}%, which is below the minimum required 80%. Immediate improvement is required to avoid academic penalties.`
        });

        DataManager.auditLog.add('WARNING_SENT', this.currentUser.id, this.currentUser.name,
            `Sent official warning to ${student.name} (${studentId}) for ${course.code}`);

        Utils.toast.success('Warning Sent', `Official warning sent to ${student.name}`);
    },

    renderNotificationsPage(container) {
        const notifications = DataManager.notifications.getByUser(this.currentUser.id);

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">All Notifications</div>
                        <div class="card-subtitle">${notifications.filter(n => !n.read).length} unread</div>
                    </div>
                    <button class="btn btn-secondary" onclick="App.markAllNotificationsRead()" data-testid="button-mark-all-read-page">
                        Mark All as Read
                    </button>
                </div>
                <div class="card-body">
                    ${notifications.length > 0 ? notifications.map(n => `
                        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="App.markNotificationRead('${n.id}')" style="cursor: pointer;">
                            <div class="notification-icon ${n.type}">
                                ${this.getNotificationIcon(n.type)}
                            </div>
                            <div class="notification-content">
                                <div class="notification-title">${n.title}</div>
                                <div class="notification-text">${n.message}</div>
                                <div class="notification-time">${DataManager.getRelativeTime(n.createdAt)}</div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 01-3.46 0"/>
                            </svg>
                            <div class="empty-state-title">No Notifications</div>
                            <div class="empty-state-text">You're all caught up!</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    markNotificationRead(notificationId) {
        DataManager.notifications.markAsRead(notificationId);
        this.updateNotificationBadge();
        this.navigateTo('notifications');
    },

    markAllNotificationsRead() {
        DataManager.notifications.markAllAsRead(this.currentUser.id);
        this.updateNotificationBadge();
        this.setupNavigation();
        this.navigateTo('notifications');
        Utils.toast.success('Success', 'All notifications marked as read');
    },

    renderProfile(container) {
        const user = this.currentUser;

        container.innerHTML = `
            <div class="card" style="max-width: 600px;">
                <div class="card-header">
                    <div class="card-title">Profile Settings</div>
                </div>
                <div class="card-body">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div class="user-avatar" style="width: 80px; height: 80px; font-size: 28px; margin: 0 auto 16px;">${Utils.getInitials(user.name)}</div>
                        <h3 style="font-size: 20px; font-weight: 600; color: #fff;">${user.name}</h3>
                        <p class="text-muted">${this.capitalizeFirst(user.role)} | ${user.id}</p>
                    </div>

                    <form id="profile-form">
                        <div class="form-grid cols-1">
                            <div class="form-field">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-input" id="profile-name" value="${user.name}" data-testid="input-profile-name">
                            </div>
                            <div class="form-field">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" id="profile-email" value="${user.email}" data-testid="input-profile-email">
                            </div>
                            <div class="form-field">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-input" id="profile-phone" value="${user.phone || ''}" placeholder="+92-XXX-XXXXXXX" data-testid="input-profile-phone">
                            </div>
                            <div class="form-field">
                                <label class="form-label">Department</label>
                                <input type="text" class="form-input" id="profile-department" value="${user.department || ''}" ${user.role === 'student' ? 'disabled' : ''} data-testid="input-profile-department">
                            </div>
                            <div class="form-field">
                                <label class="form-label">New Password (leave blank to keep current)</label>
                                <input type="password" class="form-input" id="profile-password" placeholder="Enter new password" data-testid="input-profile-password">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary" onclick="App.saveProfile()" data-testid="button-save-profile">Save Changes</button>
                </div>
            </div>
        `;
    },

    saveProfile() {
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const department = document.getElementById('profile-department').value.trim();
        const password = document.getElementById('profile-password').value;

        if (!name || !email) {
            Utils.toast.error('Error', 'Name and email are required');
            return;
        }

        const updates = { name, email, phone, department };
        if (password) updates.password = password;

        DataManager.users.update(this.currentUser.id, updates);
        
        // Update current user
        Object.assign(this.currentUser, updates);
        DataManager.session.login(this.currentUser);

        // Update UI
        this.setupDashboard();

        Utils.toast.success('Success', 'Profile updated successfully');
    },

    // Notification Panel
    toggleNotificationPanel(open) {
        const panel = document.getElementById('notification-panel');
        const overlay = document.getElementById('notification-overlay');
        
        if (open) {
            panel.classList.add('open');
            overlay.classList.add('open');
            this.renderNotifications();
        } else {
            panel.classList.remove('open');
            overlay.classList.remove('open');
        }
    },

    renderNotifications() {
        const notifications = DataManager.notifications.getByUser(this.currentUser.id);
        const list = document.getElementById('notification-list');

        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        list.innerHTML = notifications.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="App.handleNotificationClick('${n.id}')">
                <div class="notification-icon ${n.type}">
                    ${this.getNotificationIcon(n.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-text">${n.message}</div>
                    <div class="notification-time">${DataManager.getRelativeTime(n.createdAt)}</div>
                </div>
            </div>
        `).join('');
    },

    handleNotificationClick(notificationId) {
        DataManager.notifications.markAsRead(notificationId);
        this.updateNotificationBadge();
        this.renderNotifications();
    },

    updateNotificationBadge() {
        const count = DataManager.notifications.getUnreadCount(this.currentUser.id);
        const badge = document.getElementById('notification-count');
        badge.textContent = count;
        badge.dataset.count = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    },

    getNotificationIcon(type) {
        const icons = {
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        };
        return icons[type] || icons.info;
    },

    // Helper functions
    getAttendanceTrendData(studentId, days) {
        const data = [];
        const labels = [];
        const now = new Date();

        for (let i = days; i >= 0; i -= 7) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Get cumulative attendance up to this date
            const attendance = DataManager.attendance.getByStudent(studentId)
                .filter(a => new Date(a.date) <= date);
            
            if (attendance.length > 0) {
                const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
                const percentage = Math.round((present / attendance.length) * 100);
                data.push(percentage);
                labels.push(DataManager.formatDate(date, 'short'));
            }
        }

        return { labels, data };
    },

    handleSearch(query) {
        if (!query.trim()) return;
        Utils.toast.info('Search', `Searching for "${query}"...`);
    },

    viewCourseDetails(courseId) {
        Utils.toast.info('Info', 'Course details view coming soon');
    },

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
