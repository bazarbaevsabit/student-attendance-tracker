const API = {
  async login(login, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    return response.json();
  },

  async me() {
    const token = sessionStorage.getItem('token');
    const response = await fetch('/api/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.json();
  },

  async getGroups() {
    const token = sessionStorage.getItem('token');
    return fetch('/api/groups', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
  },

  async getAttendance(groupId) {
    const token = sessionStorage.getItem('token');
    const url = groupId ? `/api/attendance?groupId=${groupId}` : '/api/attendance';
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
  },

  async saveAttendance(payload) {
    const token = sessionStorage.getItem('token');
    return fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }
};

const App = {
  init() {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.loadUser();
    } else {
      this.renderLogin();
    }
  },

  async loadUser() {
    try {
      const user = await API.me();
      if (!user || !user.role) {
        sessionStorage.removeItem('token');
        this.renderLogin();
        return;
      }
      this.renderUser(user);
    } catch (error) {
      sessionStorage.removeItem('token');
      this.renderLogin();
    }
  },

  renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="login-box">
        <h1>Система учета посещаемости</h1>
        <div id="message"></div>
        <form id="login-form">
          <div>
            <label for="login">Логин</label>
            <input id="login" name="login" type="text" required />
          </div>
          <div>
            <label for="password">Пароль</label>
            <div class="password-wrap">
              <input id="password" name="password" type="password" required />
              <button type="button" class="toggle-password" id="toggle-password">👁️</button>
            </div>
          </div>
          <button class="login-button" type="submit">Войти</button>
        </form>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const login = document.getElementById('login').value.trim();
      const password = document.getElementById('password').value;
      const message = document.getElementById('message');

      try {
        const result = await API.login(login, password);
        if (!result.success) {
          message.innerHTML = `<div class="message error">${result.message}</div>`;
          return;
        }

        sessionStorage.setItem('token', result.token);
        this.renderUser(result.user);
      } catch (error) {
        message.innerHTML = '<div class="message error">Ошибка соединения с сервером</div>';
      }
    });

    document.getElementById('toggle-password').addEventListener('click', () => {
      const el = document.getElementById('password');
      el.type = el.type === 'password' ? 'text' : 'password';
    });
  },

  async renderUser(user) {
    const app = document.getElementById('app');

    if (user.role === 'admin') {
      const groups = await API.getGroups();
      app.innerHTML = `
        <div class="panel">
          <div class="header">
            <div>
              <h1>Панель администратора</h1>
              <p>Здравствуйте, ${user.name}</p>
            </div>
            <button class="logout-btn" id="logout">Выход</button>
          </div>
          <div class="card-grid">
            ${groups.map(group => `
              <div class="group-card">
                <h3>${group.name}</h3>
                <p><strong>Староста:</strong> ${group.starosta ? group.starosta.name : 'не назначен'}</p>
                <ul>
                  ${(group.students || []).map(student => `<li>${student.name}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      document.getElementById('logout').addEventListener('click', () => this.logout());
      return;
    }

    if (user.role === 'manager') {
      const attendance = await API.getAttendance();
      const groups = await API.getGroups();
      const dateSet = [...new Set(attendance.map(item => item.date))].sort().slice(0, 30).reverse();

      app.innerHTML = `
        <div class="panel">
          <div class="header">
            <div>
              <h1>Таблица посещаемости</h1>
              <p>Менеджер: ${user.name}</p>
            </div>
            <button class="logout-btn" id="logout">Выход</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Группа</th>
                <th>Студент</th>
                ${dateSet.map(date => `<th>${date}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${groups.map(group => (group.students || []).map(student => {
                const studentAtt = attendance.filter(item => item.group_id === group.id && item.student_id === student.id);
                const map = Object.fromEntries(studentAtt.map(item => [item.date, item.status]));
                return `
                  <tr>
                    <td>${group.name}</td>
                    <td>${student.name}</td>
                    ${dateSet.map(date => `<td><span class="status-pill status-${map[date] || 'empty'}">${this.symbol(map[date])}</span></td>`).join('')}
                  </tr>
                `;
              }).join('')).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('logout').addEventListener('click', () => this.logout());
      return;
    }

    if (user.role === 'starosta') {
      const groups = await API.getGroups();
      const group = groups.find(item => item.id === user.groupId);
      const today = new Date().toISOString().slice(0, 10);

      app.innerHTML = `
        <div class="panel">
          <div class="header">
            <div>
              <h1>${group.name}</h1>
              <p>Староста: ${user.name}</p>
            </div>
            <button class="logout-btn" id="logout">Выход</button>
          </div>
          <div>
            <label for="attendance-date">Дата</label>
            <input id="attendance-date" type="date" value="${today}" max="${today}" />
          </div>
          <div style="margin-top: 18px;">
            ${(group.students || []).map(student => `
              <div class="student-row">
                <div>${student.name}</div>
                <div class="student-actions">
                  <button class="present" data-group="${group.id}" data-student="${student.id}" data-status="present">Присутствует</button>
                  <button class="absent" data-group="${group.id}" data-student="${student.id}" data-status="absent">Отсутствует</button>
                  <button class="excused" data-group="${group.id}" data-student="${student.id}" data-status="excused">Уваж. причина</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      document.getElementById('attendance-date').addEventListener('change', () => this.renderUser(user));

      document.querySelectorAll('[data-status]').forEach(button => {
        button.addEventListener('click', async () => {
          const payload = {
            groupId: button.dataset.group,
            studentId: Number(button.dataset.student),
            date: document.getElementById('attendance-date').value,
            status: button.dataset.status
          };
          await API.saveAttendance(payload);
          this.renderUser(user);
        });
      });

      document.getElementById('logout').addEventListener('click', () => this.logout());
    }
  },

  symbol(status) {
    const map = { present: '✓', absent: '✗', excused: '~' };
    return map[status] || '';
  },

  logout() {
    sessionStorage.removeItem('token');
    this.renderLogin();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
