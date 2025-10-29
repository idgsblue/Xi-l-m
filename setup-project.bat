@echo off
echo ========================================
echo Creando estructura del proyecto Arroyo Seco
echo ========================================



echo.
echo [1/4] Creando estructura del Backend...
echo ----------------------------------------

REM Crear estructura de carpetas del Backend
mkdir backend
mkdir backend\src
mkdir backend\src\controllers
mkdir backend\src\models
mkdir backend\src\routes
mkdir backend\src\middleware
mkdir backend\src\services
mkdir backend\src\config
mkdir backend\src\utils

REM Crear archivos del Backend - Controllers
echo // Authentication Controller > backend\src\controllers\auth.controller.js
echo module.exports = {}; >> backend\src\controllers\auth.controller.js

echo // Property Controller > backend\src\controllers\property.controller.js
echo module.exports = {}; >> backend\src\controllers\property.controller.js

echo // Booking Controller > backend\src\controllers\booking.controller.js
echo module.exports = {}; >> backend\src\controllers\booking.controller.js

echo // Payment Controller > backend\src\controllers\payment.controller.js
echo module.exports = {}; >> backend\src\controllers\payment.controller.js

echo // Admin Controller > backend\src\controllers\admin.controller.js
echo module.exports = {}; >> backend\src\controllers\admin.controller.js

REM Crear archivos del Backend - Models
echo // User Model > backend\src\models\User.model.js
echo module.exports = {}; >> backend\src\models\User.model.js

echo // Property Model > backend\src\models\Property.model.js
echo module.exports = {}; >> backend\src\models\Property.model.js

echo // Booking Model > backend\src\models\Booking.model.js
echo module.exports = {}; >> backend\src\models\Booking.model.js

echo // Payment Model > backend\src\models\Payment.model.js
echo module.exports = {}; >> backend\src\models\Payment.model.js

REM Crear archivos del Backend - Routes
echo // Auth Routes > backend\src\routes\auth.routes.js
echo const router = require('express').Router(); >> backend\src\routes\auth.routes.js
echo module.exports = router; >> backend\src\routes\auth.routes.js

echo // Property Routes > backend\src\routes\property.routes.js
echo const router = require('express').Router(); >> backend\src\routes\property.routes.js
echo module.exports = router; >> backend\src\routes\property.routes.js

echo // Booking Routes > backend\src\routes\booking.routes.js
echo const router = require('express').Router(); >> backend\src\routes\booking.routes.js
echo module.exports = router; >> backend\src\routes\booking.routes.js

echo // Payment Routes > backend\src\routes\payment.routes.js
echo const router = require('express').Router(); >> backend\src\routes\payment.routes.js
echo module.exports = router; >> backend\src\routes\payment.routes.js

echo // Admin Routes > backend\src\routes\admin.routes.js
echo const router = require('express').Router(); >> backend\src\routes\admin.routes.js
echo module.exports = router; >> backend\src\routes\admin.routes.js

REM Crear archivos del Backend - Middleware
echo // Auth Middleware > backend\src\middleware\auth.middleware.js
echo module.exports = {}; >> backend\src\middleware\auth.middleware.js

echo // Validation Middleware > backend\src\middleware\validation.middleware.js
echo module.exports = {}; >> backend\src\middleware\validation.middleware.js

echo // Role Check Middleware > backend\src\middleware\roleCheck.middleware.js
echo module.exports = {}; >> backend\src\middleware\roleCheck.middleware.js

echo // Error Handler Middleware > backend\src\middleware\errorHandler.middleware.js
echo module.exports = {}; >> backend\src\middleware\errorHandler.middleware.js

REM Crear archivos del Backend - Services
echo // Stripe Service > backend\src\services\stripe.service.js
echo module.exports = {}; >> backend\src\services\stripe.service.js

echo // Email Service > backend\src\services\email.service.js
echo module.exports = {}; >> backend\src\services\email.service.js

echo // JWT Service > backend\src\services\jwt.service.js
echo module.exports = {}; >> backend\src\services\jwt.service.js

REM Crear archivos del Backend - Config
echo // Database Configuration > backend\src\config\database.js
echo module.exports = {}; >> backend\src\config\database.js

REM Crear app.js
echo const express = require('express'); > backend\src\app.js
echo const cors = require('cors'); >> backend\src\app.js
echo const app = express(); >> backend\src\app.js
echo. >> backend\src\app.js
echo app.use(cors()); >> backend\src\app.js
echo app.use(express.json()); >> backend\src\app.js
echo. >> backend\src\app.js
echo module.exports = app; >> backend\src\app.js

REM Crear server.js
echo require('dotenv').config(); > backend\server.js
echo const app = require('./src/app'); >> backend\server.js
echo. >> backend\server.js
echo const PORT = process.env.PORT ^|^| 5000; >> backend\server.js
echo. >> backend\server.js
echo app.listen(PORT, () =^> { >> backend\server.js
echo   console.log(`Server running on port ${PORT}`); >> backend\server.js
echo }); >> backend\server.js

REM Crear .env.example
echo # Database > backend\.env.example
echo DB_HOST=localhost >> backend\.env.example
echo DB_PORT=5432 >> backend\.env.example
echo DB_NAME=arroyo_seco >> backend\.env.example
echo DB_USER=postgres >> backend\.env.example
echo DB_PASSWORD= >> backend\.env.example
echo. >> backend\.env.example
echo # JWT >> backend\.env.example
echo JWT_SECRET=your_jwt_secret >> backend\.env.example
echo REFRESH_SECRET=your_refresh_secret >> backend\.env.example
echo. >> backend\.env.example
echo # Stripe >> backend\.env.example
echo STRIPE_SECRET_KEY= >> backend\.env.example
echo STRIPE_PUBLIC_KEY= >> backend\.env.example
echo. >> backend\.env.example
echo # Email >> backend\.env.example
echo EMAIL_USER= >> backend\.env.example
echo EMAIL_PASS= >> backend\.env.example
echo. >> backend\.env.example
echo # Server >> backend\.env.example
echo PORT=5000 >> backend\.env.example

echo.
echo [2/4] Creando estructura del Frontend...
echo ----------------------------------------

REM Crear estructura de carpetas del Frontend
mkdir frontend
mkdir frontend\src
mkdir frontend\src\components
mkdir frontend\src\components\common
mkdir frontend\src\components\guest
mkdir frontend\src\components\host
mkdir frontend\src\components\admin
mkdir frontend\src\pages
mkdir frontend\src\pages\Dashboard
mkdir frontend\src\services
mkdir frontend\src\context
mkdir frontend\src\hooks
mkdir frontend\src\utils
mkdir frontend\public

REM Crear archivos del Frontend - Components
echo // Header Component > frontend\src\components\common\Header.jsx
echo export default function Header() { return null; } >> frontend\src\components\common\Header.jsx

echo // Footer Component > frontend\src\components\common\Footer.jsx
echo export default function Footer() { return null; } >> frontend\src\components\common\Footer.jsx

echo // PropertyCard Component > frontend\src\components\guest\PropertyCard.jsx
echo export default function PropertyCard() { return null; } >> frontend\src\components\guest\PropertyCard.jsx

echo // SearchBar Component > frontend\src\components\guest\SearchBar.jsx
echo export default function SearchBar() { return null; } >> frontend\src\components\guest\SearchBar.jsx

echo // PropertyForm Component > frontend\src\components\host\PropertyForm.jsx
echo export default function PropertyForm() { return null; } >> frontend\src\components\host\PropertyForm.jsx

echo // ReservationList Component > frontend\src\components\host\ReservationList.jsx
echo export default function ReservationList() { return null; } >> frontend\src\components\host\ReservationList.jsx

echo // ApprovalPanel Component > frontend\src\components\admin\ApprovalPanel.jsx
echo export default function ApprovalPanel() { return null; } >> frontend\src\components\admin\ApprovalPanel.jsx

REM Crear archivos del Frontend - Pages
echo // Home Page > frontend\src\pages\Home.jsx
echo export default function Home() { return null; } >> frontend\src\pages\Home.jsx

echo // Search Page > frontend\src\pages\Search.jsx
echo export default function Search() { return null; } >> frontend\src\pages\Search.jsx

echo // Property Detail Page > frontend\src\pages\PropertyDetail.jsx
echo export default function PropertyDetail() { return null; } >> frontend\src\pages\PropertyDetail.jsx

echo // Booking Page > frontend\src\pages\Booking.jsx
echo export default function Booking() { return null; } >> frontend\src\pages\Booking.jsx

echo // Login Page > frontend\src\pages\Login.jsx
echo export default function Login() { return null; } >> frontend\src\pages\Login.jsx

echo // Register Page > frontend\src\pages\Register.jsx
echo export default function Register() { return null; } >> frontend\src\pages\Register.jsx

REM Crear archivos del Frontend - Services
echo // API Service > frontend\src\services\api.js
echo const API_URL = process.env.REACT_APP_API_URL ^|^| 'http://localhost:5000'; >> frontend\src\services\api.js
echo export default { API_URL }; >> frontend\src\services\api.js

REM Crear archivos del Frontend - Context
echo // Auth Context > frontend\src\context\AuthContext.jsx
echo import { createContext } from 'react'; >> frontend\src\context\AuthContext.jsx
echo export const AuthContext = createContext(null); >> frontend\src\context\AuthContext.jsx

REM Crear App.jsx
echo import React from 'react'; > frontend\src\App.jsx
echo function App() { >> frontend\src\App.jsx
echo   return ^<div^>Arroyo Seco Platform^</div^>; >> frontend\src\App.jsx
echo } >> frontend\src\App.jsx
echo export default App; >> frontend\src\App.jsx

REM Crear index.js
echo import React from 'react'; > frontend\src\index.js
echo import ReactDOM from 'react-dom/client'; >> frontend\src\index.js
echo import App from './App'; >> frontend\src\index.js
echo const root = ReactDOM.createRoot(document.getElementById('root')); >> frontend\src\index.js
echo root.render(^<App /^>); >> frontend\src\index.js

REM Crear index.html
echo ^<!DOCTYPE html^> > frontend\public\index.html
echo ^<html lang="es"^> >> frontend\public\index.html
echo ^<head^> >> frontend\public\index.html
echo   ^<meta charset="UTF-8"^> >> frontend\public\index.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> frontend\public\index.html
echo   ^<title^>Arroyo Seco^</title^> >> frontend\public\index.html
echo ^</head^> >> frontend\public\index.html
echo ^<body^> >> frontend\public\index.html
echo   ^<div id="root"^>^</div^> >> frontend\public\index.html
echo ^</body^> >> frontend\public\index.html
echo ^</html^> >> frontend\public\index.html

REM Crear capacitor.config.json
echo { > frontend\capacitor.config.json
echo   "appId": "com.arroyoseco.booking", >> frontend\capacitor.config.json
echo   "appName": "Arroyo Seco", >> frontend\capacitor.config.json
echo   "webDir": "build", >> frontend\capacitor.config.json
echo   "server": { >> frontend\capacitor.config.json
echo     "androidScheme": "https" >> frontend\capacitor.config.json
echo   } >> frontend\capacitor.config.json
echo } >> frontend\capacitor.config.json

echo.
echo [3/4] Creando archivos de configuracion...
echo ----------------------------------------

REM Crear .gitignore en la raíz
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo build/ >> .gitignore
echo dist/ >> .gitignore
echo .DS_Store >> .gitignore
echo *.log >> .gitignore

REM Crear README.md
echo # Plataforma de Reservas Arroyo Seco > README.md
echo. >> README.md
echo ## Descripcion >> README.md
echo Plataforma tipo Booking para el municipio de Arroyo Seco, Queretaro >> README.md
echo. >> README.md
echo ## Tecnologias >> README.md
echo - Frontend: React.js + Capacitor >> README.md
echo - Backend: Node.js + Express >> README.md
echo - Base de datos: PostgreSQL >> README.md
echo - Pagos: Stripe >> README.md
echo. >> README.md
echo ## Instalacion >> README.md
echo 1. Clonar el repositorio >> README.md
echo 2. Instalar dependencias del backend: cd backend ^&^& npm install >> README.md
echo 3. Instalar dependencias del frontend: cd frontend ^&^& npm install >> README.md
echo 4. Configurar variables de entorno >> README.md
echo 5. Ejecutar: npm run dev >> README.md

echo.
echo [4/4] Creando archivos de base de datos...
echo ----------------------------------------

REM Crear carpeta database
mkdir database

REM Crear archivo schema.sql
echo -- Database Schema for Arroyo Seco Platform > database\schema.sql
echo. >> database\schema.sql
echo CREATE DATABASE arroyo_seco; >> database\schema.sql
echo. >> database\schema.sql
echo -- Users table >> database\schema.sql
echo CREATE TABLE users ( >> database\schema.sql
echo   id SERIAL PRIMARY KEY, >> database\schema.sql
echo   email VARCHAR(255) UNIQUE NOT NULL, >> database\schema.sql
echo   password VARCHAR(255) NOT NULL, >> database\schema.sql
echo   name VARCHAR(255) NOT NULL, >> database\schema.sql
echo   role VARCHAR(50) NOT NULL, >> database\schema.sql
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP >> database\schema.sql
echo ); >> database\schema.sql

echo.
echo ========================================
echo Estructura del proyecto creada exitosamente!
echo ========================================
echo.
echo Siguientes pasos:
echo 1. cd %PROJECT_NAME%
echo 2. cd backend ^&^& npm init -y ^&^& npm install express cors dotenv pg sequelize bcrypt jsonwebtoken
echo 3. cd ../frontend ^&^& npx create-react-app . ^&^& npm install @capacitor/core @capacitor/cli @capacitor/android
echo.
pause