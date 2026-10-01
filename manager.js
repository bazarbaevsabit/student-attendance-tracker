// Панель менеджера
const Manager = {
    // Отрисовка панели менеджера
    render() {
        return `
            <div class="manager-panel">
                <div class="manager-header">
                    <h1>Таблица посещаемости</h1>
                    <div class="manager-controls">
                        <button class="btn btn-export" onclick="Manager.exportCSV()">📥 Скачать CSV</button>
                        <button class="btn btn-logout" onclick="App.logout()">Выход</button>
                    </div>
                </div>
                
                <div class="manager-container">
                    <div class="filters">
                        <label>Фильтр по группе:</label>
                        <select id="group-filter" onchange="Manager.updateDisplay()">
                            <option value="">Все группы</option>
                            ${CONFIG.groups.map(group => `
                                <option value="${group.id}">${group.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div id="attendance-table" class="attendance-table-container">
                        ${this.renderTable()}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Отрисовка таблицы
    renderTable() {
        const filterGroupId = document.getElementById('group-filter')?.value || '';
        const attendanceData = Storage.getAll();
        
        let html = '<table class="attendance-table"><thead><tr><th>Группа</th><th>Студент</th>';
        
        // Получить все уникальные даты
        const allDates = new Set();
        for (const groupId in attendanceData) {
            if (filterGroupId && groupId !== filterGroupId) continue;
            
            for (const studentId in attendanceData[groupId]) {
                for (const date in attendanceData[groupId][studentId]) {
                    allDates.add(date);
                }
            }
        }
        
        const sortedDates = Array.from(allDates).sort().reverse();
        sortedDates.slice(0, 30).forEach(date => {
            html += `<th>${date}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        // Заполнить таблицу данными
        for (const group of CONFIG.groups) {
            if (filterGroupId && group.id !== filterGroupId) continue;
            
            for (const student of group.students) {
                const studentAttendance = Storage.getStudentAttendance(group.id, student.id);
                const absentDays = Storage.getAbsentDaysCount(group.id, student.id, CONFIG.absentDaysThreshold);
                const rowClass = absentDays > CONFIG.absentDaysThreshold ? 'absent-row' : '';
                
                html += `<tr class="${rowClass}">
                    <td class="group-cell">${group.name}</td>
                    <td class="student-cell">${student.name}</td>`;
                
                sortedDates.slice(0, 30).forEach(date => {
                    const status = studentAttendance[date];
                    const statusClass = status ? `status-${status}` : '';
                    const statusLabel = Manager.getStatusSymbol(status);
                    
                    html += `<td class="status-cell ${statusClass}">${statusLabel}</td>`;
                });
                
                html += '</tr>';
            }
        }
        
        html += '</tbody></table>';
        return html;
    },
    
    // Получить символ статуса
    getStatusSymbol(status) {
        const symbols = {
            'present': '✓',
            'absent': '✗',
            'excused': '~'
        };
        return symbols[status] || '';
    },
    
    // Экспортировать CSV
    exportCSV() {
        Storage.downloadCSV();
    },
    
    // Обновить отображение
    updateDisplay() {
        const tableContainer = document.getElementById('attendance-table');
        tableContainer.innerHTML = Manager.renderTable();
    }
};
