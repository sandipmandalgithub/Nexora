# Nexora – Learning & Online Examination Platform

Nexora is a full-stack Learning Management and Online Examination Platform designed to provide students with an interactive learning experience and administrators with centralized academic management.

The platform allows students to explore courses, enroll in learning programs, take online examinations, track academic performance, and access their achievements.

Administrators can manage courses, examinations, questions, student enrollments, results, and academic records through a centralized dashboard.

## Key Features

### Student Features
- Student registration and secure login.
- JWT-based authentication.
- Browse and explore published courses.
- Enroll in available courses.
- Access learning materials.
- Take online examinations.
- View examination results and performance.
- Track academic achievements and grade cards.

### Admin Features
- Centralized admin dashboard.
- Create, update, and manage courses.
- Publish and manage examinations.
- Manage examination questions and MCQs.
- Manage student course enrollments.
- View detailed examination results.
- Manage academic achievements and certificates.

## Technology Stack

### Frontend
- React.js 19
- Vite 8
- Tailwind CSS 4
- React Router 7
- Axios
- Lucide React

### Backend
- Java 21
- Spring Boot 4.0.8
- Spring MVC
- Spring Data JPA
- Spring Security
- Hibernate
- JWT Authentication
- Bean Validation
- OpenPDF

### Database
- MySQL
- MySQL Connector/J

### Development Tools
- Visual Studio Code
- Git & GitHub
- Postman
- MySQL Workbench
- Maven

## Project Structure

```text
Nexora/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/nexora/nexora_backend/
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── utils/
│   │       └── api.js
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Prerequisites

Install the following before running Nexora locally:

- Java Development Kit (JDK) 21
- Node.js and npm
- MySQL Server
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sandipmandalgithub/Nexora.git
```

Navigate to the project directory:

```bash
cd Nexora
```

### 2. Configure MySQL Database

Start your MySQL server and create the database:

```sql
CREATE DATABASE nexora_db;
```

The application uses Hibernate with `ddl-auto=update` to manage database tables.

### 3. Configure Backend Environment Variables

The backend reads its database and JWT configuration from environment variables.

| Variable | Description |
|---|---|
| DB_URL | MySQL database connection URL |
| DB_USERNAME | MySQL username |
| DB_PASSWORD | MySQL password |
| JWT_SECRET | Secure JWT signing secret |

Example local configuration:

```text
DB_URL=jdbc:mysql://localhost:3306/nexora_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_jwt_secret
```

Use your actual local MySQL credentials. Never commit passwords or JWT secrets to GitHub.

### 4. Run Backend

Open Command Prompt and navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

```bash
mvnw.cmd spring-boot:run
```

Backend server:

```text
http://localhost:8080
```

### 5. Configure Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:8080
```

**Important:** Set the backend origin without `/api`. The frontend API utility automatically appends `/api`.

### 6. Run Frontend

Start the Vite development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Available Frontend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

## API Configuration

The frontend uses a centralized API configuration.

```javascript
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const API_BASE_URL =
  `${API_URL.replace(/\/+$/, "")}/api`;
```

The backend provides REST API endpoints for authentication, courses, enrollments, examinations, questions, and academic management.

## Authentication & Security

- Spring Security for backend security.
- JWT-based authentication.
- Role-based access control.
- Password hashing.
- Request validation.
- Protected API endpoints.

## Deployment

Nexora is designed to support separate frontend and backend deployment.

Before deployment:

1. Configure a production MySQL-compatible cloud database.
2. Set backend environment variables securely.
3. Configure the production frontend URL in backend CORS settings.
4. Deploy the Spring Boot backend.
5. Set `VITE_API_URL` to the deployed backend origin.
6. Deploy the React frontend.
7. Verify authentication, course management, enrollment, examinations, and results in production.

Never expose database credentials or JWT secrets in frontend code or public repositories.

## Author

**Sandip Mandal**

Full Stack Developer

- GitHub: https://github.com/sandipmandalgithub

---

**Nexora – Learn, Practice, and Achieve.**