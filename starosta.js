// Интерфейс для старосты
const Starosta = {
    // Отрисовка интерфейса старосты
    render(user) {
        const group = CONFIG.groups.find(g => g.id === user.groupId);
        
        return `
            <div class="starosta-panel">
                <div class="starosta-header">
                    <div>
                        <h1>${group.name}</h1>
                        <p>Старosta: ${user.name}</p>
                    </div>
                    <button class="btn btn-logout" onclick="App.logout()">Выход</button>
                </div>
                
                <div class="starosta-container">
                    <div class="date-selector">
                        <label>Дата:</label>
                        <input type="date" id="attendance-date" value="${new Date().toISOString().slice(0, 10)}" 
                               onchange="Starosta.updateDisplay()">
                    </div>
                    
                    <div id="students-list" class="students-attendance-list">
                        ${this.renderStudents(user)}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Отрисовка студентов
    renderStudents(user) {
        const group = CONFIG.groups.find(g => g.id === user.groupId);
        const date = document.getElementById('attendance-date')?.value || new Date().toISOString().slice(0, 10);
        
        return group.students.map(student => {
            const attendance = Storage.getAttendance(user.groupId, student.id, date);
            
            return `
                <div class="student-attendance-item">
                    <div class="student-info">
                        <strong>${student.name}</strong>
                    </div>
                    <div class="attendance-buttons">
                        <button class="btn btn-present ${attendance === 'present' ? 'active' : ''}" 
                                onclick="Starosta.markAttendance('${user.groupId}', '${student.id}', 'present')">
                            Присутствует
                        </button>
                        <button class="btn btn-absent ${attendance === 'absent' ? 'active' : ''}" 
                                onclick="Starosta.markAttendance('${user.groupId}', '${student.id}', 'absent')">
                            Отсутствует
                        </button>
                        <button class="btn btn-excused ${attendance === 'excused' ? 'active' : ''}" 
                                onclick="Starosta.markAttendance('${user.groupId}', '${student.id}', 'excused')">
                            Уважит. причина
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Отметить посещаемость
    markAttendance(groupId, studentId, status) {
        const date = document.getElementById('attendance-date').value;
        Storage.saveAttendance(groupId, studentId, date, status);
        Starosta.updateDisplay();
    },
    
    // Обновить отображение
    updateDisplay() {
        const user = Auth.getCurrentSession();
        const studentsList = document.getElementById('students-list');
        studentsList.innerHTML = Starosta.renderStudents(user);
    }
};
