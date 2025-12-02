/* =====================================================
   AMAL-NAMA - Utility Functions Module
   Helper functions, calculations, and export tools
   ===================================================== */

const Utils = {
    // DOM Helpers
    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

    createElement(tag, className = '', innerHTML = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    },

    // Toast Notifications
    toast: {
        container: null,
        
        init() {
            this.container = document.getElementById('toast-container');
        },
        
        show(type, title, message, duration = 5000) {
            const icons = {
                success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
                error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
                warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
                info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
            };

            const toast = Utils.createElement('div', `toast ${type}`);
            toast.innerHTML = `
                <div class="toast-icon">${icons[type]}</div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" data-testid="button-toast-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;

            this.container.appendChild(toast);

            // Close button handler
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.hide(toast);
            });

            // Auto-dismiss
            if (duration > 0) {
                setTimeout(() => this.hide(toast), duration);
            }

            return toast;
        },
        
        hide(toast) {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        },
        
        success(title, message) {
            return this.show('success', title, message);
        },
        
        error(title, message) {
            return this.show('error', title, message);
        },
        
        warning(title, message) {
            return this.show('warning', title, message);
        },
        
        info(title, message) {
            return this.show('info', title, message);
        }
    },

    // Modal Management
    modal: {
        overlay: null,
        modal: null,
        titleEl: null,
        bodyEl: null,
        footerEl: null,
        
        init() {
            this.overlay = document.getElementById('modal-overlay');
            this.modal = document.getElementById('modal');
            this.titleEl = document.getElementById('modal-title');
            this.bodyEl = document.getElementById('modal-body');
            this.footerEl = document.getElementById('modal-footer');
            
            // Close handlers
            document.getElementById('modal-close').addEventListener('click', () => this.close());
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
            
            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
                    this.close();
                }
            });
        },
        
        open(title, bodyContent, footerContent = '', size = '') {
            this.titleEl.textContent = title;
            this.bodyEl.innerHTML = bodyContent;
            this.footerEl.innerHTML = footerContent;
            
            this.modal.className = 'modal' + (size ? ` modal-${size}` : '');
            this.overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        },
        
        close() {
            this.overlay.classList.remove('open');
            document.body.style.overflow = '';
        },
        
        confirm(title, message, onConfirm, confirmText = 'Confirm', confirmClass = 'btn-primary') {
            const body = `<p style="color: var(--gray-300); font-size: 14px;">${message}</p>`;
            const footer = `
                <button class="btn btn-secondary" id="modal-cancel-btn" data-testid="button-modal-cancel">Cancel</button>
                <button class="btn ${confirmClass}" id="modal-confirm-btn" data-testid="button-modal-confirm">${confirmText}</button>
            `;
            
            this.open(title, body, footer, 'sm');
            
            document.getElementById('modal-cancel-btn').addEventListener('click', () => this.close());
            document.getElementById('modal-confirm-btn').addEventListener('click', () => {
                onConfirm();
                this.close();
            });
        }
    },

    // Chart Helpers
    charts: {
        defaultColors: [
            'rgba(91, 54, 152, 0.8)',
            'rgba(159, 122, 234, 0.8)',
            'rgba(183, 148, 244, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
        ],
        
        createLineChart(canvasId, labels, datasets, options = {}) {
            const ctx = document.getElementById(canvasId);
            if (!ctx) return null;
            
            return new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: options.showLegend !== false,
                            position: 'bottom',
                            labels: { color: '#adadc0', font: { size: 12 } }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#8888a0' }
                        },
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#8888a0' },
                            beginAtZero: options.beginAtZero !== false
                        }
                    },
                    ...options
                }
            });
        },
        
        createBarChart(canvasId, labels, datasets, options = {}) {
            const ctx = document.getElementById(canvasId);
            if (!ctx) return null;
            
            return new Chart(ctx, {
                type: 'bar',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: options.showLegend !== false,
                            position: 'bottom',
                            labels: { color: '#adadc0', font: { size: 12 } }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#8888a0' }
                        },
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#8888a0' },
                            beginAtZero: true
                        }
                    },
                    ...options
                }
            });
        },
        
        createDoughnutChart(canvasId, labels, data, options = {}) {
            const ctx = document.getElementById(canvasId);
            if (!ctx) return null;
            
            return new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: options.colors || this.defaultColors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: options.showLegend !== false,
                            position: 'right',
                            labels: { color: '#adadc0', font: { size: 12 } }
                        }
                    },
                    cutout: options.cutout || '60%',
                    ...options
                }
            });
        }
    },

    // Export Functions
    export: {
        // Generate PDF using browser's print functionality
        generatePDF(title, content) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                        h1 { color: #5b3698; border-bottom: 2px solid #5b3698; padding-bottom: 10px; }
                        h2 { color: #4c2d7f; margin-top: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background: #f3eef8; color: #5b3698; }
                        .header { display: flex; justify-content: space-between; align-items: center; }
                        .header img { height: 50px; }
                        .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
                        .footer { margin-top: 40px; text-align: center; color: #888; font-size: 11px; }
                        .grade-a { color: #059669; font-weight: bold; }
                        .grade-b { color: #2563eb; font-weight: bold; }
                        .grade-c { color: #d97706; font-weight: bold; }
                        .grade-d { color: #fb923c; font-weight: bold; }
                        .grade-f { color: #dc2626; font-weight: bold; }
                        .present { color: #059669; }
                        .absent { color: #dc2626; }
                        .late { color: #d97706; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>AMAL-NAMA</h1>
                        <div class="meta">Generated: ${new Date().toLocaleString()}</div>
                    </div>
                    <h2>${title}</h2>
                    ${content}
                    <div class="footer">
                        AMAL-NAMA - Student Attendance & Result Management System<br>
                        This is an official document. Any tampering is punishable.
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            // Wait for content to load then print
            setTimeout(() => {
                printWindow.print();
            }, 500);
        },

        // Generate CSV/Excel
        generateCSV(headers, rows, filename) {
            let csvContent = headers.join(',') + '\n';
            
            rows.forEach(row => {
                const rowData = row.map(cell => {
                    // Escape commas and quotes
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                        return `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell;
                });
                csvContent += rowData.join(',') + '\n';
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}.csv`;
            link.click();
        },

        // Generate attendance report
        attendanceReport(courseId, startDate = null, endDate = null) {
            const course = DataManager.courses.getById(courseId);
            if (!course) return;
            
            const attendance = DataManager.attendance.getByCourse(courseId);
            const students = course.students.map(id => DataManager.users.getById(id)).filter(Boolean);
            
            // Get unique dates
            let dates = [...new Set(attendance.map(a => a.date))].sort();
            
            if (startDate) dates = dates.filter(d => d >= startDate);
            if (endDate) dates = dates.filter(d => d <= endDate);
            
            // Build HTML table
            let tableHtml = '<table><thead><tr><th>Roll No</th><th>Student Name</th>';
            dates.forEach(date => {
                tableHtml += `<th>${DataManager.formatDate(date, 'short')}</th>`;
            });
            tableHtml += '<th>Percentage</th></tr></thead><tbody>';
            
            students.forEach(student => {
                tableHtml += `<tr><td>${student.id}</td><td>${student.name}</td>`;
                
                dates.forEach(date => {
                    const record = attendance.find(a => a.studentId === student.id && a.date === date);
                    const status = record ? record.status : '-';
                    const statusClass = record ? record.status : '';
                    tableHtml += `<td class="${statusClass}">${status.charAt(0).toUpperCase()}</td>`;
                });
                
                const percentage = DataManager.attendance.calculatePercentage(student.id, courseId);
                tableHtml += `<td><strong>${percentage}%</strong></td></tr>`;
            });
            
            tableHtml += '</tbody></table>';
            
            this.generatePDF(`Attendance Report - ${course.name} (${course.code})`, tableHtml);
        },

        // Generate grade report / transcript
        gradeReport(studentId) {
            const student = DataManager.users.getById(studentId);
            if (!student) return;
            
            const courses = DataManager.courses.getByStudent(studentId);
            
            let content = `
                <div class="meta">
                    <strong>Student Name:</strong> ${student.name}<br>
                    <strong>Roll Number:</strong> ${student.id}<br>
                    <strong>Program:</strong> ${student.program || 'N/A'}<br>
                    <strong>Semester:</strong> ${student.semester || 'N/A'}
                </div>
            `;
            
            courses.forEach(course => {
                const grades = DataManager.grades.getByStudentAndCourse(studentId, course.id);
                const totalPercentage = DataManager.grades.calculateCourseTotal(studentId, course.id);
                const letterGrade = DataManager.grades.calculateLetterGrade(totalPercentage);
                
                content += `
                    <h3>${course.name} (${course.code})</h3>
                    <table>
                        <thead>
                            <tr><th>Assessment</th><th>Weight</th><th>Max Marks</th><th>Obtained</th><th>Percentage</th></tr>
                        </thead>
                        <tbody>
                `;
                
                grades.forEach(g => {
                    content += `
                        <tr>
                            <td>${g.assessmentType}</td>
                            <td>${g.weight}%</td>
                            <td>${g.maxMarks}</td>
                            <td>${g.obtainedMarks}</td>
                            <td>${g.percentage.toFixed(1)}%</td>
                        </tr>
                    `;
                });
                
                const gradeClass = letterGrade.startsWith('A') ? 'grade-a' : 
                                   letterGrade.startsWith('B') ? 'grade-b' :
                                   letterGrade.startsWith('C') ? 'grade-c' :
                                   letterGrade === 'D' ? 'grade-d' : 'grade-f';
                
                content += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4"><strong>Total</strong></td>
                                <td><strong class="${gradeClass}">${totalPercentage.toFixed(1)}% (${letterGrade})</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                `;
            });
            
            const cgpa = DataManager.grades.calculateCGPA(studentId);
            content += `<h3>Cumulative GPA: <span style="color: #5b3698;">${cgpa}</span></h3>`;
            
            this.generatePDF(`Academic Transcript - ${student.name} (${student.id})`, content);
        },

        // Export course grades as CSV
        courseGradesCSV(courseId) {
            const course = DataManager.courses.getById(courseId);
            if (!course) return;
            
            const students = course.students.map(id => DataManager.users.getById(id)).filter(Boolean);
            const assessmentTypes = [...new Set(DataManager.grades.getByCourse(courseId).map(g => g.assessmentType))];
            
            const headers = ['Roll No', 'Student Name', ...assessmentTypes, 'Total %', 'Grade'];
            
            const rows = students.map(student => {
                const row = [student.id, student.name];
                
                assessmentTypes.forEach(type => {
                    const grade = DataManager.grades.getByStudentAndCourse(student.id, courseId)
                        .find(g => g.assessmentType === type);
                    row.push(grade ? `${grade.obtainedMarks}/${grade.maxMarks}` : '-');
                });
                
                const totalPercentage = DataManager.grades.calculateCourseTotal(student.id, courseId);
                const letterGrade = DataManager.grades.calculateLetterGrade(totalPercentage);
                
                row.push(totalPercentage.toFixed(1));
                row.push(letterGrade);
                
                return row;
            });
            
            this.generateCSV(headers, rows, `${course.code}_grades_${new Date().toISOString().split('T')[0]}`);
        },

        // Export audit log as CSV
        auditLogCSV() {
            const logs = DataManager.auditLog.getAll();
            if (logs.length === 0) {
                alert('No audit logs to export');
                return;
            }
            
            const headers = ['Timestamp', 'Action', 'User ID', 'User Name', 'Details', 'Status'];
            
            const rows = logs.map(log => [
                DataManager.formatDate(log.timestamp, 'full'),
                log.action.replace(/_/g, ' '),
                log.userId,
                log.userName,
                log.details,
                log.flagged ? 'Flagged' : 'Normal'
            ]);
            
            this.generateCSV(headers, rows, `audit_log_${new Date().toISOString().split('T')[0]}`);
        }
    },

    // Form Validation
    validation: {
        isEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        isRequired(value) {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },
        
        minLength(value, min) {
            return value && value.length >= min;
        },
        
        maxLength(value, max) {
            return !value || value.length <= max;
        },
        
        isNumber(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },
        
        inRange(value, min, max) {
            const num = parseFloat(value);
            return num >= min && num <= max;
        }
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format numbers
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },

    // Get initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    },

    // Get grade class for styling
    getGradeClass(grade) {
        if (grade.startsWith('A')) return 'grade-a';
        if (grade.startsWith('B')) return 'grade-b';
        if (grade.startsWith('C')) return 'grade-c';
        if (grade === 'D') return 'grade-d';
        return 'grade-f';
    },

    // Get attendance class for styling
    getAttendanceClass(percentage) {
        if (percentage >= 90) return 'high';
        if (percentage >= 85) return 'medium';
        return 'low';
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Backup and Restore Utilities
const BackupRestore = {
    // Create a backup of all localStorage data
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            data: {}
        };

        Object.values(DataManager.KEYS).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                backup.data[key] = data;
            }
        });

        return backup;
    },

    // Download backup as JSON file
    downloadBackup() {
        const backup = this.createBackup();
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `amal-nama-backup-${backup.timestamp.split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    },

    // Restore from backup file
    restoreFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    Object.entries(backup.data).forEach(([key, value]) => {
                        localStorage.setItem(key, value);
                    });
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    },

    // Export backup as string (for copy/paste)
    exportAsString() {
        const backup = this.createBackup();
        return JSON.stringify(backup, null, 2);
    },

    // Import from string
    importFromString(jsonString) {
        try {
            const backup = JSON.parse(jsonString);
            Object.entries(backup.data).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
};
