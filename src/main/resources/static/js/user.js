const API = '/api/user/profile';

async function loadProfile() {
    try {
        const res = await fetch(API);
        const user = await res.json();

        renderNavbar(user);
        renderTable(user);
    } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
    }
}

function renderNavbar(user) {
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userRoles').innerHTML =
        user.roles.map(r => roleBadge(r)).join('');
}

function renderTable(user) {
    document.getElementById('userProfileBody').innerHTML = `
        <tr>
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.age || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.roles.map(r => roleBadge(r)).join('')}</td>
        </tr>
    `;
}

function roleBadge(role) {
    const cls = role.name === 'ADMIN' ? 'badge-role-admin' : 'badge-role';
    return `<span class="badge ${cls} me-1">${role.name}</span>`;
}

// Загрузка при открытии страницы
document.addEventListener('DOMContentLoaded', loadProfile);