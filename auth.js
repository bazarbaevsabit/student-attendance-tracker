// Система авторизации
const Auth = {
    SESSION_KEY: 'current_session',
    
    // Получить текущий сеанс
    getCurrentSession() {
        const session = sessionStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },
    
    // Установить сеанс
    setSession(user) {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    },
    
    // Выйти
    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
    },
    
    // Авторизоваться
    login(login, password) {
        // Проверка администратора
        if (login === CONFIG.admin.login && password === CONFIG.admin.password) {
            const user = {
                role: 'admin',
                login: login,
                name: 'Администратор'
            };
            this.setSession(user);
            return { success: true, user };
        }
        
        // Проверка менеджера
        if (login === CONFIG.manager.login && password === CONFIG.manager.password) {
            const user = {
                role: 'manager',
                login: login,
                name: 'Менеджер'
            };
            this.setSession(user);
            return { success: true, user };
        }
        
        // Проверка старост
        for (const group of CONFIG.groups) {
            if (group.starosta.login === login && password === CONFIG.defaultPassword) {
                const user = {
                    role: 'starosta',
                    login: login,
                    name: group.starosta.name,
                    groupId: group.id,
                    groupName: group.name
                };
                this.setSession(user);
                return { success: true, user };
            }
        }
        
        return { success: false, error: 'Неверный логин или пароль' };
    }
};
