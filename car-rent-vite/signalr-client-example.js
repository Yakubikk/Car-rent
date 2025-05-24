// Пример клиентского JavaScript-кода для подключения к SignalR Hub и получения уведомлений о регистрации

// Импортируем библиотеку SignalR
// Примечание: убедитесь, что установили пакет @microsoft/signalr (npm install @microsoft/signalr)
import * as signalR from "@microsoft/signalr";

// Функция для настройки соединения с SignalR
export function setupSignalRConnection() {
    // Создаем соединение с хабом
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://ваш-сервер/registrationHub") // URL должен совпадать с маршрутом на сервере
        .withAutomaticReconnect() // Автоматическое переподключение при обрыве связи
        .build();

    // Обработка события новой регистрации
    connection.on("NewRegistration", (data) => {
        console.log("Получено уведомление о новой регистрации:", data);
        
        // Здесь вы можете добавить код для отображения уведомления в интерфейсе
        // Например, показать всплывающее окно, добавить в список, обновить таблицу и т.д.
        showRegistrationNotification(data);
    });

    // Запуск соединения
    connection.start()
        .then(() => {
            console.log("Подключение к SignalR успешно установлено");
        })
        .catch((err) => {
            console.error("Ошибка подключения к SignalR:", err);
        });

    // Возвращаем соединение, чтобы можно было использовать его в других местах
    return connection;
}

// Пример функции для отображения уведомления
function showRegistrationNotification(data) {
    // Пример создания уведомления
    const notification = document.createElement("div");
    notification.className = "registration-notification";
    
    const date = new Date(data.date);
    const formattedDate = date.toLocaleString();
    
    notification.innerHTML = `
        <h3>Новый запрос на регистрацию</h3>
        <p>Пользователь: ${data.email}</p>
        <p>Дата: ${formattedDate}</p>
        <div class="notification-actions">
            <button class="approve-btn" onclick="approveRegistration('${data.email}')">Подтвердить</button>
            <button class="reject-btn" onclick="rejectRegistration('${data.email}')">Отклонить</button>
        </div>
    `;
    
    // Добавление в DOM
    document.getElementById("notifications-container").appendChild(notification);
}

// Пример функций для подтверждения или отклонения регистрации
// Эти функции нужно будет реализовать, чтобы отправлять запросы на сервер
async function approveRegistration(email) {
    try {
        const response = await fetch('/api/auth/approve-registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
            console.log(`Регистрация пользователя ${email} подтверждена`);
            // Обновить интерфейс
        } else {
            console.error('Ошибка подтверждения регистрации');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
    }
}

async function rejectRegistration(email) {
    try {
        const response = await fetch('/api/auth/reject-registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
            console.log(`Регистрация пользователя ${email} отклонена`);
            // Обновить интерфейс
        } else {
            console.error('Ошибка отклонения регистрации');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, имеет ли текущий пользователь права на просмотр уведомлений
    // (например, является ли он менеджером или администратором)
    const userRole = getCurrentUserRole(); // Функция должна вернуть роль текущего пользователя
    
    if (userRole === 'Manager' || userRole === 'Admin') {
        // Устанавливаем соединение
        setupSignalRConnection();
        
        // Здесь можно добавить дополнительный код инициализации
    }
});

// Функция для получения роли текущего пользователя (пример)
function getCurrentUserRole() {
    // Эту функцию нужно реализовать в соответствии с вашей системой аутентификации
    // Например, она может читать роль из localStorage, из JWT токена и т.д.
    return localStorage.getItem('userRole') || '';
}
