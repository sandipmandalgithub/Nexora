# Nexora – Learning & Online Examination Platform

Nexora is a full-stack Learning Management and Online Examination Platform designed to provide students with an interactive digital learning experience and administrators with centralized academic management.

Students can explore courses, enroll in learning programs, access study materials, take online examinations, track their academic performance, and view their achievements.

Administrators can manage courses, examinations, questions, student enrollments, results, grade cards, and certificates through a centralized dashboard.

## Live Demo

- **Frontend:** [https://nexora-learning-platform.vercel.app/](https://nexora-learning-platform.vercel.app/)
- **Backend API:** [https://nexora-backend-eblm.onrender.com](https://nexora-backend-eblm.onrender.com)
- **GitHub Repository:** [https://github.com/sandipmandalgithub/Nexora](https://github.com/sandipmandalgithub/Nexora)

## Key Features

### Student Features

- Student registration and secure login.
- JWT-based authentication.
- Browse and explore published courses.
- Enroll in available learning programs.
- Access course lessons and learning materials.
- Take online examinations.
- View examination results and performance.
- Track academic achievements.
- Access grade cards and certificates.

### Admin Features

- Centralized admin dashboard.
- Create, update, and manage courses.
- Publish and manage examinations.
- Create and manage examination questions and MCQs.
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

- MySQL-compatible database
- TiDB Cloud Starter
- MySQL Connector/J

### Development Tools

- Visual Studio Code
- Git & GitHub
- Postman
- MySQL Workbench
- Apache Maven

## Application Architecture

Nexora follows a frontend-backend architecture:

- **Frontend:** React application responsible for the user interface and client-side interactions.
- **Backend:** Spring Boot REST API responsible for business logic, authentication, authorization, and data processing.
- **Database:** MySQL-compatible relational database for storing application data.
- **Authentication:** JWT-based authentication with role-based access control.

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

### 2. Configure the Database

Start your MySQL server and create the database:

```sql
CREATE DATABASE nexora_db;
```

The application uses Hibernate with `ddl-auto=update` to manage database tables.

### 3. Configure Backend Environment Variables

The backend reads database and JWT configuration from environment variables.

| Variable | Description |
|---|---|
| `DB_URL` | Database connection URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secure JWT signing secret |

Example local configuration:

```env
DB_URL=jdbc:mysql://localhost:3306/nexora_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_jwt_secret
```

Use your actual database credentials. Never commit passwords or JWT secrets to GitHub.

### 4. Run the Backend

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

### 5. Configure the Frontend

Open another Command Prompt and navigate to the frontend directory:

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

### 6. Run the Frontend

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
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint checks |

## API Configuration

Nexora uses a centralized API configuration to manage backend communication.

The frontend reads the backend URL from the `VITE_API_URL` environment variable and automatically constructs the API base URL.

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
- Request validation using Bean Validation.
- Protected API endpoints.
- Environment-based configuration for sensitive credentials.

## Deployment

Nexora is deployed using separate frontend, backend, and cloud database services.

| Component | Hosting / Service |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | TiDB Cloud Starter |

### Production URLs

- **Frontend:** [https://nexora-learning-platform.vercel.app/](https://nexora-learning-platform.vercel.app/)
- **Backend:** [https://nexora-backend-eblm.onrender.com](https://nexora-backend-eblm.onrender.com)

### Deployment Configuration

- Frontend deployed through Vercel.
- Backend deployed as a Spring Boot application on Render.
- Database hosted on TiDB Cloud Starter.
- Production API URL configured using the `VITE_API_URL` environment variable.
- Database credentials and JWT secrets configured through backend environment variables.

**Note:** Free hosting services may have usage limits or temporary inactivity-related delays.

## Testing & Verification

The application was built and tested through local development and production deployment.

Key verification areas include:

- Frontend production build.
- Backend startup and database connectivity.
- Student authentication.
- Course browsing and management.
- Admin dashboard functionality.
- Examination and academic management.
- Production frontend-backend communication.

## Future Improvements

- Advanced learning analytics and reporting.
- Additional examination formats.
- Enhanced course progress tracking.
- More interactive learning resources.
- Advanced administrative reporting.

## Author

**Sandip Mandal**

Full Stack Developer

- **Portfolio:** [sandipmandalgithub.github.io/sandip-portfolio](https://sandipmandalgithub.github.io/sandip-portfolio/)
- **GitHub:** [github.com/sandipmandalgithub](https://github.com/sandipmandalgithub)
- **LinkedIn:** [linkedin.com/in/mrsandipmandal](https://www.linkedin.com/in/mrsandipmandal/)

---

**Nexora – Learn, Practice, and Achieve.**