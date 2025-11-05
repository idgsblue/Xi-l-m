# 🔐 Credenciales de Acceso - Arroyo Seco

## ✅ Problema Resuelto

El problema de inicio de sesión se debía a que las contraseñas estaban siendo hasheadas dos veces:
1. Una vez manualmente en el script de seed
2. Una segunda vez por el hook `beforeCreate` del modelo User

Esto ha sido corregido.

---

## 📝 Credenciales Actuales

### 👨‍💼 ADMINISTRADOR

```
Email:    admin@arroyoseco.com
Password: Admin123!
Rol:      admin
```

**Acceso completo a:**
- Dashboard administrativo
- Gestión de propiedades pendientes
- Gestión de usuarios
- Todas las reservas del sistema
- Tipos de alojamiento
- Reportes

---

### 🏠 HOSTS (Anfitriones)

```
Email:    carlos.host@example.com
Password: Host123!
Rol:      host
```

```
Email:    maria.host@example.com
Password: Host123!
Rol:      host
```

**Acceso a:**
- Mis propiedades (crear, editar, eliminar)
- Reservas recibidas en sus propiedades
- Estadísticas de reservas por propiedad
- Gestión de disponibilidad

---

### 👥 HUÉSPEDES

```
Email:    juan.guest@example.com
Password: Guest123!
Rol:      guest
```

```
Email:    ana.guest@example.com
Password: Guest123!
Rol:      guest
```

```
Email:    pedro.guest@example.com
Password: Guest123!
Rol:      guest
```

**Acceso a:**
- Búsqueda y exploración de propiedades
- Realizar reservas
- Mis reservas (ver estado, cancelar)
- Perfil de usuario

---

## 🛠️ Scripts de Utilidad

### Resetear todas las contraseñas

```bash
cd backend
npm run reset:passwords
```

Este comando establece las contraseñas predeterminadas para todos los usuarios:
- Admin: `Admin123!`
- Hosts: `Host123!`
- Guests: `Guest123!`

### Resetear solo contraseña de Admin

```bash
cd backend
npm run reset:admin
```

### Verificar datos en la base de datos

```bash
cd backend
npm run seed:check
```

---

## 🚀 Cómo Iniciar Sesión

### 1. Asegúrate de que el backend esté corriendo

```bash
cd backend
npm start
```

El backend debe estar en: `http://localhost:5000`

### 2. Asegúrate de que el frontend esté corriendo

```bash
cd frontend
npm start
```

El frontend debe estar en: `http://localhost:3000`

### 3. Accede al Login

- Ve a: `http://localhost:3000/login`
- Ingresa las credenciales de cualquier usuario de arriba
- Haz clic en "Iniciar sesión"

---

## 🔍 Solución de Problemas

### ❌ Error: "Credenciales inválidas"

**Causa:** La contraseña está incorrecta o el usuario no existe.

**Solución:**
```bash
cd backend
npm run reset:passwords
```

### ❌ Error: "Cannot connect to server"

**Causa:** El backend no está corriendo.

**Solución:**
```bash
cd backend
npm start
```

### ❌ Error: "Network Error"

**Causa:** El frontend está intentando conectarse a una URL incorrecta.

**Solución:** Verifica que el archivo `frontend/src/services/api.js` tenga:
```javascript
baseURL: 'http://localhost:5000/api'
```

---

## 📊 Datos de Prueba Disponibles

En la base de datos ya existen:

- **9 usuarios** (admin, hosts, guests)
- **11 propiedades** (algunas publicadas, algunas pendientes)
- **6 reservas** (con diferentes estados)
- **5 tipos de alojamiento**
- **12 servicios**
- **15 imágenes de propiedades**

---

## 🔄 Resetear Base de Datos Completa

Si necesitas empezar desde cero:

```bash
cd backend

# Opción 1: Limpiar todas las tablas y repoblar
npm run db:truncate
npm run seed:complete

# Opción 2: Recrear completamente la BD
npm run db:recreate
npm run seed:complete
```

**IMPORTANTE:** Después de recrear la BD, las contraseñas serán `Password123!` para todos los usuarios.

Para cambiarlas a las contraseñas fáciles de recordar:
```bash
npm run reset:passwords
```

---

## ✅ Verificación Rápida

Para probar que el login funciona correctamente con curl:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@arroyoseco.com\",\"password\":\"Admin123!\"}"
```

Deberías recibir un objeto JSON con:
- `message`: "Inicio de sesión exitoso"
- `user`: Datos del usuario
- `accessToken`: Token JWT
- `refreshToken`: Token de renovación

---

## 📱 Testing de Roles

### Como Admin
1. Login con `admin@arroyoseco.com`
2. Deberías ver en el menú:
   - Dashboard
   - Propiedades Pendientes
   - **Todas las Reservas** (nuevo en Fase 3)
   - Usuarios
   - Tipos de Alojamiento
   - Reportes

### Como Host
1. Login con `carlos.host@example.com`
2. Deberías ver en el menú:
   - Mis Propiedades
   - **Reservas Recibidas** (nuevo en Fase 3 con filtros)

### Como Guest
1. Login con `juan.guest@example.com`
2. Deberías ver en el menú:
   - Mis Reservas

---

## 🎯 Nuevas Características - Fase 3

### Badge de Reservas Pendientes
- Se muestra en la navegación (hosts y admin)
- Actualización automática cada 2 minutos
- Solo aparece si hay reservas pendientes

### Panel de Reservas Mejorado (Host)
- Estadísticas globales por estado
- Estadísticas por propiedad
- Filtros avanzados:
  - Por propiedad
  - Por estado de reserva
  - Por estado de pago
  - Por periodo (próximas, actuales, pasadas)

### Panel de Admin de Reservas
- Todas las reservas del sistema
- Búsqueda por huésped
- Filtros avanzados (incluye filtro "hoy")
- Paginación
- Estadísticas de revenue
- Tendencias mensuales

---

## 📞 Soporte

Si sigues teniendo problemas:

1. Verifica que ambos servidores estén corriendo (backend y frontend)
2. Ejecuta `npm run reset:passwords` en el backend
3. Limpia el localStorage del navegador (F12 → Application → Local Storage → Clear All)
4. Intenta con modo incógnito

---

**Creado:** Noviembre 2025
**Última Actualización:** Fase 3 - Panel de Reservas Mejorado
