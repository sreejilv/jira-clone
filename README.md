# Jira-like Task Manager

A role-based task management application built with **Laravel 13**, **React** (via Inertia.js), and **Tailwind CSS**. Supports Admin and User roles with project management, task assignment, and status tracking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.3+, Laravel 13 |
| Frontend | React 18, Inertia.js, Tailwind CSS |
| Build Tool | Vite 8 |
| Database | MySQL |
| Auth / RBAC | Laravel Breeze + Spatie Laravel Permission |

---

## Requirements

Before you begin, ensure the following are installed:

- **PHP** >= 8.3 with extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`
- **Composer** >= 2.x — [getcomposer.org](https://getcomposer.org)
- **Node.js** >= 18.x — [nodejs.org](https://nodejs.org)
- **npm** >= 9.x (bundled with Node.js)
- **MySQL** >= 8.x

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url> jira-clone
cd jira-clone
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node dependencies

> This project uses `--legacy-peer-deps` due to a known version conflict between `@vitejs/plugin-react` and Vite 8.

```bash
npm install --legacy-peer-deps
```

### 4. Configure the environment

```bash
cp .env.example .env
php artisan key:generate
```

Then open `.env` and update the database section:

```dotenv
APP_NAME="Jira Clone"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jira_clone
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 5. Create the MySQL database

Log into MySQL and create the database:

```sql
CREATE DATABASE jira_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Run migrations and seed the database

```bash
php artisan migrate --seed
```

This will:
- Create all database tables (users, roles, permissions, projects, tasks)
- Create the **Admin** and **User** roles
- Create a default **Admin** account

---

## Running the App

The project uses `composer run dev` which starts all required services concurrently in a single terminal:

```bash
composer run dev
```

This runs:
| Service | Description |
|---|---|
| `php artisan serve` | Laravel backend on `http://127.0.0.1:8000` |
| `npm run dev` | Vite HMR for React frontend |
| `php artisan queue:listen` | Background job worker |
| `php artisan pail` | Real-time log viewer |

Open your browser and navigate to:

```
http://127.0.0.1:8000
```

---

## Default Login Credentials

### Admin Account

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `password` |

> The Admin account is created automatically when you run `php artisan migrate --seed`.

---

## Role Capabilities

### Admin
- View dashboard with live statistics (project count, task counts by status)
- Create, edit, and manage **Projects** (with client name and contact info)
- Create, assign, and edit **Tasks** (title, description, priority, status, assignee)
- Create and manage **Users**
- Filter tasks by project, status, or assigned user

### User
- View all tasks assigned to them
- Click **Edit** to view full task details (read-only)
- Update the **status** of their assigned tasks (with a confirmation dialog)
- Filter tasks by project or status

> Users are created by the Admin from the **Users** section. Self-registration is disabled.

---

## Creating a New User (Admin only)

1. Log in as Admin
2. Navigate to **Users** in the top navigation
3. Click **+ Create User**
4. Fill in the name, email, password, and confirm password
5. Click **Save User** — the user is automatically assigned the `User` role

---

## Project Structure (Key Directories)

```
├── app/
│   ├── Http/Controllers/
│   │   ├── DashboardController.php   # Admin stats
│   │   ├── ProjectController.php     # Project CRUD
│   │   ├── TaskController.php        # Task CRUD + role-based filtering
│   │   └── UserController.php        # User management
│   └── Models/
│       ├── Project.php
│       ├── Task.php                  # Soft deletes enabled
│       └── User.php                  # HasRoles (Spatie)
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── AdminSeeder.php           # Roles + admin user
│       └── DatabaseSeeder.php
├── resources/js/
│   ├── Hooks/
│   │   ├── useTasks.js
│   │   └── useProjects.js
│   ├── Layouts/
│   │   └── AuthenticatedLayout.jsx   # Role-aware navigation
│   └── Pages/
│       ├── Dashboard.jsx             # Admin stats dashboard
│       ├── Tasks/Index.jsx           # Task board with react-select
│       ├── Admin/Projects/Index.jsx  # Project management
│       └── Admin/Users/Index.jsx     # User management
└── routes/
    ├── web.php
    └── auth.php
```

---

## Building for Production

```bash
npm run build
php artisan optimize
```

---

## Useful Artisan Commands

```bash
# Re-seed (resets all data)
php artisan migrate:fresh --seed

# Clear all caches
php artisan optimize:clear

# Run tests
composer test
```
