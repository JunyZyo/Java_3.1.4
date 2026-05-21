/* global bootstrap, Modal */

const API = "/api/admin";

let editModal, deleteModal;

// ==================== Загрузка данных ====================
async function loadAll() {
    try {
        const [users, roles, currentUser] = await Promise.all([
            fetch(API + "/users").then(r => {
                if (!r.ok) throw new Error('Users error: ' + r.status);
                return r.json();
            }),
            fetch(API + "/roles").then(r => {
                if (!r.ok) throw new Error('Roles error: ' + r.status);
                return r.json();
            }),
            fetch(API + "/current").then(r => {
                if (!r.ok) throw new Error('Current error: ' + r.status);
                return r.json();
            }),
        ]);

        renderNavbar(currentUser);
        renderTable(users);
        renderRoles("newUserRoles", roles, []);
    } catch (error) {
        console.error('Детали ошибки:', error.message);
        showAlert(error.message, 'danger');
    }
}

function renderNavbar(user) {
    document.getElementById("navbarEmail").textContent = user.email;
    document.getElementById("navbarRoles").innerHTML = user.roles.map(r => roleBadge(r)).join("");
}

//Таблица пользователей
function renderTable(users) {
    document.getElementById("usersTableBody").innerHTML = users.map(user => `
    <tr>
        <td>${user.id}</td>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.age || 'N/A'}</td>
        <td>${user.email}</td>
        <td>${user.roles.map(r => `<span class="badge badge-role" style="color:black;">${r.name}</span>`).join('')}</td>
        <td><button class="btn-edit" onclick="openEdit(${user.id})">Edit</button></td>
        <td><button class="btn-delete" onclick="openDelete(${user.id}, '${user.firstName} ${user.lastName}')">Delete</button></td>
    </tr>
    `).join("");
}

// ← добавлены недостающие параметры: containerId, roles, selectedIds
function renderRoles(containerId, roles, selectedIds) {
    document.getElementById(containerId).innerHTML = roles.map(role => `
        <option value="${role.id}" ${selectedIds.includes(role.id) ? 'selected' : ''}>${role.name}</option>
    `).join('');
}

function roleBadge(role) {
    const cls = role.name === "ADMIN" ? "badge-role-admin" : "badge-role";
    return `<span class="badge ${cls} me-1">${role.name}</span>`;
}

function getSelectedRoles(containerId) {
    return Array.from(document.getElementById(containerId).selectedOptions).map(opt => opt.value);
}

// ==================== CRUD ====================
async function createUser() {
    const form = document.getElementById("newUserForm");
    const fd = new FormData(form);
    const roleIds = getSelectedRoles("newUserRoles");

    const body = {
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        age: fd.get("age") || null,
        email: fd.get("email"),
        password: fd.get("password"),
        roles: roleIds.map(id => ({id: parseInt(id)}))
    };

    console.log('Отправляю:', JSON.stringify(body));  // ← ПРОВЕРЬТЕ КОНСОЛЬ

    const res = await fetch(API + "/users", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log('Ответ сервера:', data);  // ← проверка

    form.reset();
    document.getElementById("tab1").checked = true;
    loadAll();
    showAlert("Пользователь создан!", "success");
}

// ← добавлен недостающий метод openEdit
async function openEdit(userId) {
    const [user, roles] = await Promise.all([
        fetch(API + '/users/' + userId).then(r => r.json()),
        fetch(API + '/roles').then(r => r.json())
    ]);

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editId').value = user.id;
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editAge').value = user.age || '';
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPassword').value = '';

    renderRoles('editRoles', roles, user.roles.map(r => r.id));
    editModal.show();
}

// ← добавлен недостающий метод saveEdit
async function saveEdit() {
    const roleIds = getSelectedRoles("editRoles");
    const password = document.getElementById('editPassword').value;

    await fetch(API + '/users/' + document.getElementById('editUserId').value, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            age: document.getElementById('editAge').value || null,
            email: document.getElementById('editEmail').value,
            password: password || null,
            roles: roleIds.map(id => ({id: parseInt(id)}))
        })
    });

    editModal.hide();
    loadAll();
    showAlert('Пользователь обновлён!', 'success');
}

function setActiveLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.list-group-item').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPath);
    });
}

document.addEventListener('DOMContentLoaded', setActiveLink);

function openDelete(userId, userName) {
    fetch(API + '/users/' + userId)
        .then(r => r.json())
        .then(user => {
            document.getElementById('deleteId').value = user.id;
            document.getElementById('deleteFirstName').value = user.firstName;
            document.getElementById('deleteLastName').value = user.lastName;
            document.getElementById('deleteAge').value = user.age || '';
            document.getElementById('deleteEmail').value = user.email;
            document.getElementById('deleteUserName').textContent = user.firstName + ' ' + user.lastName;

            fetch(API + '/roles')
                .then(r => r.json())
                .then(roles => {
                    document.getElementById('deleteRoles').innerHTML = roles.map(role => `
                        <option value="${role.id}" ${user.roles.some(r => r.id === role.id) ? 'selected' : ''}>
                            ${role.name}
                        </option>
                    `).join('');
                });

            document.getElementById('deleteUserId').value = userId;
            deleteModal.show();
        });
}

async function confirmDelete() {
    const userId = document.getElementById('deleteUserId').value;
    await fetch(API + '/users/' + userId, { method: 'DELETE' });
    deleteModal.hide();
    loadAll();
    showAlert('Пользователь удалён!', 'danger');
}

// Уведомления
function showAlert(msg, type) {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `<div class="alert alert-${type} py-2 alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    setTimeout(() => container.innerHTML = '', 3000);
}

// Инициализация
document.getElementById('newUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    createUser();
});

document.addEventListener('DOMContentLoaded', function() {
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    loadAll().catch(err => console.error('Ошибка в loadAll:', err));
});