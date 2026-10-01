// Главный контроллер приложения
const App = {
    // Инициализация приложения
    init() {
        this.render();
    },
    
    // Отрисовка интерфейса
    render() {
        const user = Auth.getCurrentSession();
        const app = document.getElementById('app');
        
        if (!user) {
            // Страница входа
            app.innerHTML = this.renderLoginPage();
        } else if (user.role === 'admin') {
            // Панель администратора
            app.innerHTML = Admin.render();
        } else if (user.role === 'starosta') {
            // Интерфейс старосты
            app.innerHTML = Starosta.render(user);
        } else if (user.role === 'manager') {
            // Панель менеджера
            app.innerHTML = Manager.render();
        }
    },
    
    // Отрисовка страницы входа
    renderLoginPage() {
        return `
            <div class="login-container">
                <h1 class="login-title">🎓 Система учета посещаемости</h1>
                
                <div id="login-message"></div>
                
                <form onsubmit="App.handleLogin(event)">
                    <div class="form-group">
                        <label for="login">Логин:</label>
                        <input type="text" id="login" name="login" required autofocus>
                    </div>
                    <div class="form-group">
                        <label for="password">Пароль:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-login">Вход</button>
                </form>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                    <p><strong>Тестовые учетные данные:</strong></p>
                    <p>👨‍💼 Администратор: <code>admin / 9671830Qw</code></p>
                    <p>👨‍💼 Менеджер: <code>manager / manager12</code></p>
                    <p>👤 Старosta: <code>efimov / password123</code></p>
                </div>
            </div>
        `;
    },
    
    // Обработка входа
    handleLogin(event) {
        event.preventDefault();
        
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('login-message');
        
        const result = Auth.login(login, password);
        
        if (result.success) {
            messageDiv.innerHTML = '';
            this.render();
        } else {
            messageDiv.innerHTML = `<div class="error-message">❌ ${result.error}</div>`;
        }
    },
    
    // Выход
    logout() {
        Auth.logout();
        this.render();
    }
};

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
