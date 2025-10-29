# Plataforma de Reservas Arroyo Seco 
 
## Descripcion 
Plataforma tipo Booking para el municipio de Arroyo Seco, Queretaro 
 
## Tecnologias 
- Frontend: React.js + Capacitor 
- Backend: Node.js + Express 
- Base de datos: PostgreSQL 
- Pagos: Stripe 
 
## Instalacion 
1. Clonar el repositorio 
2. Instalar dependencias del backend: cd backend && npm install 
3. Instalar dependencias del frontend: cd frontend && npm install 
4. Configurar variables de entorno 
5. Ejecutar: npm run dev 


---



# Configuración del Repositorio Xi-l-m

Este documento explica cómo configure el repositorio y las reglas que deben seguir para mantener un flujo de trabajo limpio y colaborativo.

---

##  Estructura de ramas (GitFlow adaptado)

El repositorio utiliza un flujo basado en **GitFlow simplificado**.

### Ramas principales

| Rama | Descripción |
|-------|--------------
| `main` | Versión estable del proyecto en producción. |
| `develop` | Rama de integración y desarrollo principal.|

### Ramas de soporte

| Rama | Uso |
|-------|------|
| `feature/<id>-<nombre>` | Para nuevas características (ejemplo: `feature/REQ-011-login`) |
| `bugfix/<nombre>` | Para corregir errores en desarrollo |
| `hotfix/<nombre>` | Para corregir errores críticos en producción |

#### Flujo de trabajo básico

1. Crear rama desde `develop`  
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/REQ-011-login
   ```

2. Realizar los commits siguiendo la convención  


---

## Convención de commits (Conventional Commits)

Usamos el estándar [Conventional Commits](https://www.conventionalcommits.org/) para mantener mensajes uniformes y claros.

### Estructura

```
<tipo>(<área>): <descripción breve>
```

**Ejemplo:**
```
feat(auth): agregar autenticación JWT
fix(api): corregir error en validación de token
docs(readme): actualizar instrucciones de instalación
```

### Tipos válidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de errores |
| `docs` | Cambios en documentación |
| `style` | Cambios de formato o estilo (sin afectar lógica) |
| `refactor` | Reestructuración del código sin cambiar su comportamiento |
| `test` | Adición o modificación de pruebas |
| `chore` | Mantenimiento del proyecto, dependencias, scripts |
| `perf` | Mejoras de rendimiento |

---

## Variables de entorno (.env)

Cada módulo tiene su propio archivo `.env`. **No deben subirse al repositorio.**

### Backend (`backend/.env.example`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arroyo_seco
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=changeme
JWT_EXPIRATION=24h

STRIPE_SECRET_KEY=sk_test_xxx

EMAIL_SERVICE=smtp.example.com
EMAIL_USER=test@example.com
EMAIL_PASS=changeme

CORS_ORIGIN=http://localhost:3000
PORT=5000
```

###  Frontend (`frontend/.env.example`)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
REACT_APP_NAME=AES Booking
```

---

##  CI con GitHub Actions

El repositorio tiene una configuración básica de **Integración Continua (CI)** para validar el código antes de hacer merge.

### Estructura
```
.github/workflows/
 ├─ ci-backend.yml
 └─ ci-frontend.yml
```
---


