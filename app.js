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
                        <div class="password-input-wrapper">
                            <input type="password" id="password" name="password" required>
                            <button type="button" class="btn-toggle-password" onclick="App.togglePassword()">👁️</button>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-login">Вход</button>
                </form>
            </div>
        `;
    },
    
    // Переключение видимости пароля
    togglePassword() {
        const passwordInput = document.getElementById('password');
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
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
