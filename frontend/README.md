React Food Bot Chat — Frontend (JS, Vite)

Простой фронтенд чат-бота для выбора продуктов в доставке еды. На чистом React + Vite. Интерфейс в стиле msger chat UI (аватарки бота/пользователя, список сообщений, поле ввода).
✅ Быстрый старт

Установи Node.js 18+ (или 20+).

Установи зависимости:

npm i

# или

pnpm i

Создай файл окружения и укажи адрес бэкенда (см. ниже).

Запусти дев-сервер:

npm run dev

По умолчанию Vite стартует на http://localhost:5173.

🔧 Конфигурация окружения

Создай файл .env (или .env.local) в корне проекта:

VITE_API_BASE_URL=http://localhost:8000
VITE_CHAT_PATH=/chat
VITE_TIMEOUT_MS=20000

VITE_API_BASE_URL — базовый URL бэкенда. Мы отлаживали на :8000.

VITE_CHAT_PATH — путь эндпоинта (у нас был /chat).

VITE_TIMEOUT_MS — таймаут запроса в миллисекундах.

📁 Структура (минимальная)
project/
├─ public/
│ ├─ bot.png
│ └─ user.png
├─ src/
│ ├─ api/
│ │ └─ chat.js # fetch-клиент
│ ├─ components/
│ │ └─ Chat.js # основная логика чата (без TS)
│ ├─ styles/
│ │ └─ msger.css # стили msger UI
│ ├─ App.js
│ └─ main.jsx
├─ index.html
├─ package.json
└─ README.md
