# ⚙️ Configuración Localhost - Arroyo Seco

## ✅ Cambios Aplicados

Todos los servicios ahora están configurados para funcionar en **localhost** (desarrollo local).

---

## 📁 Archivos Configurados

### 1. Frontend - API Configuration

**Archivo:** `frontend/src/services/api.js`
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

**Archivo:** `frontend/.env` (NUEVO)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Backend - Base de Datos

**Archivo:** `backend/.env`
```env
# ACTUAL: Base de datos remota
DB_HOST=164.90.144.13
DB_PORT=5432
DB_NAME=db_arroyoseco_app
DB_USER=mariana_dev
DB_PASSWORD=Mariana2025

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Cómo Funciona Ahora

### Arquitectura Actual:

```
┌─────────────────────┐
│   Frontend (React)  │
│  localhost:3000     │
└──────────┬──────────┘
           │
           ↓ API Calls
┌──────────────────────┐
│  Backend (Node.js)   │
│  localhost:5000      │
└──────────┬───────────┘
           │
           ↓ Database Queries
┌──────────────────────┐
│  PostgreSQL (Remoto) │
│  164.90.144.13:5432  │
└──────────────────────┘
```

### Flujo:
1. **Frontend** corre en `http://localhost:3000`
2. **Backend** corre en `http://localhost:5000`
3. **Database** está en el servidor remoto `164.90.144.13:5432`

---

## 🔄 Para Iniciar Todo

### 1. Terminal 1: Backend
```bash
cd backend
npm start
```
Debería mostrar:
```
Server is running on port 5000
Database connected successfully
```

### 2. Terminal 2: Frontend
```bash
cd frontend
npm start
```
Debería abrir automáticamente: `http://localhost:3000`

---

## 🌐 Cambiar Entre Localhost y Producción

### Opción 1: Usando Archivos .env

**Para Desarrollo (localhost):**
```bash
cd frontend
npm start
# Usa automáticamente .env
```

**Para Producción (servidor remoto):**
```bash
cd frontend
npm run build
# Usa automáticamente .env.production
```

### Opción 2: Variable de Entorno Manual

```bash
# Desarrollo
REACT_APP_API_URL=http://localhost:5000/api npm start

# Producción
REACT_APP_API_URL=http://164.90.144.13:5000/api npm run build
```

---

## 📝 Archivos de Configuración

### Frontend

| Archivo | Propósito | URL |
|---------|-----------|-----|
| `.env` | Desarrollo | `http://localhost:5000/api` |
| `.env.production` | Producción | `http://164.90.144.13:5000/api` |
| `src/services/api.js` | Configuración base | Lee de `.env` |

### Backend

| Archivo | Propósito | Configuración |
|---------|-----------|---------------|
| `.env` | Configuración BD y servidor | `DB_HOST=164.90.144.13` |
| `src/config/database.js` | Conexión Sequelize | Lee de `.env` |

---

## 🔧 Si Quieres Usar PostgreSQL Local

### 1. Instalar PostgreSQL
```bash
# Descargar de: https://www.postgresql.org/download/windows/
# O con chocolatey:
choco install postgresql
```

### 2. Crear Base de Datos Local
```bash
# Abrir psql
psql -U postgres

# Crear usuario
CREATE USER mariana_dev WITH PASSWORD 'Mariana2025';

# Crear base de datos
CREATE DATABASE db_arroyoseco_app OWNER mariana_dev;

# Salir
\q
```

### 3. Importar Schema
```bash
cd database
psql -U mariana_dev -d db_arroyoseco_app -f db_arroyoseco_app.sql
```

### 4. Actualizar .env del Backend
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_arroyoseco_app
DB_USER=mariana_dev
DB_PASSWORD=Mariana2025
```

### 5. Poblar con Datos de Prueba
```bash
cd backend
npm run seed:complete
npm run reset:passwords
```

---

## ✅ Verificación

### 1. Backend funcionando:
```bash
curl http://localhost:5000/api/auth/login
# Debería devolver error de validación (falta email/password)
```

### 2. Frontend conectando al Backend:
```bash
# Abrir navegador en: http://localhost:3000
# Abrir DevTools (F12) > Network
# Hacer login
# Verificar que las peticiones vayan a: http://localhost:5000/api/*
```

### 3. Rutas de Reservas:
```bash
# Después de hacer login como admin, verificar:
# http://localhost:3000/admin/bookings
# Debería cargar la página sin errores 404
```

---

## 🐛 Solución de Problemas

### ❌ Frontend sigue apuntando a 164.90.144.13

**Solución:**
1. Verifica que el archivo `frontend/.env` exista
2. Reinicia el servidor de React (Ctrl+C y `npm start`)
3. Limpia el cache del navegador o usa modo incógnito

### ❌ Backend no conecta a la base de datos

**Solución:**
1. Verifica que `backend/.env` tenga las credenciales correctas
2. Verifica conectividad: `ping 164.90.144.13`
3. Verifica puerto: `telnet 164.90.144.13 5432`

### ❌ Error: "Cannot GET /api/bookings/admin/all"

**Solución:**
1. Reinicia el backend
2. Verifica que las rutas estén en el orden correcto (ya corregido)
3. Verifica que estés logueado como admin

---

## 📊 Estado Actual de Configuración

| Componente | Ubicación | Estado |
|------------|-----------|--------|
| **Frontend** | localhost:3000 | ✅ Configurado |
| **Backend** | localhost:5000 | ✅ Corriendo |
| **Base de Datos** | 164.90.144.13:5432 | ✅ Remota |
| **API URL** | http://localhost:5000/api | ✅ Configurada |
| **Rutas Bookings** | /admin/all, /host/bookings | ✅ Corregidas |

---

## 🎯 Próximos Pasos

1. ✅ **Reiniciar Frontend**
   ```bash
   cd frontend
   # Ctrl+C para detener
   npm start
   ```

2. ✅ **Verificar Login**
   - Email: `admin@arroyoseco.com`
   - Password: `Admin123!`

3. ✅ **Probar Panel de Reservas**
   - Ir a `/admin/bookings`
   - Verificar que cargue sin errores
   - Ver badge de reservas pendientes

---

## 📚 Archivos Relacionados

- [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md) - Credenciales de acceso
- [FASE3_PANEL_RESERVAS_COMPLETE.md](FASE3_PANEL_RESERVAS_COMPLETE.md) - Documentación Fase 3
- [STRIPE_IMPLEMENTATION_GUIDE.md](STRIPE_IMPLEMENTATION_GUIDE.md) - Integración Stripe
- [PWA_SETUP_COMPLETE.md](PWA_SETUP_COMPLETE.md) - Configuración PWA

---

**Última Actualización:** Noviembre 2025
**Estado:** ✅ Configuración completa para desarrollo local
