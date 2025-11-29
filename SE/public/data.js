/* =====================================================
   AMAL-NAMA - Data Management Module
   Handles localStorage operations and seed data
   ===================================================== */

const DataManager = {
    // Storage Keys
    KEYS: {
        USERS: 'amal_users',
        COURSES: 'amal_courses',
        ATTENDANCE: 'amal_attendance',
        GRADES: 'amal_grades',
        NOTIFICATIONS: 'amal_notifications',
        AUDIT_LOG: 'amal_audit_log',
        CURRENT_USER: 'amal_current_user',
        SEEDED: 'amal_seeded'
    },

    // Initialize storage with seed data
    init() {
        if (!this.get(this.KEYS.SEEDED)) {
            this.seedData();
            this.set(this.KEYS.SEEDED, true);
        }
    },

    // Generic localStorage operations
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    // Generate unique ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Format date for display
    formatDate(date, format = 'short') {
        const d = new Date(date);
        if (format === 'short') {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else if (format === 'time') {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (format === 'full') {
            return d.toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
        return d.toISOString().split('T')[0];
    },

    // Get relative time
    getRelativeTime(date) {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return this.formatDate(date, 'short');
    },

    // Seed demo data
    seedData() {
        // Users (Admin, Teachers, Students)
        const users = [
            // Admin
            {
                id: 'A-0001',
                name: 'Dr. Ahmed Khan',
                email: 'admin@university.edu',
                password: 'admin123',
                role: 'admin',
                department: 'Administration',
                phone: '+92-300-1234567',
                createdAt: '2024-01-01T00:00:00Z'
            },
            // Teachers
            {
                id: 'T-5678',
                name: 'Prof. Sarah Ahmed',
                email: 'sarah.ahmed@university.edu',
                password: 'teacher123',
                role: 'teacher',
                department: 'Computer Science',
                phone: '+92-300-2345678',
                courses: ['CS-101', 'CS-201'],
                createdAt: '2024-01-15T00:00:00Z'
            },
            {
                id: 'T-5679',
                name: 'Dr. Ali Hassan',
                email: 'ali.hassan@university.edu',
                password: 'teacher123',
                role: 'teacher',
                department: 'Computer Science',
                phone: '+92-300-3456789',
                courses: ['CS-301', 'CS-401'],
                createdAt: '2024-01-15T00:00:00Z'
            },
            {
                id: 'T-5680',
                name: 'Ms. Fatima Zaidi',
                email: 'fatima.zaidi@university.edu',
                password: 'teacher123',
                role: 'teacher',
                department: 'Mathematics',
                phone: '+92-300-4567890',
                courses: ['MATH-101', 'MATH-201'],
                createdAt: '2024-01-20T00:00:00Z'
            },
            // Students
            {
                id: '21K-1234',
                name: 'Ali Ibrahim',
                email: 'ali.ibrahim@student.edu',
                password: 'student123',
                role: 'student',
                program: 'BSCS',
                semester: 5,
                section: 'A',
                enrolledCourses: ['CS-301', 'CS-401', 'MATH-201'],
                cgpa: 3.45,
                createdAt: '2024-02-01T00:00:00Z'
            },
            {
                id: '21K-1235',
                name: 'Azka Faisal',
                email: 'azka.faisal@student.edu',
                password: 'student123',
                role: 'student',
                program: 'BSCS',
                semester: 5,
                section: 'A',
                enrolledCourses: ['CS-301', 'CS-401', 'MATH-201'],
                cgpa: 3.72,
                createdAt: '2024-02-01T00:00:00Z'
            },
            {
                id: '21K-1236',
                name: 'Misbah Irfan',
                email: 'misbah.irfan@student.edu',
                password: 'student123',
                role: 'student',
                program: 'BSCS',
                semester: 5,
                section: 'A',
                enrolledCourses: ['CS-301', 'CS-401', 'MATH-201'],
                cgpa: 3.58,
                createdAt: '2024-02-01T00:00:00Z'
            },
            {
                id: '22K-3001',
                name: 'Hassan Ali',
                email: 'hassan.ali@student.edu',
                password: 'student123',
                role: 'student',
                program: 'BSCS',
                semester: 3,
                section: 'B',
                enrolledCourses: ['CS-201', 'MATH-101'],
                cgpa: 3.21,
                createdAt: '2024-02-05T00:00:00Z'
            },
            {
                id: '22K-3002',
                name: 'Ayesha Khan',
                email: 'ayesha.khan@student.edu',
                password: 'student123',
                role: 'student',
                program: 'BSCS',
                semester: 3,
                section: 'B',
                enrolledCourses: ['CS-201', 'MATH-101'],
                cgpa: 3.89,
                createdAt: '2024-02-05T00:00:00Z'
            },
            {
                id: '23K-5001',
                name: 'Bilal Ahmed',
                email: 'bilal.ahmed@student.edu',
                password: 'student123',
                role: 'student',
                program: 'BSCS',
                semester: 1,
                section: 'A',
                enrolledCourses: ['CS-101', 'MATH-101'],
                cgpa: 0,
                createdAt: '2024-02-10T00:00:00Z'
            },
            {
                id: '23K-5002',
                name: 'Zara Malik',
                email: 'zara.malik@student.edu',
                password: 'student123',
                role: 'student',
                program: 'BSCS',
                semester: 1,
                section: 'A',
                enrolledCourses: ['CS-101', 'MATH-101'],
                cgpa: 0,
                createdAt: '2024-02-10T00:00:00Z'
            }
        ];

        // Courses
        const courses = [
            {
                id: 'CS-101',
                name: 'Introduction to Computing',
                code: 'CS-101',
                creditHours: 3,
                teacherId: 'T-5678',
                teacherName: 'Prof. Sarah Ahmed',
                department: 'Computer Science',
                semester: 1,
                students: ['23K-5001', '23K-5002'],
                schedule: 'Mon, Wed 9:00 AM - 10:30 AM',
                room: 'CS-Lab 1'
            },
            {
                id: 'CS-201',
                name: 'Data Structures',
                code: 'CS-201',
                creditHours: 4,
                teacherId: 'T-5678',
                teacherName: 'Prof. Sarah Ahmed',
                department: 'Computer Science',
                semester: 3,
                students: ['22K-3001', '22K-3002'],
                schedule: 'Tue, Thu 11:00 AM - 12:30 PM',
                room: 'CS-Lab 2'
            },
            {
                id: 'CS-301',
                name: 'Database Systems',
                code: 'CS-301',
                creditHours: 3,
                teacherId: 'T-5679',
                teacherName: 'Dr. Ali Hassan',
                department: 'Computer Science',
                semester: 5,
                students: ['21K-1234', '21K-1235', '21K-1236'],
                schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
                room: 'CS-Lab 3'
            },
            {
                id: 'CS-401',
                name: 'Software Engineering',
                code: 'CS-401',
                creditHours: 3,
                teacherId: 'T-5679',
                teacherName: 'Dr. Ali Hassan',
                department: 'Computer Science',
                semester: 5,
                students: ['21K-1234', '21K-1235', '21K-1236'],
                schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
                room: 'Room 301'
            },
            {
                id: 'MATH-101',
                name: 'Calculus I',
                code: 'MATH-101',
                creditHours: 3,
                teacherId: 'T-5680',
                teacherName: 'Ms. Fatima Zaidi',
                department: 'Mathematics',
                semester: 1,
                students: ['22K-3001', '22K-3002', '23K-5001', '23K-5002'],
                schedule: 'Mon, Wed, Fri 10:00 AM - 11:00 AM',
                room: 'Room 201'
            },
            {
                id: 'MATH-201',
                name: 'Linear Algebra',
                code: 'MATH-201',
                creditHours: 3,
                teacherId: 'T-5680',
                teacherName: 'Ms. Fatima Zaidi',
                department: 'Mathematics',
                semester: 3,
                students: ['21K-1234', '21K-1235', '21K-1236'],
                schedule: 'Tue, Thu 10:00 AM - 11:30 AM',
                room: 'Room 202'
            }
        ];

        // Generate attendance records for the past 30 days
        const attendance = [];
        const today = new Date();
        const studentIds = ['21K-1234', '21K-1235', '21K-1236', '22K-3001', '22K-3002', '23K-5001', '23K-5002'];
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            const dateStr = date.toISOString().split('T')[0];
            
            courses.forEach(course => {
                course.students.forEach(studentId => {
                    // Generate random attendance (85% present rate on average, some variations)
                    const rand = Math.random();
                    let status;
                    if (studentId === '21K-1234') {
                        // Ali has lower attendance (around 82%)
                        status = rand < 0.78 ? 'present' : (rand < 0.92 ? 'absent' : 'late');
                    } else if (studentId === '21K-1235') {
                        // Azka has excellent attendance (95%)
                        status = rand < 0.93 ? 'present' : (rand < 0.97 ? 'late' : 'absent');
                    } else {
                        // Others have average attendance (88%)
                        status = rand < 0.85 ? 'present' : (rand < 0.95 ? 'absent' : 'late');
                    }
                    
                    attendance.push({
                        id: this.generateId('att'),
                        studentId,
                        courseId: course.id,
                        date: dateStr,
                        status,
                        markedBy: course.teacherId,
                        markedAt: date.toISOString(),
                        notes: status === 'late' ? 'Arrived 10 minutes late' : ''
                    });
                });
            });
        }

        // Grades with weighted assessments
        const grades = [];
        const assessmentTypes = [
            { type: 'Quiz 1', weight: 5, maxMarks: 10 },
            { type: 'Quiz 2', weight: 5, maxMarks: 10 },
            { type: 'Quiz 3', weight: 5, maxMarks: 10 },
            { type: 'Assignment 1', weight: 5, maxMarks: 20 },
            { type: 'Assignment 2', weight: 5, maxMarks: 20 },
            { type: 'Assignment 3', weight: 5, maxMarks: 20 },
            { type: 'Midterm', weight: 25, maxMarks: 50 },
            { type: 'Final', weight: 45, maxMarks: 100 }
        ];

        courses.forEach(course => {
            course.students.forEach(studentId => {
                const student = users.find(u => u.id === studentId);
                const basePerformance = student ? (student.cgpa / 4) * 0.85 + 0.15 : 0.75;
                
                assessmentTypes.forEach(assessment => {
                    // Vary performance per assessment
                    const variance = (Math.random() - 0.5) * 0.3;
                    const performance = Math.min(1, Math.max(0.4, basePerformance + variance));
                    const obtainedMarks = Math.round(assessment.maxMarks * performance);
                    
                    grades.push({
                        id: this.generateId('grade'),
                        studentId,
                        courseId: course.id,
                        assessmentType: assessment.type,
                        weight: assessment.weight,
                        maxMarks: assessment.maxMarks,
                        obtainedMarks,
                        percentage: (obtainedMarks / assessment.maxMarks) * 100,
                        postedBy: course.teacherId,
                        postedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
                    });
                });
            });
        });

        // Notifications
        const notifications = [
            {
                id: this.generateId('notif'),
                userId: '21K-1234',
                type: 'warning',
                title: 'Low Attendance Alert',
                message: 'Your attendance in CS-301 has dropped to 82%. Please maintain at least 85% attendance.',
                read: false,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('notif'),
                userId: '21K-1234',
                type: 'info',
                title: 'New Grade Posted',
                message: 'Midterm marks for CS-401 (Software Engineering) have been posted. Check your results.',
                read: false,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('notif'),
                userId: '21K-1234',
                type: 'success',
                title: 'Assignment Graded',
                message: 'Your Assignment 2 in MATH-201 has been graded. You scored 18/20.',
                read: true,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('notif'),
                userId: 'T-5679',
                type: 'info',
                title: 'Pending Attendance',
                message: 'You have not marked attendance for CS-301 today.',
                read: false,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('notif'),
                userId: 'T-5679',
                type: 'warning',
                title: 'Student At Risk',
                message: 'Ali Ibrahim (21K-1234) attendance has dropped below 85% in CS-301.',
                read: false,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('notif'),
                userId: 'A-0001',
                type: 'danger',
                title: 'Policy Violation',
                message: 'Multiple students have attendance below 80% in CS-301. Review required.',
                read: false,
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            }
        ];

        // Audit Log
        const auditLog = [
            {
                id: this.generateId('audit'),
                action: 'ATTENDANCE_MARKED',
                userId: 'T-5679',
                userName: 'Dr. Ali Hassan',
                details: 'Marked attendance for CS-301 - 3 students present',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('audit'),
                action: 'GRADE_POSTED',
                userId: 'T-5679',
                userName: 'Dr. Ali Hassan',
                details: 'Posted Midterm grades for CS-401',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('audit'),
                action: 'USER_LOGIN',
                userId: 'A-0001',
                userName: 'Dr. Ahmed Khan',
                details: 'Admin logged in from 192.168.1.100',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId('audit'),
                action: 'GRADE_MODIFIED',
                userId: 'T-5680',
                userName: 'Ms. Fatima Zaidi',
                details: 'Modified Quiz 2 grade for student 22K-3001 in MATH-101',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                flagged: true
            }
        ];

        // Save all data
        this.set(this.KEYS.USERS, users);
        this.set(this.KEYS.COURSES, courses);
        this.set(this.KEYS.ATTENDANCE, attendance);
        this.set(this.KEYS.GRADES, grades);
        this.set(this.KEYS.NOTIFICATIONS, notifications);
        this.set(this.KEYS.AUDIT_LOG, auditLog);
    },

    // User Management
    users: {
        getAll() {
            return DataManager.get(DataManager.KEYS.USERS, []);
        },
        
        getById(id) {
            const users = this.getAll();
            return users.find(u => u.id === id);
        },
        
        getByRole(role) {
            const users = this.getAll();
            return users.filter(u => u.role === role);
        },
        
        authenticate(id, password) {
            const users = this.getAll();
            return users.find(u => u.id === id && u.password === password);
        },
        
        create(userData) {
            const users = this.getAll();
            const newUser = {
                ...userData,
                id: userData.id || DataManager.generateId('user'),
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            DataManager.set(DataManager.KEYS.USERS, users);
            return newUser;
        },
        
        update(id, updates) {
            const users = this.getAll();
            const index = users.findIndex(u => u.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], ...updates };
                DataManager.set(DataManager.KEYS.USERS, users);
                return users[index];
            }
            return null;
        },
        
        delete(id) {
            const users = this.getAll();
            const filtered = users.filter(u => u.id !== id);
            DataManager.set(DataManager.KEYS.USERS, filtered);
        }
    },

    // Course Management
    courses: {
        getAll() {
            return DataManager.get(DataManager.KEYS.COURSES, []);
        },
        
        getById(id) {
            const courses = this.getAll();
            return courses.find(c => c.id === id);
        },
        
        getByTeacher(teacherId) {
            const courses = this.getAll();
            return courses.filter(c => c.teacherId === teacherId);
        },
        
        getByStudent(studentId) {
            const courses = this.getAll();
            return courses.filter(c => c.students && c.students.includes(studentId));
        },
        
        create(courseData) {
            const courses = this.getAll();
            const newCourse = {
                ...courseData,
                id: courseData.id || courseData.code,
                students: courseData.students || []
            };
            courses.push(newCourse);
            DataManager.set(DataManager.KEYS.COURSES, courses);
            return newCourse;
        },
        
        update(id, updates) {
            const courses = this.getAll();
            const index = courses.findIndex(c => c.id === id);
            if (index !== -1) {
                courses[index] = { ...courses[index], ...updates };
                DataManager.set(DataManager.KEYS.COURSES, courses);
                return courses[index];
            }
            return null;
        },
        
        delete(id) {
            const courses = this.getAll();
            const filtered = courses.filter(c => c.id !== id);
            DataManager.set(DataManager.KEYS.COURSES, filtered);
        },
        
        enrollStudent(courseId, studentId) {
            const courses = this.getAll();
            const course = courses.find(c => c.id === courseId);
            if (course && !course.students.includes(studentId)) {
                course.students.push(studentId);
                DataManager.set(DataManager.KEYS.COURSES, courses);
            }
        },
        
        unenrollStudent(courseId, studentId) {
            const courses = this.getAll();
            const course = courses.find(c => c.id === courseId);
            if (course) {
                course.students = course.students.filter(s => s !== studentId);
                DataManager.set(DataManager.KEYS.COURSES, courses);
            }
        }
    },

    // Attendance Management
    attendance: {
        getAll() {
            return DataManager.get(DataManager.KEYS.ATTENDANCE, []);
        },
        
        getByStudent(studentId) {
            const attendance = this.getAll();
            return attendance.filter(a => a.studentId === studentId);
        },
        
        getByCourse(courseId) {
            const attendance = this.getAll();
            return attendance.filter(a => a.courseId === courseId);
        },
        
        getByDate(date) {
            const attendance = this.getAll();
            return attendance.filter(a => a.date === date);
        },
        
        getForCourseAndDate(courseId, date) {
            const attendance = this.getAll();
            return attendance.filter(a => a.courseId === courseId && a.date === date);
        },
        
        mark(studentId, courseId, date, status, markedBy, notes = '') {
            const attendance = this.getAll();
            
            // Check if already exists
            const existingIndex = attendance.findIndex(
                a => a.studentId === studentId && a.courseId === courseId && a.date === date
            );
            
            const record = {
                id: DataManager.generateId('att'),
                studentId,
                courseId,
                date,
                status,
                markedBy,
                markedAt: new Date().toISOString(),
                notes
            };
            
            if (existingIndex !== -1) {
                record.id = attendance[existingIndex].id;
                attendance[existingIndex] = record;
            } else {
                attendance.push(record);
            }
            
            DataManager.set(DataManager.KEYS.ATTENDANCE, attendance);
            
            // Check for low attendance and create notification if needed
            this.checkAttendanceThreshold(studentId, courseId);
            
            return record;
        },
        
        markBulk(courseId, date, attendanceData, markedBy) {
            attendanceData.forEach(item => {
                this.mark(item.studentId, courseId, date, item.status, markedBy, item.notes || '');
            });
        },
        
        calculatePercentage(studentId, courseId = null) {
            let records = this.getByStudent(studentId);
            if (courseId) {
                records = records.filter(a => a.courseId === courseId);
            }
            
            if (records.length === 0) return 100;
            
            const present = records.filter(a => a.status === 'present' || a.status === 'late').length;
            return Math.round((present / records.length) * 100);
        },
        
        checkAttendanceThreshold(studentId, courseId) {
            const percentage = this.calculatePercentage(studentId, courseId);
            const thresholds = [90, 87, 85, 80];
            
            thresholds.forEach(threshold => {
                if (percentage <= threshold && percentage > threshold - 3) {
                    const student = DataManager.users.getById(studentId);
                    const course = DataManager.courses.getById(courseId);
                    
                    DataManager.notifications.create({
                        userId: studentId,
                        type: percentage <= 85 ? 'danger' : 'warning',
                        title: 'Low Attendance Alert',
                        message: `Your attendance in ${course.name} is ${percentage}%. ${percentage <= 85 ? 'Immediate action required!' : 'Please maintain regular attendance.'}`
                    });
                    
                    // Also notify teacher
                    DataManager.notifications.create({
                        userId: course.teacherId,
                        type: 'warning',
                        title: 'Student At Risk',
                        message: `${student.name} (${studentId}) attendance in ${course.name} has dropped to ${percentage}%.`
                    });

                    // Send email alert for critical threshold
                    if (percentage <= 85 && student.email) {
                        DataManager.emailService.sendCriticalAttendanceAlert(student.email, {
                            studentName: student.name,
                            courseName: course.name,
                            attendance: percentage
                        });
                    }
                }
            });
        },

        
        getStats(studentId = null, courseId = null) {
            let records = this.getAll();
            
            if (studentId) {
                records = records.filter(a => a.studentId === studentId);
            }
            if (courseId) {
                records = records.filter(a => a.courseId === courseId);
            }
            
            const total = records.length;
            const present = records.filter(a => a.status === 'present').length;
            const absent = records.filter(a => a.status === 'absent').length;
            const late = records.filter(a => a.status === 'late').length;
            
            return {
                total,
                present,
                absent,
                late,
                percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 100
            };
        }
    },

    // Grade Management
    grades: {
        getAll() {
            return DataManager.get(DataManager.KEYS.GRADES, []);
        },
        
        getByStudent(studentId) {
            const grades = this.getAll();
            return grades.filter(g => g.studentId === studentId);
        },
        
        getByCourse(courseId) {
            const grades = this.getAll();
            return grades.filter(g => g.courseId === courseId);
        },
        
        getByStudentAndCourse(studentId, courseId) {
            const grades = this.getAll();
            return grades.filter(g => g.studentId === studentId && g.courseId === courseId);
        },
        
        add(gradeData) {
            const grades = this.getAll();
            const newGrade = {
                ...gradeData,
                id: DataManager.generateId('grade'),
                percentage: (gradeData.obtainedMarks / gradeData.maxMarks) * 100,
                postedAt: new Date().toISOString()
            };
            grades.push(newGrade);
            DataManager.set(DataManager.KEYS.GRADES, grades);
            
            // Create notification for student
            const course = DataManager.courses.getById(gradeData.courseId);
            DataManager.notifications.create({
                userId: gradeData.studentId,
                type: 'info',
                title: 'New Grade Posted',
                message: `${gradeData.assessmentType} marks for ${course.name} have been posted.`
            });
            
            return newGrade;
        },
        
        update(id, updates) {
            const grades = this.getAll();
            const index = grades.findIndex(g => g.id === id);
            if (index !== -1) {
                grades[index] = { 
                    ...grades[index], 
                    ...updates,
                    percentage: updates.obtainedMarks ? (updates.obtainedMarks / grades[index].maxMarks) * 100 : grades[index].percentage
                };
                DataManager.set(DataManager.KEYS.GRADES, grades);
                return grades[index];
            }
            return null;
        },
        
        calculateCourseTotal(studentId, courseId) {
            const grades = this.getByStudentAndCourse(studentId, courseId);
            
            let totalWeightedScore = 0;
            let totalWeight = 0;
            
            grades.forEach(g => {
                const weightedScore = (g.obtainedMarks / g.maxMarks) * g.weight;
                totalWeightedScore += weightedScore;
                totalWeight += g.weight;
            });
            
            return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
        },
        
        calculateLetterGrade(percentage) {
            if (percentage >= 90) return 'A+';
            if (percentage >= 85) return 'A';
            if (percentage >= 80) return 'A-';
            if (percentage >= 75) return 'B+';
            if (percentage >= 70) return 'B';
            if (percentage >= 65) return 'B-';
            if (percentage >= 60) return 'C+';
            if (percentage >= 55) return 'C';
            if (percentage >= 50) return 'C-';
            if (percentage >= 45) return 'D';
            return 'F';
        },
        
        getGradePoints(letterGrade) {
            const gradePoints = {
                'A+': 4.0, 'A': 4.0, 'A-': 3.7,
                'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                'D': 1.0, 'F': 0.0
            };
            return gradePoints[letterGrade] || 0;
        },
        
        calculateCGPA(studentId) {
            const studentCourses = DataManager.courses.getByStudent(studentId);
            let totalPoints = 0;
            let totalCredits = 0;
            
            studentCourses.forEach(course => {
                const percentage = this.calculateCourseTotal(studentId, course.id);
                const letterGrade = this.calculateLetterGrade(percentage);
                const gradePoints = this.getGradePoints(letterGrade);
                
                totalPoints += gradePoints * course.creditHours;
                totalCredits += course.creditHours;
            });
            
            return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
        },
        
        getCourseStats(courseId) {
            const course = DataManager.courses.getById(courseId);
            if (!course) return null;
            
            const studentTotals = course.students.map(studentId => {
                return this.calculateCourseTotal(studentId, courseId);
            });
            
            if (studentTotals.length === 0) return { average: 0, highest: 0, lowest: 0 };
            
            return {
                average: Math.round(studentTotals.reduce((a, b) => a + b, 0) / studentTotals.length),
                highest: Math.round(Math.max(...studentTotals)),
                lowest: Math.round(Math.min(...studentTotals))
            };
        }
    },

    // Notifications
    notifications: {
        getAll() {
            return DataManager.get(DataManager.KEYS.NOTIFICATIONS, []);
        },
        
        getByUser(userId) {
            const notifications = this.getAll();
            return notifications.filter(n => n.userId === userId).sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        },
        
        getUnreadCount(userId) {
            const notifications = this.getByUser(userId);
            return notifications.filter(n => !n.read).length;
        },
        
        create(notificationData) {
            const notifications = this.getAll();
            const newNotification = {
                ...notificationData,
                id: DataManager.generateId('notif'),
                read: false,
                createdAt: new Date().toISOString()
            };
            notifications.push(newNotification);
            DataManager.set(DataManager.KEYS.NOTIFICATIONS, notifications);
            return newNotification;
        },
        
        markAsRead(id) {
            const notifications = this.getAll();
            const index = notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                notifications[index].read = true;
                DataManager.set(DataManager.KEYS.NOTIFICATIONS, notifications);
            }
        },
        
        markAllAsRead(userId) {
            const notifications = this.getAll();
            notifications.forEach(n => {
                if (n.userId === userId) {
                    n.read = true;
                }
            });
            DataManager.set(DataManager.KEYS.NOTIFICATIONS, notifications);
        },
        
        delete(id) {
            const notifications = this.getAll();
            const filtered = notifications.filter(n => n.id !== id);
            DataManager.set(DataManager.KEYS.NOTIFICATIONS, filtered);
        }
    },

    // Audit Log
    auditLog: {
        getAll() {
            return DataManager.get(DataManager.KEYS.AUDIT_LOG, []).sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        },
        
        add(action, userId, userName, details, flagged = false) {
            const logs = DataManager.get(DataManager.KEYS.AUDIT_LOG, []);
            const newLog = {
                id: DataManager.generateId('audit'),
                action,
                userId,
                userName,
                details,
                flagged,
                timestamp: new Date().toISOString()
            };
            logs.push(newLog);
            DataManager.set(DataManager.KEYS.AUDIT_LOG, logs);
            return newLog;
        },
        
        getFlagged() {
            const logs = this.getAll();
            return logs.filter(l => l.flagged);
        },
        
        search(query) {
            const logs = this.getAll();
            const lowerQuery = query.toLowerCase();
            return logs.filter(l => 
                l.action.toLowerCase().includes(lowerQuery) ||
                l.userName.toLowerCase().includes(lowerQuery) ||
                l.details.toLowerCase().includes(lowerQuery)
            );
        }
    },

    // Email Service for alerts
    emailService: {
        async sendCriticalAttendanceAlert(studentEmail, data) {
            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: studentEmail,
                        subject: 'Critical Attendance Alert - AMAL-NAMA',
                        type: 'critical-attendance',
                        data
                    })
                });
                return response.ok;
            } catch (e) {
                console.error('Email service error:', e);
                return false;
            }
        },

        async sendGradeNotification(studentEmail, data) {
            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: studentEmail,
                        subject: 'New Grade Posted - AMAL-NAMA',
                        type: 'grade-notification',
                        data
                    })
                });
                return response.ok;
            } catch (e) {
                console.error('Email service error:', e);
                return false;
            }
        }
    },

    // Search and Filter utility
    search: {
        filterTable(data, fields, query) {
            const lowerQuery = query.toLowerCase();
            return data.filter(item =>
                fields.some(field => {
                    const value = this.getNestedValue(item, field);
                    return value && value.toString().toLowerCase().includes(lowerQuery);
                })
            );
        },

        getNestedValue(obj, path) {
            return path.split('.').reduce((current, prop) => current?.[prop], obj);
        },

        sortData(data, field, order = 'asc') {
            return [...data].sort((a, b) => {
                const aVal = this.getNestedValue(a, field);
                const bVal = this.getNestedValue(b, field);
                if (aVal < bVal) return order === 'asc' ? -1 : 1;
                if (aVal > bVal) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }
    },

    // Session Management
    session: {
        login(user) {
            DataManager.set(DataManager.KEYS.CURRENT_USER, user);
            DataManager.auditLog.add('USER_LOGIN', user.id, user.name, `${user.role} logged in`);
        },
        
        logout() {
            const user = this.getCurrentUser();
            if (user) {
                DataManager.auditLog.add('USER_LOGOUT', user.id, user.name, `${user.role} logged out`);
            }
            DataManager.remove(DataManager.KEYS.CURRENT_USER);
        },
        
        getCurrentUser() {
            return DataManager.get(DataManager.KEYS.CURRENT_USER);
        },
        
        isLoggedIn() {
            return this.getCurrentUser() !== null;
        }
    },

    // Reset all data (for testing)
    resetData() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.seedData();
        this.set(this.KEYS.SEEDED, true);
    }
};

// Initialize data on load
DataManager.init();
