# PlanDay4You

**PD4U (PlanDay4You)** is a modern web application for managing personal and group tasks, focused on clarity, usability, and real collaboration.

The project combines personal planning with teamwork: you can manage your own tasks and, at the same time, work on shared tasks within groups (family, team, project).

---

## 🔑 What the user can do

### 👤 Authentication & Profile

- Sign in with Google (OAuth)
- Automatic user profile creation
- Personal user session
- Access to data from any device

---

## 📝 Personal Tasks

A user can:

- Create **personal tasks**
- Add a title and description
- Set start and end date/time
- Define:
  - status (todo / in progress / done)
  - priority (low / medium / high)
  - category
- Edit and delete tasks
- Mark tasks as completed

📌 Personal tasks are visible and editable **only by their owner**.

---

## 👥 Groups

### Creating groups

A user can create groups for shared work, for example:

- family
- team
- work project
- event

Each group has:

- a name
- a color (used for visual identification of tasks)

---

### Group roles

- **Owner** — creates the group, manages members and settings
- **Member** — works with group tasks

Roles define the level of access and available actions inside a group.

---

## 📌 Group Tasks

Within groups, users can:

- Create **group tasks**
- Set date, time, and priority
- Edit tasks according to their role
- Mark tasks as completed
- See which group a task belongs to

🔹 Group tasks:

- are displayed together with personal tasks
- have a visual group marker and color
- are available to all members of the corresponding group

---

## 🗂️ Categories

- Create custom categories
- Assign tasks to categories
- Hide default categories
- Filter tasks by category

---

## 🔍 Navigation & Filtering

- View tasks:
  - by day
  - in a weekly layout
- Filter tasks by:
  - categories
  - groups
- Clear separation between personal and group tasks

---

## 🔐 Security & Access Control

- Authentication powered by Supabase
- Row Level Security (RLS)
- Users have access **only to their own tasks** and to groups they are members of

---

## 🚀 Who this project is for

PlanDay4You is suitable for:

- personal planning
- family task management
- team collaboration
- small projects and events

---

## 🛠️ Technologies

- **Vue 3** — main UI framework
- **TypeScript** — type safety, stability, and safer refactoring
- **Vite** — fast development server and build tool
- **Pinia** — state management (tasks, categories, groups, session)
- **Supabase** — backend as a service (Auth, Database, RLS)

---

### 🎨 UnoCSS

The project uses **UnoCSS** as a utility-first styling approach:

- fast UI composition with utility classes
- fewer heavy CSS files inside components
- good scalability for design and UI elements

UnoCSS complements traditional styles where quick and consistent styling is needed (spacing, sizing, alignment, typography).

---

### 🌍 i18n (Localization)

The project supports **multilingual UI via vue-i18n**:

- language switching in user settings (e.g. **EN / UA**)
- all texts are extracted into translation dictionaries
- translation keys are used instead of hard-coded strings

This makes it easy to:

- add new languages
- keep consistent terminology across the UI
- avoid text duplication in the codebase

---

### 🎨 Styles & UI

- **UnoCSS** — utility-first CSS engine:
  - on-demand style generation
  - no unnecessary CSS in the bundle
  - convenient responsive states
  - custom rules and design tokens

UnoCSS allows fast UI iteration without bloated CSS files and scales well with the project.

---

### 🌍 Localization (i18n)

- **vue-i18n** — multilingual support
- Fully localized user interface
- Language switching in user settings
- Easy scalability (adding new languages without changing business logic)

Currently supported languages:

- 🇺🇦 Ukrainian
- 🇬🇧 English

---

### 🗄️ State Management

- **Pinia** — centralized state management for:
  - tasks
  - categories
  - groups
  - user data

---

### 🔐 Backend & Authentication

- **Supabase**
  - authentication (Google OAuth)
  - PostgreSQL database
  - Row Level Security (RLS)
  - strict access separation between users and groups

---

> The project is actively evolving: new scenarios are added, UX is improved, and support for groups, roles, and localization is continuously expanded.


# PlanDay4You

**PD4U** — це сучасний вебзастосунок для керування особистими та груповими задачами з акцентом на зручність, наочність і спільну роботу.

Проєкт поєднує особисте планування з командною взаємодією: ви можете вести власні справи та паралельно працювати з задачами у групах (родина, команда, проєкт).

---

## 🔑 Що може користувач

### 👤 Аутентифікація та профіль

* Вхід через Google (OAuth)
* Автоматичне створення профілю
* Персональна сесія користувача
* Доступ до даних з будь‑якого пристрою

---

## 📝 Особисті задачі

Користувач може:

* Створювати **особисті задачі**
* Додавати назву та опис
* Встановлювати дату та час початку / завершення
* Вказувати:

  * статус (todo / in progress / done)
  * пріоритет (low / medium / high)
  * категорію
* Редагувати та видаляти задачі
* Відмічати виконання

📌 Особисті задачі бачить і редагує **лише їх власник**.

---

## 👥 Групи

### Створення груп

Користувач може створювати групи для спільної роботи, наприклад:

* родина
* команда
* робочий проєкт
* подія або івент

Для кожної групи задається:

* назва
* колір (використовується для візуального маркування задач)

---

### Ролі в групі

* **Owner** — створює групу, керує учасниками та налаштуваннями
* **Member** — працює з груповими задачами

Ролі впливають на доступ до дій усередині групи.

---

## 📌 Групові задачі

У межах груп користувачі можуть:

* Створювати **групові задачі**
* Встановлювати дату, час та пріоритет
* Редагувати задачі відповідно до своєї ролі
* Відмічати виконання задач
* Бачити, до якої групи належить задача

🔹 Групові задачі:

* відображаються разом з особистими
* мають візуальний маркер групи та її колір
* доступні всім учасникам відповідної групи

---

## 🗂️ Категорії

* Створення власних категорій
* Привʼязка задач до категорій
* Можливість приховувати стандартні категорії
* Фільтрація задач за категоріями

---

## 🔍 Навігація та фільтрація

* Перегляд задач:

  * за днями
  * у тижневому форматі
* Фільтрація за:

  * категоріями
  * групами
* Чітке розділення особистих і групових задач

---

## 🔐 Безпека та доступи

* Аутентифікація на базі Supabase
* Використання Row Level Security (RLS)
* Користувач має доступ **лише до своїх задач** та до груп, учасником яких він є

---

## 🚀 Для кого підходить

TODO Calendar підійде для:

* особистого планування
* сімейних справ
* командної роботи
* невеликих проєктів та івентів

---

## 🛠️ Технології

* **Vue 3** — основний фреймворк для UI
* **TypeScript** — типізація, стабільність та безпечніший рефакторинг
* **Vite** — швидкий dev-сервер та збірка
* **Pinia** — state management (задачі, категорії, групи, сесія)
* **Supabase** — бекенд як сервіс (Auth, Database, RLS)

### 🎨 UnoCSS

В проєкті використовується **UnoCSS** як utility-first підхід до стилів:

* швидке складання UI через utility-класи
* менше «важких» CSS-файлів у компонентах
* зручна масштабованість дизайну (особливо для дрібних UI-елементів)

UnoCSS доповнює звичайні стилі там, де потрібно швидко та однаково оформити типові речі (відступи, розміри, вирівнювання, текст).

### 🌍 i18n (локалізація)

Проєкт підтримує **мультимовність через vue-i18n**:

* перемикання мов у налаштуваннях (наприклад **EN / UK**)
* усі тексти винесені в словники перекладів
* ключі перекладів використовуються в компонентах замість «жорстко вбитих» рядків

Це дає можливість легко:

* додавати нові мови
* підтримувати єдину термінологію в UI
* уникати дублювання текстів у коді

---

### 🎨 Стилі та UI

* **UnoCSS** — utility-first CSS engine:

  * миттєва генерація стилів
  * відсутність зайвого CSS у бандлі
  * зручна робота з responsive-станами
  * кастомні правила та дизайн-токени

UnoCSS дозволяє швидко змінювати вигляд інтерфейсу без перевантаження CSS-файлів та добре масштабується разом із проєктом.

---

### 🌍 Локалізація (i18n)

* **vue-i18n** — підтримка багатомовності
* Повна локалізація інтерфейсу
* Можливість перемикання мови в налаштуваннях користувача
* Підтримка масштабування (додавання нових мов без змін у логіці)

Поточні мови:

* 🇺🇦 Українська
* 🇬🇧 Англійська

---

### 🗄️ State Management

* **Pinia** — централізоване керування станом:

  * задачі
  * категорії
  * групи
  * користувач

---

### 🔐 Backend & Auth

* **Supabase**

  * аутентифікація (Google OAuth)
  * база даних PostgreSQL
  * Row Level Security (RLS)
  * чітке розмежування доступів між користувачами та групами

---

> Проєкт активно розвивається: додаються нові сценарії, покращується UX, розширюється робота з групами, ролями та локалізаціями.
