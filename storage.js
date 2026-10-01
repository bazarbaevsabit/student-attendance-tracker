// Управление хранилищем данных (localStorage)
const Storage = {
    ATTENDANCE_KEY: 'attendance_data',
    
    // Получить все данные посещаемости
    getAll() {
        const data = localStorage.getItem(this.ATTENDANCE_KEY);
        return data ? JSON.parse(data) : {};
    },
    
    // Сохранить посещаемость студента
    saveAttendance(groupId, studentId, date, status) {
        const data = this.getAll();
        
        if (!data[groupId]) {
            data[groupId] = {};
        }
        if (!data[groupId][studentId]) {
            data[groupId][studentId] = {};
        }
        
        data[groupId][studentId][date] = status;
        localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(data));
    },
    
    // Получить посещаемость студента
    getAttendance(groupId, studentId, date) {
        const data = this.getAll();
        return data[groupId]?.[studentId]?.[date] || null;
    },
    
    // Получить все посещения студента
    getStudentAttendance(groupId, studentId) {
        const data = this.getAll();
        return data[groupId]?.[studentId] || {};
    },
    
    // Получить все посещения группы
    getGroupAttendance(groupId) {
        const data = this.getAll();
        return data[groupId] || {};
    },
    
    // Экспортировать в CSV
    exportToCSV() {
        const data = this.getAll();
        let csv = 'Группа,Студент,Дата,Статус\n';
        
        for (const groupId in data) {
            const group = CONFIG.groups.find(g => g.id === groupId);
            const groupName = group ? group.name : groupId;
            
            for (const studentId in data[groupId]) {
                const studentRecord = data[groupId][studentId];
                const student = group?.students.find(s => s.id === studentId);
                const studentName = student ? student.name : studentId;
                
                for (const date in studentRecord) {
                    const status = this.getStatusLabel(studentRecord[date]);
                    csv += `"${groupName}","${studentName}","${date}","${status}"\n`;
                }
            }
        }
        
        return csv;
    },
    
    // Получить метку статуса на русском
    getStatusLabel(status) {
        const labels = {
            'present': 'Присутствует',
            'absent': 'Отсутствует',
            'excused': 'Уважительная причина'
        };
        return labels[status] || status;
    },
    
    // Скачать CSV файл
    downloadCSV() {
        const csv = this.exportToCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // Получить количество пропусков студента за последние N дней
    getAbsentDaysCount(groupId, studentId, days = 2) {
        const attendance = this.getStudentAttendance(groupId, studentId);
        const today = new Date();
        let absentCount = 0;
        
        for (let i = 0; i <= days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().slice(0, 10);
            
            const status = attendance[dateStr];
            if (status === 'absent') {
                absentCount++;
            }
        }
        
        return absentCount;
    }
};
