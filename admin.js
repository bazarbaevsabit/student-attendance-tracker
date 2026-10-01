// Панель администратора
const Admin = {
    // Отрисовка панели администратора
    render() {
        return `
            <div class="admin-panel">
                <div class="admin-header">
                    <h1>Панель администратора</h1>
                    <button class="btn btn-logout" onclick="App.logout()">Выход</button>
                </div>
                
                <div class="admin-container">
                    <div class="admin-tabs">
                        <button class="tab-btn active" onclick="Admin.showTab('groups')">Группы и студенты</button>
                        <button class="tab-btn" onclick="Admin.showTab('starosts')">Старосты</button>
                    </div>
                    
                    <div id="groups-tab" class="tab-content">
                        <h2>Управление группами и студентами</h2>
                        <div id="groups-list" class="groups-list">
                            ${this.renderGroups()}
                        </div>
                    </div>
                    
                    <div id="starosts-tab" class="tab-content" style="display: none;">
                        <h2>Список старост</h2>
                        <table class="starosts-table">
                            <thead>
                                <tr>
                                    <th>Имя</th>
                                    <th>Логин</th>
                                    <th>Группа</th>
                                    <th>Пароль (по умолчанию)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderStarosts()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Отрисовка групп
    renderGroups() {
        return CONFIG.groups.map(group => `
            <div class="group-card">
                <h3>${group.name}</h3>
                <p><strong>Старosta:</strong> ${group.starosta.name}</p>
                <p><strong>Студентов:</strong> ${group.students.length}</p>
                <div class="students-list">
                    <strong>Студенты:</strong>
                    <ul>
                        ${group.students.map(student => `
                            <li>${student.name}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    },
    
    // Отрисовка старост
    renderStarosts() {
        return CONFIG.groups.map(group => `
            <tr>
                <td>${group.starosta.name}</td>
                <td><code>${group.starosta.login}</code></td>
                <td>${group.name}</td>
                <td><code>${CONFIG.defaultPassword}</code></td>
            </tr>
        `).join('');
    },
    
    // Переключение вкладок
    showTab(tabName) {
        // Скрыть все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показать выбранную вкладку
        document.getElementById(tabName + '-tab').style.display = 'block';
        event.target.classList.add('active');
    }
};
